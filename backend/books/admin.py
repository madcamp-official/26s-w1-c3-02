from django.contrib import admin

from .models import Book, BookFavorite, DailyCuration


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'genre_code', 'publish_date']
    search_fields = ['title', 'author']
    list_filter = ['genre_code']


@admin.register(BookFavorite)
class BookFavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'book', 'created_at']


@admin.register(DailyCuration)
class DailyCurationAdmin(admin.ModelAdmin):
    list_display = ['id', 'month', 'day', 'date_label', 'topic', 'author', 'book_title', 'created_at']
    list_filter = ['month']
    search_fields = ['topic', 'author', 'book_title']
    ordering = ['month', 'day', '-created_at']
