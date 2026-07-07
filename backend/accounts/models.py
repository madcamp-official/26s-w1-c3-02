from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager

# avatar_icon에 저장 가능한 값 — frontend/src/utils/avatarIcons.js의 AVATAR_ICON_OPTIONS와 반드시 동기화할 것.
AVATAR_ICON_KEYS = frozenset({
    'reader', 'cat', 'fox', 'bear', 'rabbit', 'owl', 'star', 'plant', 'coffee', 'moon',
})


class User(AbstractUser):
    """로그인 필드는 email, 표시 이름은 nickname (api-spec User 객체 기준)."""

    username = None
    first_name = None
    last_name = None

    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, unique=True)
    bio = models.TextField(blank=True, default='')
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    avatar_icon = models.CharField(max_length=50, blank=True, default='')
    kakao_id = models.CharField(max_length=64, unique=True, null=True, blank=True, default=None)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nickname']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.nickname


class Friend(models.Model):
    """단방향 요청 → 수락 시 양방향 친구로 취급. (requester, addressee) 쌍은 한 건만."""

    class Status(models.TextChoices):
        PENDING = 'PENDING'
        ACCEPTED = 'ACCEPTED'

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_friend_requests')
    addressee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_friend_requests')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'friends'
        constraints = [
            models.UniqueConstraint(fields=['requester', 'addressee'], name='unique_friend_pair'),
        ]

    def __str__(self):
        return f'{self.requester_id}->{self.addressee_id} ({self.status})'

    @classmethod
    def friend_ids_of(cls, user):
        """ACCEPTED 상태인 친구의 user id 목록. (인터페이스 계약 — A의 visibility 필터에서 사용)"""
        sent = cls.objects.filter(requester=user, status=cls.Status.ACCEPTED).values_list('addressee_id', flat=True)
        received = cls.objects.filter(addressee=user, status=cls.Status.ACCEPTED).values_list('requester_id', flat=True)
        return sent.union(received)
