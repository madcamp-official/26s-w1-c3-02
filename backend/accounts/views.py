from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

from django.db import transaction

from annotations.models import Annotation, Like
from annotations.views import visible_to

from .kakao import fetch_kakao_profile, unique_nickname
from .models import Friend
from .serializers import (
    FriendActionSerializer,
    FriendRequestCreateSerializer,
    FriendSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserPublicSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register — 인증 불필요."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    """POST /api/auth/login — 인증 불필요."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request=request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if user is None:
            raise AuthenticationFailed('이메일 또는 비밀번호가 올바르지 않습니다.')
        access = AccessToken.for_user(user)
        return Response({
            'accessToken': str(access),
            'user': UserSerializer(user).data,
        })


class KakaoLoginView(APIView):
    """POST /api/auth/kakao — 인증 불필요. 카카오 액세스 토큰을 검증해 로그인/가입 처리."""

    permission_classes = [AllowAny]

    def post(self, request):
        kakao_access_token = request.data.get('accessToken')
        if not kakao_access_token:
            raise ValidationError('accessToken은 필수입니다.')

        profile = fetch_kakao_profile(kakao_access_token)

        with transaction.atomic():
            user = User.objects.filter(kakao_id=profile['kakao_id']).first()

            if user is None:
                email = profile['email'] or f"kakao_{profile['kakao_id']}@kakao.local"
                if profile['email'] and User.objects.filter(email=email).exists():
                    raise ValidationError('이미 가입된 이메일입니다. 이메일 로그인을 이용해주세요.')

                base_nickname = profile['nickname'] or f"카카오사용자{profile['kakao_id'][-4:]}"
                nickname = unique_nickname(User, base_nickname)

                user = User(email=email, nickname=nickname, kakao_id=profile['kakao_id'])
                user.set_unusable_password()
                user.save()

        access = AccessToken.for_user(user)
        return Response({
            'accessToken': str(access),
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    """POST /api/auth/logout 🔒 — stateless JWT, 인증 확인 후 204만 반환."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET/PATCH /api/users/me 🔒"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(instance=request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)


class UserSearchView(APIView):
    """GET /api/users?nickname= 🔒 — bare {data:[...]}, 페이지네이션 미사용."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        keyword = request.query_params.get('nickname', '').strip()
        if not keyword:
            return Response({'data': []})
        queryset = User.objects.filter(nickname__icontains=keyword).exclude(pk=request.user.pk)
        serializer = UserPublicSerializer(queryset, many=True)
        return Response({'data': serializer.data})


class UserProfileView(APIView):
    """GET /api/users/{userId} — 공개 프로필. 비로그인 허용. 통계는 뷰어에게 보이는 공개/친구공개 주석 기준."""

    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        visible = visible_to(request.user).filter(
            user_id=user_id,
            visibility__in=[Annotation.Visibility.PUBLIC, Annotation.Visibility.FRIENDS],
        )
        total_likes = Like.objects.filter(
            target_type=Like.TargetType.ANNOTATION,
            target_id__in=visible.values('id'),
        ).count()
        data = UserProfileSerializer(user).data
        data['annotationCount'] = visible.count()
        data['totalLikes'] = total_likes
        return Response(data)


class FriendListView(APIView):
    """GET /api/users/me/friends 🔒 — ACCEPTED 관계만, 상대방 시점 목록. bare {data:[...]}."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        queryset = Friend.objects.filter(
            Q(requester=me) | Q(addressee=me), status=Friend.Status.ACCEPTED,
        ).select_related('requester', 'addressee').order_by('-created_at')
        serializer = FriendSerializer(queryset, many=True, context={'me': me})
        return Response({'data': serializer.data})


class FriendRequestListView(APIView):
    """GET /api/users/me/friend-requests?direction=received|sent 🔒 — PENDING만. direction 생략 시 received."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        direction = request.query_params.get('direction', 'received')
        if direction not in ('received', 'sent'):
            raise ValidationError('direction은 received 또는 sent여야 합니다.')
        filter_kwargs = {'addressee': me} if direction == 'received' else {'requester': me}
        queryset = Friend.objects.filter(status=Friend.Status.PENDING, **filter_kwargs) \
            .select_related('requester', 'addressee').order_by('-created_at')
        serializer = FriendSerializer(queryset, many=True, context={'me': me})
        return Response({'data': serializer.data})


class FriendCreateView(APIView):
    """POST /api/friends 🔒 — 친구 요청 보내기. 역방향 PENDING이면 즉시 수락 처리."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FriendRequestCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        friend = serializer.save()
        return Response(FriendActionSerializer(friend).data)


class FriendAcceptView(APIView):
    """POST /api/friends/{userId}/accept 🔒 — addressee만 수락 가능; 아니면 404로 수렴."""

    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        friend = get_object_or_404(
            Friend, requester_id=user_id, addressee=request.user, status=Friend.Status.PENDING,
        )
        friend.status = Friend.Status.ACCEPTED
        friend.save(update_fields=['status'])
        return Response(FriendActionSerializer(friend).data)


class FriendDeleteView(APIView):
    """DELETE /api/friends/{userId} 🔒 — 요청 취소/거절/친구삭제 통합. 양쪽 당사자 모두 호출 가능."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        me = request.user
        friend = get_object_or_404(
            Friend, Q(requester=me, addressee_id=user_id) | Q(requester_id=user_id, addressee=me),
        )
        friend.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
