from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import NotFound

from accounts.serializers import UserPublicSerializer
from annotations.serializers import AnnotationBookSerializer
from books.models import Book
from common.exceptions import DuplicateError

from .models import Group, GroupBook, GroupMember, GroupNotice

User = get_user_model()


class GroupListSerializer(serializers.ModelSerializer):
    """GET /users/me/groups 목록 응답. coverImageUrl/lastActivityAt은 계산 필드(모델 컬럼 아님) —
    mock-server 파생 규칙 재현: coverImageUrl=첫 GroupBook 커버, lastActivityAt=최신 Annotation.created_at,
    없으면 group.created_at. view에서 prefetch된 캐시만 사용, 추가 쿼리 없음."""

    groupId = serializers.IntegerField(source='id', read_only=True)
    groupName = serializers.CharField(source='group_name', read_only=True)
    owner = UserPublicSerializer(read_only=True)
    memberIds = serializers.SerializerMethodField()
    bookIds = serializers.SerializerMethodField()
    memberCount = serializers.SerializerMethodField()
    bookCount = serializers.SerializerMethodField()
    coverImageUrl = serializers.SerializerMethodField()
    books = serializers.SerializerMethodField()
    lastActivityAt = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Group
        fields = [
            'groupId', 'groupName', 'owner', 'memberIds', 'bookIds',
            'memberCount', 'bookCount', 'coverImageUrl', 'books', 'lastActivityAt', 'createdAt',
        ]

    def get_memberIds(self, obj):
        return [m.user_id for m in obj.members.all() if m.status == GroupMember.Status.ACCEPTED]

    def get_bookIds(self, obj):
        return [gb.book_id for gb in obj.group_books.all()]

    def get_memberCount(self, obj):
        return len([m for m in obj.members.all() if m.status == GroupMember.Status.ACCEPTED])

    def get_bookCount(self, obj):
        return len(obj.group_books.all())

    def get_coverImageUrl(self, obj):
        group_books = obj.group_books.all()
        return group_books[0].book.cover_image_url if group_books else ''

    def get_books(self, obj):
        """카드에 표지를 겹쳐 보여주기 위한 소량 미리보기(최대 5권). obj.group_books는 view에서
        이미 Prefetch(order_by id)되어 있으므로 추가 쿼리 없이 슬라이싱만 한다."""
        group_books = list(obj.group_books.all())[:5]
        return [
            {'bookId': gb.book_id, 'title': gb.book.title, 'coverImageUrl': gb.book.cover_image_url}
            for gb in group_books
        ]

    def get_lastActivityAt(self, obj):
        annotations = obj.annotations.all()
        return annotations[0].created_at if annotations else obj.created_at


class GroupDetailSerializer(serializers.ModelSerializer):
    """GET 상세, PATCH 응답, POST 생성 응답 공용 — members/books를 인라인으로 임베드."""

    groupId = serializers.IntegerField(source='id', read_only=True)
    groupName = serializers.CharField(source='group_name', read_only=True)
    owner = UserPublicSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    books = serializers.SerializerMethodField()
    notice = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Group
        fields = ['groupId', 'groupName', 'owner', 'members', 'books', 'notice', 'createdAt']

    def get_members(self, obj):
        memberships = obj.members.filter(status=GroupMember.Status.ACCEPTED).select_related('user').order_by('joined_at')
        return UserPublicSerializer([m.user for m in memberships], many=True).data

    def get_books(self, obj):
        group_books = obj.group_books.select_related('book').order_by('id')
        return AnnotationBookSerializer([gb.book for gb in group_books], many=True).data

    def get_notice(self, obj):
        notice = obj.notices.select_related('author').order_by('-created_at', '-id').first()
        return GroupNoticeSerializer(notice).data if notice else None


class GroupNoticeSerializer(serializers.ModelSerializer):
    noticeId = serializers.IntegerField(source='id', read_only=True)
    author = UserPublicSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = GroupNotice
        fields = ['noticeId', 'content', 'author', 'createdAt']


class GroupNoticeCreateSerializer(serializers.Serializer):
    content = serializers.CharField(trim_whitespace=True, max_length=2000)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('notice content is required.')
        return value.strip()

    def create(self, validated_data):
        return GroupNotice.objects.create(
            group=self.context['group'],
            author=self.context['request'].user,
            content=validated_data['content'],
        )


