from django.conf import settings
from django.db import models


class AnnotationType(models.TextChoices):
    QUESTION = 'QUESTION'
    DISCUSSION = 'DISCUSSION'
    REVIEW = 'REVIEW'
    NORMAL = 'NORMAL'


class Annotation(models.Model):
    """주석 카드. passage(인용 구절)는 저작권 보호를 위해 500자 제한."""

    class Visibility(models.TextChoices):
        PUBLIC = 'public'
        FRIENDS = 'friends'
        GROUP = 'group'
        PRIVATE = 'private'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='annotations')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='annotations')
    group = models.ForeignKey(
        'groups.Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='annotations',
    )
    type = models.CharField(max_length=10, choices=AnnotationType.choices, default=AnnotationType.NORMAL)
    passage = models.CharField(max_length=500)
    review = models.TextField(blank=True, default='')
    page = models.PositiveIntegerField(null=True, blank=True)
    visibility = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC)
    is_spoiler = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'annotations'

    def __str__(self):
        return f'[{self.type}] {self.passage[:30]}'


class Comment(models.Model):
    """원글→댓글 2단 구조 (대댓글 없음)."""

    annotation = models.ForeignKey(Annotation, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    type = models.CharField(max_length=10, choices=AnnotationType.choices, default=AnnotationType.NORMAL)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'annotation_comments'

    def __str__(self):
        return f'annotation={self.annotation_id} {self.content[:30]}'


class Like(models.Model):
    """polymorphic 좋아요: target_type + target_id. 카운트 컬럼 없이 COUNT로 집계."""

    class TargetType(models.TextChoices):
        ANNOTATION = 'annotation'
        COMMENT = 'comment'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    target_id = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        constraints = [
            models.UniqueConstraint(fields=['user', 'target_type', 'target_id'], name='unique_like'),
        ]
        indexes = [
            models.Index(fields=['target_type', 'target_id'], name='idx_like_target'),
        ]

    def __str__(self):
        return f'user={self.user_id} {self.target_type}:{self.target_id}'


class AnnotationFavorite(models.Model):
    """주석 즐겨찾기. user×annotation 한 건만."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='annotation_favorites')
    annotation = models.ForeignKey(Annotation, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorite_annotations'
        constraints = [
            models.UniqueConstraint(fields=['user', 'annotation'], name='unique_annotation_favorite'),
        ]

    def __str__(self):
        return f'user={self.user_id} annotation={self.annotation_id}'
