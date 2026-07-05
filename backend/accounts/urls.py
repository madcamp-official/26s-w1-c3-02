"""B 담당 — 인증·사용자·친구 (plan.md 3절)

구현 예정 endpoint:
  POST   auth/register
  POST   auth/login
  POST   auth/logout
  GET    users/me            PATCH users/me
  GET    users?nickname=
  GET    users/me/friends
  GET    users/me/friend-requests?direction=
  POST   friends
  POST   friends/<user_id>/accept
  DELETE friends/<user_id>
"""
from django.urls import path

from .views import LoginView, LogoutView, MeView, RegisterView, UserSearchView

urlpatterns = [
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('users/me', MeView.as_view(), name='users-me'),
    path('users', UserSearchView.as_view(), name='users-search'),
]
