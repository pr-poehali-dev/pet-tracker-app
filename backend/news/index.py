import json
import os
import psycopg2
from datetime import datetime

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

    cur.close(); conn.close()
    return err('Неизвестное действие')
