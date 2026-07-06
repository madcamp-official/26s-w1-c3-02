"""B 담당 — 그룹 주석방 (plan.md 3절)

구현 완료 (Day 4-5):
  GET    users/me/groups
  POST   groups
  GET/PATCH/DELETE groups/<group_id>
  GET/POST groups/<group_id>/members     DELETE groups/<group_id>/members/<user_id>
  GET/POST groups/<group_id>/books       DELETE groups/<group_id>/books/<book_id>
  GET    groups/<group_id>/annotations   (A의 AnnotationSerializer·visible_to 재사용)
"""
from django.urls import path

from .views import (
    GroupAnnotationFeedView,
    GroupBookDeleteView,
    GroupBooksView,
    GroupCreateView,
    GroupDetailView,
    GroupInvitationAcceptView,
    GroupInvitationListView,
    GroupMemberDeleteView,
    GroupMembersView,
    GroupPendingInvitesView,
    MyGroupsView,
)

urlpatterns = [
    path('users/me/groups', MyGroupsView.as_view(), name='my-groups'),
    path('users/me/group-invitations', GroupInvitationListView.as_view(), name='my-group-invitations'),
    path('groups', GroupCreateView.as_view(), name='groups-create'),
    path('groups/<int:group_id>', GroupDetailView.as_view(), name='group-detail'),
    path('groups/<int:group_id>/members', GroupMembersView.as_view(), name='group-members'),
    path('groups/<int:group_id>/members/<int:user_id>', GroupMemberDeleteView.as_view(), name='group-member-delete'),
    path('groups/<int:group_id>/members/<int:user_id>/accept', GroupInvitationAcceptView.as_view(), name='group-member-accept'),
    path('groups/<int:group_id>/invitations', GroupPendingInvitesView.as_view(), name='group-pending-invites'),
    path('groups/<int:group_id>/books', GroupBooksView.as_view(), name='group-books'),
    path('groups/<int:group_id>/books/<int:book_id>', GroupBookDeleteView.as_view(), name='group-book-delete'),
    path('groups/<int:group_id>/annotations', GroupAnnotationFeedView.as_view(), name='group-annotation-feed'),
]
