from django.contrib import admin

from .models import Book, BookFavorite


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'genre_code', 'publish_date']
    search_fields = ['title', 'author']
    list_filter = ['genre_code']


@admin.register(BookFavorite)
class BookFavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'book', 'created_at']
