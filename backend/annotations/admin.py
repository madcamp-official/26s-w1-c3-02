from django.contrib import admin

from .models import Annotation, AnnotationFavorite, Comment, Like


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'book', 'type', 'visibility', 'is_spoiler', 'page', 'created_at']
    list_filter = ['type', 'visibility', 'is_spoiler']
    search_fields = ['passage', 'review']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'annotation', 'user', 'type', 'created_at']
    list_filter = ['type']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'target_type', 'target_id', 'created_at']
    list_filter = ['target_type']


@admin.register(AnnotationFavorite)
class AnnotationFavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'annotation', 'created_at']
