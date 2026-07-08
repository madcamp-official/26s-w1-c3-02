import random
from datetime import datetime

from rest_framework import exceptions

from .curation_pipeline import get_or_generate_curations


def get_daily_quote(date_str):
    month, day = parse_month_day(date_str)
    curations = get_or_generate_curations(month, day, date_str)
    return serialize_curation(random.choice(curations))


def parse_month_day(date_str):
    try:
        parsed = datetime.strptime(date_str, '%Y-%m-%d')
    except (TypeError, ValueError) as exc:
        raise exceptions.ValidationError('date must be in YYYY-MM-DD format.') from exc
    return parsed.month, parsed.day


def serialize_curation(curation):
    return {
        'date': curation.date_label,
        'topic': curation.topic,
        'author': curation.author,
        'book_title': curation.book_title,
        'content': curation.content,
        'coverImageUrl': curation.cover_image_url,
        'isbn': curation.isbn,
    }
