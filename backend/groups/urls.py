"""B 담당 — 그룹 주석방 (plan.md 3절)

구현 예정 endpoint:
  GET    users/me/groups
  POST   groups
  GET/PATCH/DELETE groups/<group_id>
  GET/POST groups/<group_id>/members     DELETE groups/<group_id>/members/<user_id>
  GET/POST groups/<group_id>/books       DELETE groups/<group_id>/books/<book_id>
  GET    groups/<group_id>/annotations   (A의 AnnotationSerializer·visible_to 재사용)
"""
from django.urls import path

urlpatterns = [
]
