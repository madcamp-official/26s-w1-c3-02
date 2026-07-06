from django.conf import settings
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
