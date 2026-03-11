import json
import os
import psycopg2
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def send_admin_email(subject: str, html: str):
    admin_email = os.environ.get('ADMIN_EMAIL', '')
    gmail_password = os.environ.get('GMAIL_APP_PASSWORD', '')
    if not admin_email or not gmail_password:
        print('[EMAIL] ADMIN_EMAIL или GMAIL_APP_PASSWORD не заданы')
        return
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = admin_email
    msg['To'] = admin_email
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(admin_email, gmail_password.replace(' ', ''))
        server.sendmail(admin_email, admin_email, msg.as_string())
    print(f'[EMAIL] Отправлено на {admin_email}')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}

SEED_ARTICLES = [
    {
        'title': 'Почему кошки мурлычут: наука объясняет',
        'excerpt': 'Мурлыканье — не просто звук счастья. Учёные выяснили, что кошки мурлычут на частоте 25–150 Гц, которая ускоряет заживление костей.',
        'content': 'Мурлыканье кошек — одно из самых узнаваемых звуков. Частота вибраций при мурлыканье составляет от 25 до 150 Гц. Исследования показали, что именно этот диапазон стимулирует рост костной ткани и способствует заживлению ран. По сути, кошка лечит себя сама.\n\nИнтересно, что кошки мурлычут и в стрессовых ситуациях — это своеобразный механизм самоуспокоения. Котята начинают мурлыкать уже через несколько дней после рождения, общаясь с мамой во время кормления.',
        'category': 'Здоровье', 'emoji': '😸', 'author': 'Доктор Котофеев',
    },
    {
        'title': '10 признаков того, что собака вас любит',
        'excerpt': 'Собаки не могут сказать "люблю", но их тело говорит за них. Разбираем самые верные признаки собачьей привязанности.',
        'content': 'Собаки общаются с нами через язык тела.\n\nСмотрит в глаза — когда собака смотрит с нежностью, в её мозге выделяется окситоцин. Спит рядом — место сна это место безопасности. Встречает у двери — собаки помнят ваш запах и слышат шаги задолго до прихода. Приносит любимую игрушку — способ поделиться самым ценным. Ложится у ваших ног — охраняет вас и хочет быть рядом.',
        'category': 'Поведение', 'emoji': '🐕', 'author': 'Зоопсихолог Иванова',
    },
    {
        'title': 'Как правильно кормить пожилую кошку',
        'excerpt': 'После 7 лет потребности кошки в питании кардинально меняются. Рассказываем, как скорректировать рацион.',
        'content': 'Кошки считаются пожилыми после 7 лет. В этом возрасте их метаболизм замедляется.\n\nМеньше калорий, больше белка — мышечная масса с возрастом снижается. Влажный корм предпочтительнее — почки пожилых кошек работают хуже. Добавки для суставов — глюкозамин и хондроитин помогут сохранить подвижность. Дробное кормление 3–4 раза в день небольшими порциями легче переваривается.',
        'category': 'Питание', 'emoji': '🍗', 'author': 'Ветеринар Смирнова',
    },
    {
        'title': 'Зачем собаке социализация с щенячьего возраста',
        'excerpt': 'Первые 16 недель жизни щенка — критический период. Именно сейчас формируется характер на всю жизнь.',
        'content': 'Социализация — это знакомство щенка с окружающим миром: людьми, другими животными, звуками и ситуациями.\n\nКритический период длится с 3 до 16 недель. В это время мозг щенка особенно восприимчив к новому опыту. Плохо социализированные собаки часто страдают от страхов и агрессии. Знакомьте с новым постепенно, в позитивном контексте, используйте лакомства и похвалу.',
        'category': 'Воспитание', 'emoji': '🐶', 'author': 'Кинолог Петров',
    },
    {
        'title': 'Топ-5 пород кошек для квартиры',
        'excerpt': 'Не все кошки одинаково комфортно себя чувствуют в городской квартире. Рассказываем, кто лучше подходит.',
        'content': 'Выбор породы для квартиры — важное решение.\n\nБританская короткошёрстная — спокойная, независимая. Шотландская вислоухая — мягкий характер, умеренная активность. Персидская — флегматичная красавица, почти не прыгает. Русская голубая — тихая, привязанная к хозяину. Рэгдолл — расслабленная и покладистая, обожает ласку.',
        'category': 'Породы', 'emoji': '🐈', 'author': 'Редакция',
    },
]


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def schema():
    return os.environ.get('MAIN_DB_SCHEMA', 't_p83045439_pet_tracker_app')


