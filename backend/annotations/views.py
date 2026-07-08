from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, IntegerField, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Friend
from common.exceptions import DuplicateError
from common.permissions import IsOwnerOrReadOnly
from groups.models import GroupMember

from .models import Annotation, AnnotationFavorite, Comment, Like
from .serializers import AnnotationSerializer, CommentSerializer

User = get_user_model()


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


def comments_with_stats(request):
    like_counts = Like.objects.filter(
        target_type=Like.TargetType.COMMENT,
        target_id=OuterRef('pk'),
    ).values('target_id').annotate(count=Count('id')).values('count')[:1]

    queryset = Comment.objects.select_related('annotation', 'user').annotate(
        like_count=Coalesce(Subquery(like_counts, output_field=IntegerField()), Value(0)),
    )

    if request.user.is_authenticated:
        liked = Like.objects.filter(
            user=request.user,
            target_type=Like.TargetType.COMMENT,
            target_id=OuterRef('pk'),
        )
        queryset = queryset.annotate(is_liked=Exists(liked))

    return queryset


def sort_comments(queryset, sort):
    if sort == 'popular':
        return queryset.order_by('-like_count', '-created_at', '-id')
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
        queryset = annotations_with_stats(self.request).filter(book_id=self.kwargs['book_id']).exclude(visibility=Annotation.Visibility.GROUP)
        annotation_type = self.request.query_params.get('type')

        if annotation_type:
            queryset = queryset.filter(type=annotation_type)

        return sort_annotations(queryset, self.request.query_params.get('sort'))


class AnnotationFeedView(generics.ListAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = annotations_with_stats(self.request).exclude(visibility=Annotation.Visibility.GROUP)
        recent_hours = self.request.query_params.get('recentHours')
        scope = self.request.query_params.get('scope')
        annotation_type = self.request.query_params.get('type')

        if recent_hours:
            try:
                cutoff = timezone.now() - timedelta(hours=int(recent_hours))
                queryset = queryset.filter(created_at__gte=cutoff)
            except ValueError:
                from rest_framework.exceptions import ValidationError
                raise ValidationError('recentHours must be a number.')

        if scope == 'friends':
            if not self.request.user.is_authenticated:
                queryset = queryset.none()
            else:
                friend_ids = Friend.friend_ids_of(self.request.user)
                queryset = queryset.filter(
                    Q(user_id__in=friend_ids, visibility__in=[
                        Annotation.Visibility.PUBLIC,
                        Annotation.Visibility.FRIENDS,
                    ])
                    | Q(user=self.request.user)
                )

        if annotation_type:
            queryset = queryset.filter(type=annotation_type)

        return sort_annotations(queryset, self.request.query_params.get('sort'))


class AnnotationSearchView(generics.ListAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = annotations_with_stats(self.request).exclude(visibility=Annotation.Visibility.GROUP)
        book_id = self.request.query_params.get('bookId')
        keyword = self.request.query_params.get('keyword')
        page_number = self.request.query_params.get('pageNumber')
        annotation_type = self.request.query_params.get('type')

        if book_id:
            queryset = queryset.filter(book_id=book_id)

        if keyword:
            queryset = queryset.filter(
                Q(passage__icontains=keyword)
                | Q(review__icontains=keyword)
                | Q(book__title__icontains=keyword)
                | Q(book__author__icontains=keyword)
            )

        if page_number:
            queryset = queryset.filter(page=page_number)

        if annotation_type:
            queryset = queryset.filter(type=annotation_type)

        return sort_annotations(queryset, self.request.query_params.get('sort'))


class MyAnnotationListView(generics.ListAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = annotations_with_stats(self.request).filter(user=self.request.user)
        return sort_annotations(queryset, self.request.query_params.get('sort'))


class UserAnnotationListView(generics.ListAPIView):
    """GET /api/users/{userId}/annotations — 특정 사용자의 공개/친구공개 주석만. 비로그인 허용.

    annotations_with_stats가 이미 visible_to를 적용하므로, 결과는 '그 사용자의 PUBLIC 전체 +
    (뷰어가 친구일 때만) FRIENDS'가 된다. GROUP/PRIVATE은 어떤 뷰어에게도 노출되지 않는다.
    """

    serializer_class = AnnotationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        generics.get_object_or_404(User, pk=self.kwargs['user_id'])
        queryset = annotations_with_stats(self.request).filter(
            user_id=self.kwargs['user_id'],
            visibility__in=[Annotation.Visibility.PUBLIC, Annotation.Visibility.FRIENDS],
        )
        return sort_annotations(queryset, self.request.query_params.get('sort'))


class FavoriteAnnotationListView(generics.ListAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = annotations_with_stats(self.request).filter(favorites__user=self.request.user)
        return sort_annotations(queryset, self.request.query_params.get('sort'))


class AnnotationFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, annotation_id):
        annotation = generics.get_object_or_404(annotations_with_stats(request), pk=annotation_id)
        AnnotationFavorite.objects.get_or_create(user=request.user, annotation=annotation)
        return Response({}, status=status.HTTP_201_CREATED)

    def delete(self, request, annotation_id):
        annotation = generics.get_object_or_404(annotations_with_stats(request), pk=annotation_id)
        AnnotationFavorite.objects.filter(user=request.user, annotation=annotation).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_annotation(self):
        return generics.get_object_or_404(annotations_with_stats(self.request), pk=self.kwargs['annotation_id'])

    def get_queryset(self):
        self.get_annotation()
        queryset = comments_with_stats(self.request).filter(annotation_id=self.kwargs['annotation_id'])

        return sort_comments(queryset, self.request.query_params.get('sort'))

    def perform_create(self, serializer):
        serializer.save(annotation=self.get_annotation(), user=self.request.user)


class CommentDetailView(generics.UpdateAPIView, generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_url_kwarg = 'comment_id'

    def get_queryset(self):
        return comments_with_stats(self.request)


class LikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_type = request.data.get('targetType')
        target_id = request.data.get('targetId')
        self.validate_target(target_type, target_id, request)

        like, created = Like.objects.get_or_create(
            user=request.user,
            target_type=target_type,
            target_id=target_id,
        )
        if not created:
            raise DuplicateError('Already liked.')

        return Response(
            {
                'likeId': like.id,
                'targetType': like.target_type,
                'targetId': like.target_id,
                'createdAt': like.created_at,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request):
        target_type = request.query_params.get('targetType') or request.data.get('targetType')
        target_id = request.query_params.get('targetId') or request.data.get('targetId')
        self.validate_target(target_type, target_id, request)

        Like.objects.filter(user=request.user, target_type=target_type, target_id=target_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def validate_target(target_type, target_id, request):
        if target_type not in (Like.TargetType.ANNOTATION, Like.TargetType.COMMENT) or not target_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('targetType and targetId are required.')

        if target_type == Like.TargetType.ANNOTATION:
            generics.get_object_or_404(annotations_with_stats(request), pk=target_id)
            return

        comment = generics.get_object_or_404(Comment.objects.select_related('annotation'), pk=target_id)
        generics.get_object_or_404(annotations_with_stats(request), pk=comment.annotation_id)

# Create your views here.
