from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Friend, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ['id']
    list_display = ['id', 'nickname', 'email', 'is_staff']
    search_fields = ['nickname', 'email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Profile', {'fields': ('nickname', 'bio', 'avatar_url', 'avatar_icon', 'kakao_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'nickname', 'password1', 'password2')}),
    )


@admin.register(Friend)
class FriendAdmin(admin.ModelAdmin):
    list_display = ['id', 'requester', 'addressee', 'status', 'created_at']
    list_filter = ['status']