def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """
    Новости в мире питомцев: статьи, комментарии, пользовательские истории.
    action=get_articles     — список статей
    action=get_article      — статья + комментарии (article_id)
    action=add_comment      — добавить комментарий (article_id, text, phone)
    action=submit_story     — отправить историю на модерацию (pet_name, title, story, phone)
    action=get_stories      — одобренные пользовательские истории
    action=increment_views  — увеличить счётчик просмотров (article_id)
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = body.get('action') or (event.get('queryStringParameters') or {}).get('action', '')
    s = schema()

    conn = get_db()
    cur = conn.cursor()

    # Seed articles if empty
    cur.execute(f"SELECT COUNT(*) FROM {s}.articles")
    count = cur.fetchone()[0]
    if count == 0:
        for a in SEED_ARTICLES:
            title = a['title'].replace("'", "''")
            excerpt = a['excerpt'].replace("'", "''")
            content = a['content'].replace("'", "''")
            category = a['category']
            emoji = a['emoji']
            author = a['author']
            cur.execute(
                f"INSERT INTO {s}.articles (title, excerpt, content, category, emoji, author) "
                f"VALUES ('{title}', '{excerpt}', '{content}', '{category}', '{emoji}', '{author}')"
            )
        conn.commit()

    if action == 'get_articles':
        category = body.get('category', '')
        if category and category != 'Все':
            cur.execute(
                f"SELECT id, title, excerpt, category, emoji, author, published_at, views "
                f"FROM {s}.articles WHERE is_published = TRUE AND category = '{category}' "
                f"ORDER BY published_at DESC"
            )
        else:
            cur.execute(
                f"SELECT id, title, excerpt, category, emoji, author, published_at, views "
                f"FROM {s}.articles WHERE is_published = TRUE ORDER BY published_at DESC"
            )
        rows = cur.fetchall()
        articles = [
            {'id': r[0], 'title': r[1], 'excerpt': r[2], 'category': r[3],
             'emoji': r[4], 'author': r[5], 'published_at': str(r[6]), 'views': r[7]}
            for r in rows
        ]
        cur.close()
        conn.close()
        return ok({'articles': articles})

    if action == 'get_article':
        article_id = int(body.get('article_id', 0))
        cur.execute(
            f"SELECT id, title, excerpt, content, category, emoji, author, published_at, views "
            f"FROM {s}.articles WHERE id = {article_id} AND is_published = TRUE"
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err('Статья не найдена', 404)
        article = {
            'id': row[0], 'title': row[1], 'excerpt': row[2], 'content': row[3],
            'category': row[4], 'emoji': row[5], 'author': row[6],
            'published_at': str(row[7]), 'views': row[8]
        }
        cur.execute(
            f"SELECT id, author_phone, text, created_at FROM {s}.comments "
            f"WHERE article_id = {article_id} ORDER BY created_at ASC"
        )
        comments = [
            {'id': r[0], 'author': r[1] or 'Аноним', 'text': r[2], 'created_at': str(r[3])}
            for r in cur.fetchall()
        ]
        cur.close(); conn.close()
        return ok({'article': article, 'comments': comments})

    if action == 'increment_views':
        article_id = int(body.get('article_id', 0))
        cur.execute(f"UPDATE {s}.articles SET views = views + 1 WHERE id = {article_id}")
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    if action == 'add_comment':
        article_id = int(body.get('article_id', 0))
        text = (body.get('text') or '').strip().replace("'", "''")
        phone = (body.get('phone') or 'Аноним').replace("'", "''")
        if not text or len(text) < 2:
            cur.close(); conn.close()
            return err('Комментарий слишком короткий')
        if len(text) > 500:
            cur.close(); conn.close()
            return err('Комментарий слишком длинный (макс. 500 символов)')
        cur.execute(
            f"INSERT INTO {s}.comments (article_id, author_phone, text) "
            f"VALUES ({article_id}, '{phone}', '{text}') RETURNING id, created_at"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return ok({'id': row[0], 'created_at': str(row[1]), 'author': phone, 'text': body.get('text', '')})

    if action == 'submit_story':
        pet_name = (body.get('pet_name') or '').strip().replace("'", "''")
        title = (body.get('title') or '').strip().replace("'", "''")
        story = (body.get('story') or '').strip().replace("'", "''")
        phone = (body.get('phone') or '').replace("'", "''")
        if not pet_name or not title or not story:
            cur.close(); conn.close()
            return err('Заполните все поля')
        if len(story) < 50:
            cur.close(); conn.close()
            return err('История слишком короткая (минимум 50 символов)')
        cur.execute(
            f"INSERT INTO {s}.user_stories (author_phone, pet_name, title, story) "
            f"VALUES ('{phone}', '{pet_name}', '{title}', '{story}') RETURNING id"
        )
        story_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()

        # Отправляем email-уведомление администратору
        author_display = phone[:4] + '***' + phone[-2:] if len(phone) > 6 else phone or 'Аноним'
        try:
            send_admin_email(
                subject=f'🐾 Новая история от пользователя — «{body.get("title", "")}»',
                html=f'''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1114; color: #fff; padding: 24px;">
                  <div style="border-top: 3px solid #00d4d8; padding-top: 16px; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; color: #00d4d8; margin: 0 0 4px;">🐾 PetTrack — новая история</h2>
                    <p style="color: #888; font-size: 12px; margin: 0;">Требует проверки в панели администратора</p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 12px; background: #1a1d21; color: #aaa; font-size: 12px; width: 120px;">Автор</td>
                        <td style="padding: 8px 12px; background: #1a1d21; color: #fff;">{author_display}</td></tr>
                    <tr><td style="padding: 8px 12px; color: #aaa; font-size: 12px;">Питомец</td>
                        <td style="padding: 8px 12px; color: #fff;">{body.get("pet_name", "")}</td></tr>
                    <tr><td style="padding: 8px 12px; background: #1a1d21; color: #aaa; font-size: 12px;">Заголовок</td>
                        <td style="padding: 8px 12px; background: #1a1d21; color: #fff; font-weight: bold;">{body.get("title", "")}</td></tr>
                  </table>
                  <div style="background: #1a1d21; border-left: 3px solid #00d4d8; padding: 16px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #ccc;">
                    {body.get("story", "").replace(chr(10), "<br>")}
                  </div>
                  <a href="https://pet-tracker-app.poehali.dev/admin"
                     style="display: inline-block; background: #00d4d8; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
                    Открыть панель администратора →
                  </a>
                </div>
                '''
            )
        except Exception as e:
            print(f'[EMAIL] Ошибка отправки: {e}')

        return ok({'success': True, 'id': story_id})

    if action == 'get_stories':
        cur.execute(
            f"SELECT id, author_phone, pet_name, title, story, created_at "
            f"FROM {s}.user_stories WHERE status = 'approved' ORDER BY created_at DESC"
        )
        stories = [
            {'id': r[0], 'author': r[1] or 'Аноним', 'pet_name': r[2],
             'title': r[3], 'story': r[4], 'created_at': str(r[5])}
            for r in cur.fetchall()
        ]
        cur.close(); conn.close()
        return ok({'stories': stories})

    # --- ADMIN ACTIONS ---
    def check_admin():
        token = (body.get('admin_token') or '').strip()
        return token == os.environ.get('ADMIN_TOKEN', '')

    if action == 'admin_get_stories':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        status_filter = body.get('status', 'pending')
        cur.execute(
            f"SELECT id, author_phone, pet_name, title, story, status, created_at "
            f"FROM {s}.user_stories WHERE status = '{status_filter}' ORDER BY created_at DESC"
        )
        stories = [
            {'id': r[0], 'author': r[1] or 'Аноним', 'pet_name': r[2],
             'title': r[3], 'story': r[4], 'status': r[5], 'created_at': str(r[6])}
            for r in cur.fetchall()
        ]
        cur.close(); conn.close()
        return ok({'stories': stories})

    if action == 'admin_update_story':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        story_id = int(body.get('story_id', 0))
        new_status = body.get('status', '')
        if new_status not in ('approved', 'rejected', 'pending'):
            cur.close(); conn.close()
            return err('Неверный статус')
        cur.execute(f"UPDATE {s}.user_stories SET status = '{new_status}' WHERE id = {story_id}")
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    if action == 'admin_get_articles':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        cur.execute(
            f"SELECT id, title, category, emoji, author, published_at, views, is_published "
            f"FROM {s}.articles ORDER BY published_at DESC"
        )
        articles = [
            {'id': r[0], 'title': r[1], 'category': r[2], 'emoji': r[3],
             'author': r[4], 'published_at': str(r[5]), 'views': r[6], 'is_published': r[7]}
            for r in cur.fetchall()
        ]
        cur.close(); conn.close()
        return ok({'articles': articles})

    if action == 'admin_toggle_article':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        article_id = int(body.get('article_id', 0))
        cur.execute(
            f"UPDATE {s}.articles SET is_published = NOT is_published WHERE id = {article_id} RETURNING is_published"
        )
        new_state = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True, 'is_published': new_state})

    if action == 'admin_delete_comment':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        comment_id = int(body.get('comment_id', 0))
        cur.execute(f"UPDATE {s}.comments SET text = '[удалено]' WHERE id = {comment_id}")
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    if action == 'admin_add_article':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        title = (body.get('title') or '').strip().replace("'", "''")
        excerpt = (body.get('excerpt') or '').strip().replace("'", "''")
        content = (body.get('content') or '').strip().replace("'", "''")
        category = (body.get('category') or 'Общее').replace("'", "''")
        emoji = (body.get('emoji') or '🐾').replace("'", "''")
        author = (body.get('author') or 'Редакция').replace("'", "''")
        if not title or not excerpt or not content:
            cur.close(); conn.close()
            return err('Заполните все поля')
        cur.execute(
            f"INSERT INTO {s}.articles (title, excerpt, content, category, emoji, author) "
            f"VALUES ('{title}', '{excerpt}', '{content}', '{category}', '{emoji}', '{author}') RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True, 'id': new_id})

    if action == 'admin_stats':
        if not check_admin():
            cur.close(); conn.close()
            return err('Нет доступа', 403)
        cur.execute(f"SELECT COUNT(*) FROM {s}.users")
        users_count = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {s}.articles WHERE is_published = TRUE")
        articles_count = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {s}.comments")
        comments_count = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {s}.user_stories WHERE status = 'pending'")
        pending_stories = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {s}.user_stories WHERE status = 'approved'")
        approved_stories = cur.fetchone()[0]
        cur.close(); conn.close()
        return ok({
            'users': users_count,
            'articles': articles_count,
            'comments': comments_count,
            'pending_stories': pending_stories,
            'approved_stories': approved_stories,
        })

    cur.close(); conn.close()
    return err('Неизвестное действие')