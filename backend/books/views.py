from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import DuplicateError

from .models import Book, BookFavorite
from .serializers import BookSerializer


def books_with_stats(request):
    queryset = Book.objects.annotate(annotation_count=Count('annotations', distinct=True))

    if request.user.is_authenticated:
        favorites = BookFavorite.objects.filter(user=request.user, book_id=OuterRef('pk'))
        queryset = queryset.annotate(is_favorited=Exists(favorites))

    return queryset


class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = books_with_stats(self.request)
        keyword = self.request.query_params.get('keyword')
        genre_code = self.request.query_params.get('genreCode')

        if keyword:
            queryset = queryset.filter(Q(title__icontains=keyword) | Q(author__icontains=keyword))

        if genre_code:
            queryset = queryset.filter(genre_code=genre_code)

        if self.request.query_params.get('sort') == 'popular':
            return queryset.order_by('-annotation_count', 'title', 'id')

        return queryset.order_by('title', 'id')

    def perform_create(self, serializer):
        isbn = serializer.validated_data.get('isbn')
        if isbn and Book.objects.filter(isbn=isbn).exists():
            raise DuplicateError('Book with same ISBN already exists.')

        serializer.save()


class BookRecommendationView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        size = max(int(self.request.query_params.get('size', 10)), 1)
        return books_with_stats(self.request).annotate(
            favorite_count=Count('favorites', distinct=True),
        ).order_by('-annotation_count', '-favorite_count', 'title', 'id')[:size]


class BookDetailView(generics.RetrieveAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    lookup_url_kwarg = 'book_id'

    def get_queryset(self):
        return books_with_stats(self.request)


class BookFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        book = generics.get_object_or_404(Book, pk=book_id)
        BookFavorite.objects.get_or_create(user=request.user, book=book)
        return Response({}, status=status.HTTP_201_CREATED)

    def delete(self, request, book_id):
        book = generics.get_object_or_404(Book, pk=book_id)
        BookFavorite.objects.filter(user=request.user, book=book).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteBookListView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return books_with_stats(self.request).filter(favorites__user=self.request.user).order_by(
            '-favorites__created_at',
            'id',
        )

# Create your views here.