class GroupUpdateSerializer(serializers.ModelSerializer):
    """PATCH /groups/{groupId} 전용 — groupName만 수정. partial=True 안 씀(생략 시 혼란스러운 무변경 200 방지)."""

    groupName = serializers.CharField(source='group_name', max_length=100)

    class Meta:
        model = Group
        fields = ['groupName']


class GroupCreateSerializer(serializers.Serializer):
    """POST /groups 요청 검증 + 생성. owner=request.user(context) 고정, memberIds에 없어도 owner는
    항상 멤버로 자동 추가(unique_group_member 위반 방지를 위해 set으로 중복 제거)."""

    groupName = serializers.CharField(max_length=100)
    bookIds = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    memberIds = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

    def validate_bookIds(self, value):
        missing = set(value) - set(Book.objects.filter(pk__in=value).values_list('id', flat=True))
        if missing:
            raise serializers.ValidationError(f'존재하지 않는 도서 id: {sorted(missing)}')
        return value

    def validate_memberIds(self, value):
        missing = set(value) - set(User.objects.filter(pk__in=value).values_list('id', flat=True))
        if missing:
            raise serializers.ValidationError(f'존재하지 않는 사용자 id: {sorted(missing)}')
        return value

    def create(self, validated_data):
        owner = self.context['request'].user
        group = Group.objects.create(group_name=validated_data['groupName'], owner=owner)
        member_ids = set(validated_data.get('memberIds', [])) | {owner.id}
        GroupMember.objects.bulk_create([GroupMember(group=group, user_id=uid) for uid in member_ids])
        book_ids = set(validated_data.get('bookIds', []))
        GroupBook.objects.bulk_create([GroupBook(group=group, book_id=bid) for bid in book_ids])
        return group


class GroupMemberCreateSerializer(serializers.Serializer):
    """POST /groups/{groupId}/members 요청 검증. context={'group': group}. 호출 권한(owner-only)은 view에서 체크."""

    userId = serializers.IntegerField()

    def validate_userId(self, value):
        group = self.context['group']
        if not User.objects.filter(pk=value).exists():
            raise NotFound('존재하지 않는 사용자입니다.')
        if GroupMember.objects.filter(group=group, user_id=value).exists():
            raise DuplicateError('이미 그룹 멤버입니다.')
        return value

    def create(self, validated_data):
        return GroupMember.objects.create(
            group=self.context['group'], user_id=validated_data['userId'], status=GroupMember.Status.PENDING,
        )


class GroupInvitationSerializer(serializers.Serializer):
    """GET /users/me/group-invitations 응답 — 내가 받은 대기 중(PENDING) 그룹 초대 목록. obj=GroupMember."""

    groupId = serializers.IntegerField(source='group_id')
    groupName = serializers.CharField(source='group.group_name')
    owner = serializers.SerializerMethodField()
    memberCount = serializers.SerializerMethodField()
    invitedAt = serializers.DateTimeField(source='joined_at')

    def get_owner(self, obj):
        return UserPublicSerializer(obj.group.owner).data

    def get_memberCount(self, obj):
        return obj.group.members.filter(status=GroupMember.Status.ACCEPTED).count()


class GroupPendingMemberSerializer(serializers.Serializer):
    """GET /groups/{groupId}/invitations 응답 — owner가 보는 대기 중(PENDING) 초대 대상자 목록. obj=GroupMember."""

    userId = serializers.IntegerField(source='user_id')
    nickname = serializers.CharField(source='user.nickname')
    invitedAt = serializers.DateTimeField(source='joined_at')


class GroupBookCreateSerializer(serializers.Serializer):
    """POST /groups/{groupId}/books 요청 검증. context={'group': group}."""

    bookId = serializers.IntegerField()

    def validate_bookId(self, value):
        group = self.context['group']
        if not Book.objects.filter(pk=value).exists():
            raise NotFound('존재하지 않는 도서입니다.')
        if GroupBook.objects.filter(group=group, book_id=value).exists():
            raise DuplicateError('이미 그룹에 추가된 도서입니다.')
        return value

    def create(self, validated_data):
        return GroupBook.objects.create(group=self.context['group'], book_id=validated_data['bookId'])
