from django.conf import settings
from django.db import models


class Group(models.Model):
    """그룹 주석방. owner가 수정/삭제/내보내기 권한을 가진다."""

    group_name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'annotation_groups'

    def __str__(self):
        return self.group_name


class GroupMember(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING'
        ACCEPTED = 'ACCEPTED'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACCEPTED)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        constraints = [
            models.UniqueConstraint(fields=['group', 'user'], name='unique_group_member'),
        ]

    def __str__(self):
        return f'group={self.group_id} user={self.user_id} ({self.status})'

    @classmethod
    def group_ids_of(cls, user):
        """내가 속한(ACCEPTED) 그룹 id 목록. (인터페이스 계약 — A의 visibility=group 필터에서 사용)"""
        return cls.objects.filter(user=user, status=cls.Status.ACCEPTED).values_list('group_id', flat=True)


class GroupBook(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_books')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='group_books')

    class Meta:
        db_table = 'group_books'
        constraints = [
            models.UniqueConstraint(fields=['group', 'book'], name='unique_group_book'),
        ]

    def __str__(self):
        return f'group={self.group_id} book={self.book_id}'
