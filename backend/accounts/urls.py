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

urlpatterns = [
]
