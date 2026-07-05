import json
import re
from datetime import datetime
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings
from django.core.cache import cache
from rest_framework import exceptions


QUERY_TYPES = {
    'title': 'Title',
    'author': 'Author',
    'publisher': 'Publisher',
}


def search_aladin_books(keyword, field=None, size=10, page=1):
    params = {
        'Query': keyword,
        'QueryType': QUERY_TYPES.get(field, 'Keyword'),
        'MaxResults': min(max(int(size or 10), 1), 50),
        'start': max(int(page or 1), 1),
        'SearchTarget': 'Book',
        'Cover': 'Big',
        'Output': 'JS',
        'Version': '20131101',
        'outofStockfilter': 1,
    }
    payload = call_aladin('ItemSearch.aspx', params)
    return [normalize_aladin_item(item) for item in payload.get('item', [])]


def lookup_aladin_book(isbn):
    payload = call_aladin('ItemLookUp.aspx', {
        'ItemId': isbn,
        'ItemIdType': 'ISBN13' if len(str(isbn)) == 13 else 'ISBN',
        'Cover': 'Big',
        'Output': 'JS',
        'Version': '20131101',
    })
    items = payload.get('item', [])
    return normalize_aladin_item(items[0]) if items else None


def call_aladin(path, params):
    if not settings.ALADIN_TTB_KEY:
        raise exceptions.APIException('ALADIN_TTB_KEY is not configured.')

    normalized_params = {'ttbkey': settings.ALADIN_TTB_KEY, **params}
    cache_key = f"aladin:{path}:{urlencode(sorted(normalized_params.items()))}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{settings.ALADIN_API_BASE_URL.rstrip('/')}/{path}?{urlencode(normalized_params)}"
    try:
        with urlopen(url, timeout=5) as response:
            body = response.read().decode('utf-8')
    except Exception as exc:
        raise exceptions.APIException('알라딘 도서 정보를 불러오지 못했습니다.') from exc

    payload = parse_aladin_json(body)
    cache.set(cache_key, payload, settings.ALADIN_CACHE_TTL)
    return payload


def parse_aladin_json(body):
    text = body.strip()
    if not text:
        return {}

    if not text.startswith('{'):
        match = re.search(r'\((\{.*\})\)\s*;?$', text, flags=re.S)
        if match:
            text = match.group(1)

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise exceptions.APIException('알라딘 응답 형식을 해석하지 못했습니다.') from exc


def normalize_aladin_item(item):
    isbn = item.get('isbn13') or item.get('isbn') or ''
    return {
        'title': clean_title(item.get('title', '')),
        'author': item.get('author', ''),
        'publishDate': normalize_date(item.get('pubDate') or item.get('pubdate')),
        'isbn': isbn,
        'genreCode': map_genre_code(item.get('categoryName', '')),
        'coverImageUrl': item.get('cover', ''),
        'aladinItemId': item.get('itemId'),
        'publisher': item.get('publisher', ''),
        'categoryName': item.get('categoryName', ''),
        'description': item.get('description', ''),
        'link': item.get('link', ''),
    }


def clean_title(title):
    return re.sub(r'\s+-\s+.*$', '', title or '').strip()


def normalize_date(value):
    if not value:
        return None
    for fmt in ('%Y-%m-%d', '%Y%m%d'):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    return None


def map_genre_code(category_name):
    if '소설' in category_name:
        return 'NOVEL'
    if '에세이' in category_name or '시' in category_name:
        return 'ESSAY'
    if '과학' in category_name:
        return 'SCIENCE'
    if '자기계발' in category_name:
        return 'SELF_HELP'
    if any(keyword in category_name for keyword in ('인문', '사회', '역사', '철학')):
        return 'HUMANITIES'
    return ''
