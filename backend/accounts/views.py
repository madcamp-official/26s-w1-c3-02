from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
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
