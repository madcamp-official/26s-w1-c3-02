"""A 담당 — 도서·책 북마크 (plan.md 3절)

구현 예정 endpoint:
  GET/POST books
  GET    books/recommendations
  GET    books/<book_id>
  POST/DELETE books/<book_id>/favorite
  GET    users/me/favorite-books
"""
from django.urls import path

from .views import (
    BookDetailView,
    BookFavoriteView,
    BookListCreateView,
    BookRecommendationView,
    FavoriteBookListView,
)

urlpatterns = [
    path('books', BookListCreateView.as_view(), name='book-list-create'),
    path('books/recommendations', BookRecommendationView.as_view(), name='book-recommendations'),
    path('books/<int:book_id>', BookDetailView.as_view(), name='book-detail'),
    path('books/<int:book_id>/favorite', BookFavoriteView.as_view(), name='book-favorite'),
    path('users/me/favorite-books', FavoriteBookListView.as_view(), name='favorite-book-list'),
]
