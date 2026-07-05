from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """읽기는 모두, 쓰기는 소유자만. obj.user 또는 obj.owner를 소유자로 본다."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'owner', None)
        return owner == request.user


class IsGroupMember(BasePermission):
    """그룹 상세/피드 접근: 해당 그룹 멤버만. view가 group 객체를 obj로 넘겨야 한다."""

    def has_object_permission(self, request, view, obj):
        return obj.members.filter(user=request.user).exists()
