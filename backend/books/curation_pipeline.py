import json
import logging
import re

import requests
from django.conf import settings
from django.db import transaction
from rest_framework import exceptions

from .aladin import search_aladin_books
from .models import DailyCuration
from .wikipedia_onthisday import fetch_on_this_day, flatten_onthisday_items

logger = logging.getLogger(__name__)


STEP1_SYSTEM_PROMPT = """[Role]
너는 위키백과(Wikipedia) "오늘의 사건(On this day)" 데이터에서 문학 관련 항목만 골라내는 필터 봇이야.

[Task]
[wiki_items]로 제공되는 항목 목록(각 항목은 category, text, year, page_title 필드를 가짐) 중에서, 문학·도서·작가·시·출판·문학상과 직접 관련된 항목만 선택해.

[Constraints]
1. 반드시 [wiki_items]에 실제로 존재하는 항목만 선택할 것. 목록에 없는 사건, 인물, 책을 절대로 새로 지어내거나 추가하지 마.
2. 선택한 항목의 text·year·category·page_title 값은 입력받은 원문 그대로 복사할 것(요약·의역·수정 금지).
3. 인물이 소설가·시인·극작가·평론가·번역가이거나, 사건이 문학 작품의 출간·수상·필화 사건 등이면 포함하고, 정치·과학·스포츠·전쟁 등 문학과 무관한 항목은 제외할 것.
4. 문학 관련 여부가 애매한 항목은 제외할 것(과다 포함보다 과소 포함이 안전함).
5. 마크다운(Markdown) 코드 블록(```json ... ```)을 제외한 어떠한 서론이나 결론도 출력하지 말 것.

[Output Format]
{
  "selected": [
    {"category": "events|births|deaths|holidays|selected", "text": "원문 그대로", "year": 1900, "page_title": "원문 그대로"}
  ]
}
문학 관련 항목이 하나도 없으면 "selected": [] 로 응답할 것."""


STEP2_SYSTEM_PROMPT = """[Role]
너는 문학, 도서, 작가에 대한 깊은 지식을 가진 '일일 문학 큐레이터' 봇이야. 사용자가 접속한 오늘 날짜와 관련된 흥미로운 문학적 사건, 책, 작가에 대한 이야기를 발굴해 소개하는 역할을 해.

[Task]
[current_date]와 [verified_events](위키백과에서 검증된, 그날 실제로 일어난 문학 관련 사건 목록)를 참고해서, 서로 다른 주제·작가·책을 다루는 배너를 정확히 [batch_size]개 작성하고, 반드시 아래 [Output Format]의 JSON 구조로만 응답해줘.

[Constraints]
1. 사실 확인: 정보의 사실 여부가 매우 중요해. [verified_events]에 없는 사건·연도·날짜를 지어내지 마. [verified_events]의 항목에 기반해 배너를 작성할 때는 그 항목의 text·year에 명시된 사실만 사용하고 임의로 살을 붙이지 마.
2. 사건-배너 매칭: [verified_events]가 비어있지 않다면, 반드시 각 항목마다 정확히 1개의 배너를 작성할 것(하나의 사건 = 하나의 배너, 총 [batch_size]개 = [verified_events]의 개수). 이 경우 절대로 5번 규칙(대체 배너)을 섞어 쓰지 말 것 — 모든 배너가 실제 사건에 기반해야 함.
3. 분량: 각 배너의 content 배열은 도입-설명-마무리가 자연스럽게 이어지는 하나의 짧은 이야기가 되도록 작성하고, 문장 단위로 나눠 배열 요소로 담을 것. 문장 개수를 억지로 맞추지 말고, 내용을 풀어내는 데 필요한 만큼(대략 4~6문장)만 자연스럽게 쓸 것.
4. 톤앤매너: 독자의 감성과 호기심을 자극하는 부드럽고 다정한 에세이 톤을 사용할 것. 딱딱하고 건조한 사실 나열을 피하고, 서정적인 묘사와 은유를 더해 마치 따뜻한 대화를 건네는 듯한 문학적인 대화체(습니다체)를 사용할 것.
5. 예외 처리(대체 배너): [verified_events]가 완전히 비어 있는 경우(위키백과 조회 실패 또는 그날 문학 사건이 하나도 없는 경우)에만, 오늘 날짜의 월(Month)이나 계절과 관련된 세계적인 문학 작품의 구절이나 작가의 에피소드로 총 [batch_size]개의 배너를 대체 작성할 것. 이 경우 '오늘'과 정확히 연결된 사건인 것처럼 쓰지 말고, 계절감이 있는 단순 책 추천의 느낌이 나도록 작성할 것.
6. 중복 방지: [batch_size]개의 배너는 서로 다른 topic·author·book_title을 다뤄야 해. 같은 작가나 같은 책을 두 번 이상 등장시키지 마.
7. 마크다운(Markdown) 코드 블록(```json ... ```)을 제외한 어떠한 서론이나 결론도 출력하지 말 것.

[Output Format]
{
  "curations": [
    {
      "date": "MM월 DD일",
      "topic": "오늘의 주제",
      "author": "작가 이름 (영어 이름)",
      "book_title": "관련 도서명 (원제)",
      "content": [
        "오늘의 날짜와 문학적 사건을 자연스럽게 소개하는 문장에서 시작해서,",
        "사건이나 작품을 구체적으로 설명하고,",
        "그 의미를 짚으며 독자에게 건네는 마무리로 끝나는 흐름으로, 필요한 만큼의 문장을 이어서 작성"
      ],
      "source_event": "이 배너의 근거가 된 verified_events 항목의 text (대체 배너인 경우 빈 문자열)"
    }
  ]
}
curations 배열에는 위 형식의 객체가 정확히 [batch_size]개 포함되어야 합니다."""


