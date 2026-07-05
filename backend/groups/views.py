from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserPublicSerializer
from annotations.models import Annotation
from annotations.serializers import AnnotationBookSerializer, AnnotationSerializer
from annotations.views import annotations_with_stats, sort_annotations
from common.permissions import IsGroupMember

from .models import Group, GroupBook, GroupMember
from .serializers import (
    GroupBookCreateSerializer,
    GroupCreateSerializer,
    GroupDetailSerializer,
    GroupListSerializer,
    GroupMemberCreateSerializer,
    GroupUpdateSerializer,
)


class MyGroupsView(APIView):
    """GET /api/users/me/groups 🔒 — 내가 속한 그룹 목록. 배열 자체 반환(스펙 mock 동작 그대로)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Group.objects.filter(members__user=request.user).select_related('owner').prefetch_related(
            Prefetch('members', queryset=GroupMember.objects.select_related('user').order_by('id')),
            Prefetch('group_books', queryset=GroupBook.objects.select_related('book').order_by('id')),
            Prefetch('annotations', queryset=Annotation.objects.only('id', 'created_at', 'group_id').order_by('-created_at')),
        ).order_by('-created_at')
        return Response(GroupListSerializer(queryset, many=True).data)


class GroupCreateView(APIView):
    """POST /api/groups 🔒 — 그룹 생성. 요청자가 owner로 고정, 항상 멤버로 자동 추가."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            group = serializer.save()
        return Response(GroupDetailSerializer(group).data, status=status.HTTP_201_CREATED)


class GroupDetailView(APIView):
    """GET/PATCH/DELETE /api/groups/{groupId} 🔒 — GET은 멤버만, PATCH/DELETE는 owner만."""

    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        return Response(GroupDetailSerializer(group).data)

    def patch(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        if group.owner_id != request.user.id:
            raise PermissionDenied('owner만 그룹 정보를 수정할 수 있습니다.')
        serializer = GroupUpdateSerializer(instance=group, data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(GroupDetailSerializer(group).data)

    def delete(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        if group.owner_id != request.user.id:
            raise PermissionDenied('owner만 그룹을 삭제할 수 있습니다.')
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupMembersView(APIView):
    """GET/POST /api/groups/{groupId}/members 🔒 — 조회는 멤버만, 초대는 owner만."""

    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        memberships = group.members.select_related('user').order_by('joined_at')
        return Response(UserPublicSerializer([m.user for m in memberships], many=True).data)

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        if group.owner_id != request.user.id:
            raise PermissionDenied('owner만 멤버를 초대할 수 있습니다.')
        serializer = GroupMemberCreateSerializer(data=request.data, context={'group': group})
        serializer.is_valid(raise_exception=True)
        member = serializer.save()
        return Response({'userId': member.user_id, 'status': 'JOINED'})


class GroupMemberDeleteView(APIView):
    """DELETE /api/groups/{groupId}/members/{userId} 🔒 — 본인=나가기(owner 불가), 타인=owner만."""

    permission_classes = [IsAuthenticated, IsGroupMember]

    def delete(self, request, group_id, user_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        if user_id == request.user.id:
            if group.owner_id == request.user.id:
                raise ValidationError('owner는 그룹을 나갈 수 없습니다. 그룹을 삭제하세요.')
        elif group.owner_id != request.user.id:
            raise PermissionDenied('멤버를 내보낼 권한이 없습니다.')
        membership = get_object_or_404(GroupMember, group=group, user_id=user_id)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupBooksView(APIView):
    """GET/POST /api/groups/{groupId}/books 🔒 — 멤버만 조회/추가 가능."""

    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        group_books = group.group_books.select_related('book').order_by('id')
        return Response(AnnotationBookSerializer([gb.book for gb in group_books], many=True).data)

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        serializer = GroupBookCreateSerializer(data=request.data, context={'group': group})
        serializer.is_valid(raise_exception=True)
        group_book = serializer.save()
        return Response({'bookId': group_book.book_id})


class GroupBookDeleteView(APIView):
    """DELETE /api/groups/{groupId}/books/{bookId} 🔒 — 멤버만 제거 가능."""

    permission_classes = [IsAuthenticated, IsGroupMember]

    def delete(self, request, group_id, book_id):
        group = get_object_or_404(Group, pk=group_id)
        self.check_object_permissions(request, group)
        group_book = get_object_or_404(GroupBook, group=group, book_id=book_id)
        group_book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupAnnotationFeedView(generics.ListAPIView):
    """GET /api/groups/{groupId}/annotations 🔒 — 그룹 멤버만. A의 annotations_with_stats(visible_to 포함)
    + AnnotationSerializer 재사용, group으로 추가 필터링."""

    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get_queryset(self):
        group = get_object_or_404(Group, pk=self.kwargs['group_id'])
        self.check_object_permissions(self.request, group)

        queryset = annotations_with_stats(self.request).filter(group=group)
        book_id = self.request.query_params.get('bookId')
        annotation_type = self.request.query_params.get('type')

        if book_id:
            queryset = queryset.filter(book_id=book_id)
        if annotation_type:
            queryset = queryset.filter(type=annotation_type)

        return sort_annotations(queryset, self.request.query_params.get('sort'))
