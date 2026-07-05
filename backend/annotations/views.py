from django.db.models import Count, Exists, IntegerField, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from rest_framework import generics, permissions

from accounts.models import Friend
from common.permissions import IsOwnerOrReadOnly
from groups.models import GroupMember

from .models import Annotation, AnnotationFavorite, Like
from .serializers import AnnotationSerializer


def visible_to(user):
    queryset = Annotation.objects.all()

    if not user.is_authenticated:
        return queryset.filter(visibility=Annotation.Visibility.PUBLIC)

    friend_ids = Friend.friend_ids_of(user)
    group_ids = GroupMember.group_ids_of(user)

    return queryset.filter(
        Q(visibility=Annotation.Visibility.PUBLIC)
        | Q(user=user)
        | Q(visibility=Annotation.Visibility.FRIENDS, user_id__in=friend_ids)
        | Q(visibility=Annotation.Visibility.GROUP, group_id__in=group_ids)
    )


def annotations_with_stats(request):
    like_counts = Like.objects.filter(
        target_type=Like.TargetType.ANNOTATION,
        target_id=OuterRef('pk'),
    ).values('target_id').annotate(count=Count('id')).values('count')[:1]

    queryset = visible_to(request.user).select_related('book', 'user', 'group').annotate(
        like_count=Coalesce(Subquery(like_counts, output_field=IntegerField()), Value(0)),
        comment_count=Count('comments', distinct=True),
    )

    if request.user.is_authenticated:
        liked = Like.objects.filter(
            user=request.user,
            target_type=Like.TargetType.ANNOTATION,
            target_id=OuterRef('pk'),
        )
        favorited = AnnotationFavorite.objects.filter(user=request.user, annotation_id=OuterRef('pk'))
        queryset = queryset.annotate(is_liked=Exists(liked), is_favorited=Exists(favorited))

    return queryset


def sort_annotations(queryset, sort):
    if sort in ('likes,desc', 'popular'):
        return queryset.order_by('-like_count', '-created_at', '-id')
    if sort == 'pageNumber':
        return queryset.order_by('page', '-created_at', '-id')
    return queryset.order_by('-created_at', '-id')


class AnnotationCreateView(generics.CreateAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return annotations_with_stats(self.request)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_url_kwarg = 'annotation_id'

    def get_queryset(self):
        return annotations_with_stats(self.request)


class BookAnnotationListView(generics.ListAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = annotations_with_stats(self.request).filter(book_id=self.kwargs['book_id'])
        annotation_type = self.request.query_params.get('type')

        if annotation_type:
            queryset = queryset.filter(type=annotation_type)

        return sort_annotations(queryset, self.request.query_params.get('sort'))

# Create your views here.
