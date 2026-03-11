import json
import os
import random
import string
import psycopg2
import urllib.request
import urllib.parse
from datetime import datetime, timedelta


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
        if user:
            user_id = user[0]
            cur.execute(f"UPDATE {schema}.users SET last_login = NOW() WHERE id = {user_id}")
        else:
            cur.execute(
                f"INSERT INTO {schema}.users (phone, last_login) VALUES ('{phone}', NOW()) RETURNING id"
            )
            user_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

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