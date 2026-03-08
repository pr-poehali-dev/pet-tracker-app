"""
VetBERT — AI-ветеринар для приложения PetTrack.
Отвечает на вопросы о здоровье, питании и уходе за домашними животными.
"""
import json
import os
import urllib.request


def handler(event: dict, context) -> dict:
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    messages = body.get('messages', [])
    pet_context = body.get('pet', {})

    if not messages:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Нет сообщений'})}

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'API ключ не настроен'})}

    pet_info = ''
    if pet_context:
        pet_info = (
            f"\nТекущий питомец пользователя: {pet_context.get('name', '')}, "
            f"{pet_context.get('type', '')}, {pet_context.get('breed', '')}, "
            f"возраст {pet_context.get('age', '')}, вес {pet_context.get('weight', '')}."
        )

    system_prompt = (
        "Ты VetBERT — дружелюбный AI-ветеринарный помощник в приложении PetTrack. "
        "Отвечаешь на русском языке, кратко и по делу. "
        "Помогаешь владельцам питомцев: отвечаешь на вопросы о симптомах, питании, уходе, вакцинации, поведении. "
        "Всегда рекомендуешь обратиться к ветеринару при серьёзных симптомах. "
        "Используй эмодзи умеренно. Не ставишь диагнозы — только информируешь."
        + pet_info
    )

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [{'role': 'system', 'content': system_prompt}] + messages,
        'max_tokens': 500,
        'temperature': 0.7,
    }).encode()

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())

    reply = result['choices'][0]['message']['content']
    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'reply': reply}),
    }
