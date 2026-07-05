from django.contrib import admin

from .models import Group, GroupBook, GroupMember


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'group_name', 'owner', 'created_at']
    search_fields = ['group_name']


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'group', 'user', 'joined_at']


@admin.register(GroupBook)
class GroupBookAdmin(admin.ModelAdmin):
    list_display = ['id', 'group', 'book']