def get_or_generate_curations(month, day, date_str):
    existing = list(DailyCuration.objects.filter(month=month, day=day))
    if existing:
        return existing
    return generate_curations(month, day, date_str)


def generate_curations(month, day, date_str):
    wiki_payload = fetch_on_this_day(month, day)
    items = flatten_onthisday_items(wiki_payload)

    try:
        verified_events = select_literary_events(items)
    except exceptions.APIException:
        logger.warning('Step1 literary-event filter failed; falling back to month/season-only batch.', exc_info=True)
        verified_events = []

    # 사건이 배치 상한보다 많으면 그만큼만 사용(1사건=1배너 원칙 유지, 상한은 넘지 않음).
    verified_events = verified_events[:settings.DAILY_CURATION_BATCH_SIZE]

    raw_curations = curate_batch(date_str, verified_events, settings.DAILY_CURATION_BATCH_SIZE)
    rows = build_curation_rows(month, day, raw_curations)

    with transaction.atomic():
        DailyCuration.objects.bulk_create(rows)

    return rows


def select_literary_events(items):
    if not items:
        return []

    user_content = json.dumps({'wiki_items': items}, ensure_ascii=False)
    result = call_openai_json(STEP1_SYSTEM_PROMPT, user_content, temperature=0.0, timeout=60)
    selected = result.get('selected', []) if isinstance(result, dict) else []

    valid_texts = {item['text'] for item in items}
    return [entry for entry in selected if isinstance(entry, dict) and entry.get('text') in valid_texts]


def curate_batch(date_str, verified_events, batch_size):
    # 검증된 사건이 있으면 사건 개수만큼만(=1사건당 1배너), 하나도 없을 때만 batch_size개를
    # 계절/월 대체 배너로 채운다. 즉 실제 사건이 있는 날은 절대 대체 배너를 섞지 않는다.
    target_count = len(verified_events) if verified_events else batch_size
    user_content = json.dumps(
        {'current_date': date_str, 'batch_size': target_count, 'verified_events': verified_events},
        ensure_ascii=False,
    )
    result = call_openai_json(STEP2_SYSTEM_PROMPT, user_content, temperature=0.6, timeout=60)
    curations = result.get('curations') if isinstance(result, dict) else None
    if not isinstance(curations, list) or not curations:
        raise exceptions.APIException('OpenAI curation batch response missing "curations" list.')
    return curations


def call_openai_json(system_prompt, user_content, *, temperature, timeout):
    if not settings.OPENAI_API_KEY:
        raise exceptions.APIException('OPENAI_API_KEY is not configured.')

    url = f"{settings.OPENAI_API_BASE_URL.rstrip('/')}/chat/completions"
    body = {
        'model': settings.OPENAI_MODEL,
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_content},
        ],
        'response_format': {'type': 'json_object'},
        'temperature': temperature,
    }
    headers = {
        'Authorization': f'Bearer {settings.OPENAI_API_KEY}',
        'Content-Type': 'application/json',
    }

    try:
        response = requests.post(url, headers=headers, json=body, timeout=timeout)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise exceptions.APIException('Failed to reach OpenAI.') from exc

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


def validate_curation_item(item):
    if not isinstance(item, dict):
        raise exceptions.APIException('Malformed curation item from OpenAI.')
    for key in ('date', 'topic', 'author', 'book_title', 'content'):
        if not item.get(key):
            raise exceptions.APIException(f'Curation item missing required field: {key}.')
    content = item['content']
    if not (isinstance(content, list) and 1 <= len(content) <= 8 and all(isinstance(s, str) and s for s in content)):
        raise exceptions.APIException('Curation item content must be a non-empty list of 1-8 strings.')


def build_curation_rows(month, day, raw_curations):
    for raw in raw_curations:
        validate_curation_item(raw)

    rows = []
    for raw in raw_curations:
        cover = resolve_cover_book(raw)
        rows.append(DailyCuration(
            month=month,
            day=day,
            date_label=raw.get('date') or f'{month:02d}월 {day:02d}일',
            topic=raw['topic'],
            author=strip_parenthetical(raw.get('author')),
            book_title=strip_parenthetical(raw.get('book_title')),
            content=raw['content'],
            cover_image_url=cover.get('coverImageUrl', ''),
            isbn=cover.get('isbn', ''),
            source_event=raw.get('source_event') or '',
        ))
    return rows


def strip_parenthetical(text):
    # book_title/author는 "한국어 (영어 원제)" 형식으로 온다. 영어 표기는
    # 알라딘 표지 검색(title_search_candidates)에만 쓰고, 배너에는 한국어만 보여준다.
    return re.sub(r'\s*\([^)]*\)\s*$', '', text or '').strip()


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
