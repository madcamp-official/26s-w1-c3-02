from django.contrib.auth import get_user_model
from rest_framework import serializers

from common.exceptions import DuplicateError

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """읽기 전용 풀 User 표현. login.user / GET,PATCH /users/me 응답에 재사용. data=로 검증하는 데는 절대 쓰지 않음."""

    avatarUrl = serializers.CharField(source='avatar_url', read_only=True)
    avatarIcon = serializers.CharField(source='avatar_icon', read_only=True)
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'nickname', 'email', 'bio', 'avatarUrl', 'avatarIcon', 'createdAt']


class RegisterSerializer(serializers.ModelSerializer):
    """POST /auth/register 전용. 응답 shape이 UserSerializer보다 작다(bio/avatar 없음)."""

    nickname = serializers.CharField(max_length=50, validators=[])
    email = serializers.EmailField(validators=[])
    password = serializers.CharField(write_only=True, min_length=8)
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'nickname', 'email', 'password', 'createdAt']
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise DuplicateError('이미 사용 중인 이메일입니다.')
        return value

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise DuplicateError('이미 사용 중인 닉네임입니다.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
        )


class LoginSerializer(serializers.Serializer):
    """모델에 매이지 않음 — 구조적 검증(필수값/형식)만. 인증 자체는 view에서 authenticate()로."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserUpdateSerializer(serializers.ModelSerializer):
    """PATCH /users/me 전용. view에서 partial=True로 호출."""

    nickname = serializers.CharField(max_length=50, required=False, validators=[])
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatarUrl = serializers.CharField(source='avatar_url', required=False, allow_blank=True, max_length=500)
    avatarIcon = serializers.CharField(source='avatar_icon', required=False, allow_blank=True, max_length=50)

    class Meta:
        model = User
        fields = ['nickname', 'password', 'bio', 'avatarUrl', 'avatarIcon']

    def validate_nickname(self, value):
        conflict = User.objects.filter(nickname=value).exclude(pk=self.instance.pk).exists()
        if conflict:
            raise DuplicateError('이미 사용 중인 닉네임입니다.')
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserPublicSerializer(serializers.ModelSerializer):
    """GET /users?nickname= 검색 결과 — id/nickname만."""

    class Meta:
        model = User
        fields = ['id', 'nickname']
