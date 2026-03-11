import json
import os
import random
import string
import psycopg2
import urllib.request
import urllib.parse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta


def send_admin_email(subject: str, html: str):
    admin_email = os.environ.get('ADMIN_EMAIL', '')
    gmail_password = os.environ.get('GMAIL_APP_PASSWORD', '')
    if not admin_email or not gmail_password:
        return
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = admin_email
    msg['To'] = admin_email
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(admin_email, gmail_password.replace(' ', ''))
        server.sendmail(admin_email, admin_email, msg.as_string())
    print(f'[EMAIL] Уведомление отправлено на {admin_email}')


def send_sms(phone: str, code: str) -> bool:
    api_id = os.environ.get('SMSRU_API_ID', '')
    if not api_id:
        print(f"[AUTH] SMSRU_API_ID не задан, OTP для {phone}: {code}")
        return True

    # Убираем + из номера для sms.ru
    phone_clean = phone.lstrip('+')
    message = f"Ваш код входа в PetTrack: {code}. Действителен 5 минут."
    params = urllib.parse.urlencode({
        'api_id': api_id,
        'to': phone_clean,
        'msg': message,
        'json': 1,
    })
    url = f"https://sms.ru/sms/send?{params}"
    req = urllib.request.urlopen(url, timeout=10)
    resp = json.loads(req.read().decode())
    print(f"[AUTH] sms.ru response: {resp}")
    return resp.get('status') == 'OK'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def s():
    return os.environ.get('MAIN_DB_SCHEMA', 't_p83045439_pet_tracker_app')

def handler(event: dict, context) -> dict:
    """
    Авторизация по номеру телефона через OTP-код.
    action=send   — отправить OTP на номер телефона
    action=verify — проверить OTP и вернуть токен
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = body.get('action', '')
    schema = s()

    # --- Отправка OTP ---
    if action == 'send':
        phone = (body.get('phone') or '').strip()
        if not phone or len(phone) < 10:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Некорректный номер телефона'})
            }

        code = ''.join(random.choices(string.digits, k=6))
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {schema}.otp_codes WHERE phone = '{phone}' AND used = FALSE")
        cur.execute(
            f"INSERT INTO {schema}.otp_codes (phone, code, expires_at) "
            f"VALUES ('{phone}', '{code}', '{expires_at}')"
        )
        conn.commit()
        cur.close()
        conn.close()

        sms_sent = send_sms(phone, code)
        if not sms_sent:
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Не удалось отправить SMS, попробуйте позже'})
            }

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'success': True})
        }

    # --- Верификация OTP ---
    if action == 'verify':
        phone = (body.get('phone') or '').strip()
        code = (body.get('code') or '').strip()

        if not phone or not code:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Укажите телефон и код'})
            }

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, expires_at, used FROM {schema}.otp_codes "
            f"WHERE phone = '{phone}' AND code = '{code}' "
            f"ORDER BY created_at DESC LIMIT 1"
        )
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Неверный код'})
            }

        otp_id, expires_at, used = row

        if used:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Код уже использован'})
            }

        if datetime.utcnow() > expires_at:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Код истёк, запросите новый'})
            }

        cur.execute(f"UPDATE {schema}.otp_codes SET used = TRUE WHERE id = {otp_id}")

        cur.execute(f"SELECT id FROM {schema}.users WHERE phone = '{phone}'")
        user = cur.fetchone()
        is_new = False
        if user:
            user_id = user[0]
            cur.execute(f"UPDATE {schema}.users SET last_login = NOW() WHERE id = {user_id}")
        else:
            cur.execute(
                f"INSERT INTO {schema}.users (phone, last_login) VALUES ('{phone}', NOW()) RETURNING id"
            )
            user_id = cur.fetchone()[0]
            is_new = True

        # Считаем общее число пользователей для письма
        cur.execute(f"SELECT COUNT(*) FROM {schema}.users")
        total_users = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        if is_new:
            phone_display = phone[:4] + '***' + phone[-2:] if len(phone) > 6 else phone
            try:
                send_admin_email(
                    subject=f'👤 Новый пользователь PetTrack — {phone_display}',
                    html=f'''
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1114; color: #fff; padding: 24px;">
                      <div style="border-top: 3px solid #0078d4; padding-top: 16px; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; color: #0078d4; margin: 0 0 4px;">👤 Новая регистрация</h2>
                        <p style="color: #888; font-size: 12px; margin: 0;">PetTrack — система трекинга питомцев</p>
                      </div>
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 10px 14px; background: #1a1d21; color: #aaa; font-size: 12px; width: 140px;">Телефон</td>
                          <td style="padding: 10px 14px; background: #1a1d21; color: #fff; font-size: 15px; font-weight: bold;">{phone_display}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 14px; color: #aaa; font-size: 12px;">ID пользователя</td>
                          <td style="padding: 10px 14px; color: #00d4d8;">#{user_id}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 14px; background: #1a1d21; color: #aaa; font-size: 12px;">Дата регистрации</td>
                          <td style="padding: 10px 14px; background: #1a1d21; color: #fff;">{datetime.utcnow().strftime('%d.%m.%Y %H:%M')} UTC</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 14px; color: #aaa; font-size: 12px;">Всего пользователей</td>
                          <td style="padding: 10px 14px; color: #ff8c00; font-size: 18px; font-weight: bold;">{total_users}</td>
                        </tr>
                      </table>
                      <a href="https://pet-tracker-app.poehali.dev/admin"
                         style="display: inline-block; background: #0078d4; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
                        Открыть панель администратора →
                      </a>
                    </div>
                    '''
                )
            except Exception as e:
                print(f'[EMAIL] Ошибка отправки: {e}')

        import base64
        token = base64.b64encode(f"{user_id}:{phone}:{datetime.utcnow().date()}".encode()).decode()

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'success': True, 'token': token, 'user_id': user_id, 'phone': phone})
        }

    return {
        'statusCode': 400,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': 'Укажите action: send или verify'})
    }