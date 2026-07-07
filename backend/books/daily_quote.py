import json
import re

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import exceptions

from .aladin import search_aladin_books


SYSTEM_PROMPT = """[Role]
너는 문학, 도서, 작가에 대한 깊은 지식을 가진 '일일 문학 큐레이터' 봇이야. 사용자가 접속한 오늘 날짜와 관련된 흥미로운 문학적 사건, 책, 작가에 대한 이야기를 발굴해 소개하는 역할을 해.

[Task]
제공된 [current_date]를 바탕으로, 해당 날짜에 일어났던 문학계의 역사적 사건(작가의 탄생/서거, 유명 작품의 첫 출판 계약, 출간일, 소설 속 배경이 된 날짜 등)을 하나 선정해 매력적인 스토리를 작성하고, 반드시 아래 [Output Format]의 JSON 구조로만 응답해줘.

[Constraints]
1. 사실 확인: 정보의 사실 여부가 매우 중요해. 정확한 연도·날짜가 확실히 기억나지 않는 사건은 절대 지어내지 마. 여러 문헌에서 반복적으로 확인되는, 잘 알려진 사실(유명 작가의 생몰년, 대표작 출간연도 등)만 사용하고, 확신이 없는 내용은 다루지 마.
2. 날짜 일치: [current_date]의 '일(day)'까지 정확히 일치한다고 확신할 수 있는 사건이 없다면, 억지로 오늘 날짜에 끼워 맞추지 말고 반드시 아래 4번 규칙(월/계절 단위 대체)을 따를 것.
3. 분량 제한: content 배열은 정확히 3개의 문자열(문장) 요소만 가질 것.
4. 톤앤매너: 독자의 호기심을 자극하면서도 지적이고 대화체(습니다체)를 사용할 것.
5. 예외 처리: 만약 해당 날짜에 뚜렷한 문학적 사건이 없다면, 그 달(Month)이나 계절과 관련된 세계적인 문학 작품의 구절이나 작가의 에피소드로 대체할 것. 대신 '오늘'과 관련되어 있지 않은 단순 책 추천의 느낌이 나도록 작성할 것.
6. 마크다운(Markdown) 코드 블록(```json ... ```)을 제외한 어떠한 서론이나 결론도 출력하지 말 것.

[Output Format]
{
  "date": "MM월 DD일",
  "topic": "오늘의 주제",
  "author": "작가 이름 (영어 이름)",
  "book_title": "관련 도서명 (원제)",
  "content": [
    "첫 번째 문장: 오늘의 날짜와 문학적 사건의 도입부",
    "두 번째 문장: 사건이나 작품에 대한 구체적인 설명",
    "세 번째 문장: 이 사건이 가지는 의미나 독자에게 건네는 마무리 인사"
  ]
}"""


def get_daily_quote(date_str):
    cache_key = f"daily-quote:{date_str}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    payload = call_openai(date_str)
    cover_book = resolve_cover_book(payload)
    payload['coverImageUrl'] = cover_book.get('coverImageUrl', '')
    payload['isbn'] = cover_book.get('isbn', '')
    payload['book_title'] = strip_parenthetical(payload.get('book_title'))
    payload['author'] = strip_parenthetical(payload.get('author'))

    cache.set(cache_key, payload, settings.OPENAI_DAILY_QUOTE_CACHE_TTL)
    return payload


def strip_parenthetical(text):
    # book_title/author는 "한국어 (영어 원제)" 형식으로 온다. 영어 표기는
    # 알라딘 표지 검색(title_search_candidates)에만 쓰고, 배너에는 한국어만 보여준다.
    return re.sub(r'\s*\([^)]*\)\s*$', '', text or '').strip()


def call_openai(date_str):
    if not settings.OPENAI_API_KEY:
        raise exceptions.APIException('OPENAI_API_KEY is not configured.')

    url = f"{settings.OPENAI_API_BASE_URL.rstrip('/')}/chat/completions"
    body = {
        'model': settings.OPENAI_MODEL,
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': f'Current_Date: {date_str}'},
        ],
        'response_format': {'type': 'json_object'},
        'temperature': 0.4,
    }
    headers = {
        'Authorization': f'Bearer {settings.OPENAI_API_KEY}',
        'Content-Type': 'application/json',
    }

    try:
        response = requests.post(url, headers=headers, json=body, timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise exceptions.APIException('Failed to load daily quote from OpenAI.') from exc

    try:
        content = response.json()['choices'][0]['message']['content']
    except (KeyError, IndexError, ValueError) as exc:
        raise exceptions.APIException('Unexpected response from OpenAI.') from exc

    return parse_openai_json(content)


def parse_openai_json(text):
    cleaned = (text or '').strip()
    match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', cleaned, flags=re.S)
    if match:
        cleaned = match.group(1)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise exceptions.APIException('Failed to parse OpenAI response.') from exc


def resolve_cover_book(payload):
    return search_book_by_title(payload.get('book_title') or '')


def search_book_by_title(book_title):
    for keyword in title_search_candidates(book_title):
        try:
            results = search_aladin_books(keyword=keyword, field='title', size=1)
        except exceptions.APIException:
            continue
        if results:
            return results[0]

    return {}


def title_search_candidates(book_title):
    # book_title은 "한국어 제목 (영어 원제)" 형식으로 온다. 알라딘 카탈로그는
    # 한국어 제목으로만 검색되는 경우가 많으므로 한국어를 먼저 시도하고,
    # 결과가 없으면 괄호 안 영어 원제로 재시도한다.
    match = re.match(r'^(.*?)\s*\(([^)]+)\)\s*$', book_title or '')
    if not match:
        return [book_title] if book_title else []

    korean, english = match.group(1).strip(), match.group(2).strip()
    return [candidate for candidate in (korean, english) if candidate]
