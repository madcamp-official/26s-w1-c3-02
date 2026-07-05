from rest_framework import serializers

from books.models import Book
from groups.models import Group

from .models import Annotation, Comment


class AnnotationBookSerializer(serializers.ModelSerializer):
    bookId = serializers.IntegerField(source='id', read_only=True)
    genreCode = serializers.CharField(source='genre_code', read_only=True)
    coverImageUrl = serializers.CharField(source='cover_image_url', read_only=True)

    class Meta:
        model = Book
        fields = ['bookId', 'title', 'author', 'genreCode', 'coverImageUrl']


class AnnotationAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nickname = serializers.CharField(read_only=True)


class AnnotationSerializer(serializers.ModelSerializer):
    annotationId = serializers.IntegerField(source='id', read_only=True)
    bookId = serializers.PrimaryKeyRelatedField(source='book', queryset=Book.objects.all(), write_only=True)
    groupId = serializers.PrimaryKeyRelatedField(
        source='group',
        queryset=Group.objects.all(),
        required=False,
        allow_null=True,
    )
    book = AnnotationBookSerializer(read_only=True)
    author = AnnotationAuthorSerializer(source='user', read_only=True)
    isSpoiler = serializers.BooleanField(source='is_spoiler', required=False)
    likeCount = serializers.SerializerMethodField()
    commentCount = serializers.SerializerMethodField()
    isLiked = serializers.SerializerMethodField()
    isFavorited = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Annotation
        fields = [
            'annotationId',
            'bookId',
            'book',
            'author',
            'type',
            'passage',
            'review',
            'page',
            'visibility',
            'isSpoiler',
            'groupId',
            'likeCount',
            'commentCount',
            'isLiked',
            'isFavorited',
            'createdAt',
        ]

    def get_likeCount(self, obj):
        return getattr(obj, 'like_count', 0) or 0

    def get_commentCount(self, obj):
        return getattr(obj, 'comment_count', 0) or 0

    def get_isLiked(self, obj):
        return bool(getattr(obj, 'is_liked', False))

    def get_isFavorited(self, obj):
        return bool(getattr(obj, 'is_favorited', False))

    def validate(self, attrs):
        group = attrs.get('group', getattr(self.instance, 'group', None))
        visibility = attrs.get('visibility', getattr(self.instance, 'visibility', Annotation.Visibility.PUBLIC))

        if visibility == Annotation.Visibility.GROUP and group is None:
            raise serializers.ValidationError({'groupId': 'group visibility requires groupId.'})

        return attrs


class CommentSerializer(serializers.ModelSerializer):
    commentId = serializers.IntegerField(source='id', read_only=True)
    annotationId = serializers.IntegerField(source='annotation_id', read_only=True)
    author = AnnotationAuthorSerializer(source='user', read_only=True)
    commentType = serializers.CharField(source='type', read_only=True)
    comment_type = serializers.CharField(source='type', read_only=True)
    category = serializers.CharField(source='type', read_only=True)
    commentCategory = serializers.CharField(source='type', read_only=True)
    likeCount = serializers.SerializerMethodField()
    isLiked = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'commentId',
            'annotationId',
            'author',
            'type',
            'commentType',
            'comment_type',
            'category',
            'commentCategory',
            'content',
            'likeCount',
            'isLiked',
            'createdAt',
        ]

    def get_likeCount(self, obj):
        return getattr(obj, 'like_count', 0) or 0

    def get_isLiked(self, obj):
        return bool(getattr(obj, 'is_liked', False))

    def to_internal_value(self, data):
        mutable_data = data.copy()
        for key in ('commentType', 'comment_type', 'category', 'commentCategory'):
            if not mutable_data.get('type') and mutable_data.get(key):
                mutable_data['type'] = mutable_data[key]
                break
        return super().to_internal_value(mutable_data)
