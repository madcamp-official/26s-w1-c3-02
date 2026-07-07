"""A 담당 — 주석·댓글·좋아요·즐겨찾기·피드·검색 (plan.md 3절)

구현 예정 endpoint:
  GET    annotations/feed
  GET    annotations/search
  POST   annotations
  GET/PATCH/DELETE annotations/<annotation_id>
  GET    books/<book_id>/annotations
  POST/DELETE annotations/<annotation_id>/favorite
  GET    users/me/annotations
  GET    users/me/favorite-annotations
  GET/POST annotations/<annotation_id>/comments
  PATCH/DELETE comments/<comment_id>
  POST   likes    DELETE likes?targetType=&targetId=
"""
from django.urls import path

from .views import (
    AnnotationCreateView,
    AnnotationDetailView,
    AnnotationFavoriteView,
    AnnotationFeedView,
    AnnotationSearchView,
    BookAnnotationListView,
    CommentDetailView,
    CommentListCreateView,
    FavoriteAnnotationListView,
    LikeView,
    MyAnnotationListView,
    UserAnnotationListView,
)

urlpatterns = [
    path('annotations/feed', AnnotationFeedView.as_view(), name='annotation-feed'),
    path('annotations/search', AnnotationSearchView.as_view(), name='annotation-search'),
    path('annotations', AnnotationCreateView.as_view(), name='annotation-create'),
    path('annotations/<int:annotation_id>', AnnotationDetailView.as_view(), name='annotation-detail'),
    path('books/<int:book_id>/annotations', BookAnnotationListView.as_view(), name='book-annotation-list'),
    path('annotations/<int:annotation_id>/favorite', AnnotationFavoriteView.as_view(), name='annotation-favorite'),
    path('users/me/annotations', MyAnnotationListView.as_view(), name='my-annotation-list'),
    path('users/<int:user_id>/annotations', UserAnnotationListView.as_view(), name='user-annotation-list'),
    path('users/me/favorite-annotations', FavoriteAnnotationListView.as_view(), name='favorite-annotation-list'),
    path('annotations/<int:annotation_id>/comments', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:comment_id>', CommentDetailView.as_view(), name='comment-detail'),
    path('likes', LikeView.as_view(), name='like'),
]
