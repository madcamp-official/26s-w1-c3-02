import requests
from django.conf import settings

CATEGORIES = ('events', 'births', 'deaths', 'holidays', 'selected')


def fetch_on_this_day(month, day):
    """위키백과(영어판) On-this-day 'all' 피드를 가져온다. 타임아웃/네트워크 오류/비-200/JSON
    파싱 실패 등 모든 실패는 예외를 던지지 않고 None으로 반환한다 — 호출자는 None을
    '문학 관련 사건 0개'와 동일하게 취급하면 된다."""
    url = f"{settings.WIKIPEDIA_ONTHISDAY_BASE_URL.rstrip('/')}/all/{month:02d}/{day:02d}"
    headers = {'User-Agent': settings.WIKIPEDIA_USER_AGENT}

    try:
        response = requests.get(url, headers=headers, timeout=settings.WIKIPEDIA_REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        return None


def flatten_onthisday_items(payload):
    """events/births/deaths/holidays/selected 배열을 OpenAI 필터링 단계에 넘길 수 있도록
    {category, text, year, page_title} 형태로 평탄화한다. payload가 없으면 빈 리스트."""
    if not payload:
        return []

    items = []
    for category in CATEGORIES:
        for entry in payload.get(category) or []:
            pages = entry.get('pages') or []
            items.append({
                'category': category,
                'text': entry.get('text', ''),
                'year': entry.get('year'),
                'page_title': pages[0].get('title', '') if pages else '',
            })
    return items
