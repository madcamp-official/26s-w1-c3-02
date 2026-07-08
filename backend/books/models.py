from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publish_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=20, blank=True, default='')
    genre_code = models.CharField(max_length=255, blank=True, default='')
    cover_image_url = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'books'

    def __str__(self):
        return f'{self.title} — {self.author}'


class BookFavorite(models.Model):
    """책 북마크. user×book 한 건만."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='book_favorites')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorite_books'
        constraints = [
            models.UniqueConstraint(fields=['user', 'book'], name='unique_book_favorite'),
        ]

    def __str__(self):
        return f'user={self.user_id} book={self.book_id}'


class DailyCuration(models.Model):
    """일일 문학 큐레이션 배너. 위키백과 On-this-day 데이터 + OpenAI 2단계 파이프라인으로 생성.
    month/day(연도 무관)로 캐싱되어 매년 같은 날짜에 재사용된다."""

    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    day = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(31)])
    date_label = models.CharField(max_length=20)
    topic = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    book_title = models.CharField(max_length=255)
    content = models.JSONField(default=list)
    cover_image_url = models.CharField(max_length=500, blank=True, default='')
    isbn = models.CharField(max_length=20, blank=True, default='')
    source_event = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'daily_curations'
        indexes = [
            models.Index(fields=['month', 'day'], name='daily_curation_month_day_idx'),
        ]

    def __str__(self):
        return f'{self.month:02d}/{self.day:02d} — {self.topic}'
