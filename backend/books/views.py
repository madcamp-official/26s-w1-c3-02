from datetime import timedelta

from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import DuplicateError

from .aladin import lookup_aladin_book, search_aladin_books
from .daily_quote import get_daily_quote
from .models import Book, BookFavorite
from .serializers import BookSerializer


BOOK_ROOT_CATEGORIES = {
    '국내도서',
    '외국도서',
    'Domestic Books',
    'Foreign Books',
}
FICTION_LARGE_CATEGORY = '소설/시/희곡'


def split_category(category):
    return [part.strip() for part in str(category or '').split('>') if part.strip()]


def get_book_category_group(category):
    parts = split_category(category)

    if parts and parts[0] in BOOK_ROOT_CATEGORIES:
        parts = parts[1:]

    if not parts:
        return ''

    large_category = parts[0]
    if large_category == FICTION_LARGE_CATEGORY and len(parts) > 1:
        return parts[1]

    return large_category


def books_with_stats(request):
    recent_hours = request.query_params.get('recentHours')
    annotation_filter = Q()

    if recent_hours:
        try:
            hours = float(recent_hours)
            if hours <= 0:
                raise ValueError
        except (TypeError, ValueError):
            raise exceptions.ValidationError('recentHours must be a positive number.')

        cutoff = timezone.now() - timedelta(hours=hours)
        annotation_filter = Q(annotations__created_at__gte=cutoff)

    queryset = Book.objects.annotate(
        annotation_count=Count('annotations', filter=annotation_filter, distinct=True),
    )

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
        search_field = self.request.query_params.get('field')
        genre_code = self.request.query_params.get('genreCode')
        category_group = self.request.query_params.get('categoryGroup')

        if keyword:
            if search_field == 'author':
                queryset = queryset.filter(author__icontains=keyword)
            elif search_field == 'title':
                queryset = queryset.filter(title__icontains=keyword)
            else:
                queryset = queryset.filter(Q(title__icontains=keyword) | Q(author__icontains=keyword))

        if genre_code:
            queryset = queryset.filter(genre_code=genre_code)

        if category_group:
            queryset = queryset.filter(genre_code__icontains=category_group)

        sort = self.request.query_params.get('sort')

        if sort in ('popular', 'recentAnnotations'):
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


class BookCategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        counts = {}

        for genre_code in Book.objects.exclude(genre_code='').values_list('genre_code', flat=True):
            category = get_book_category_group(genre_code)
            if category:
                counts[category] = counts.get(category, 0) + 1

        categories = [
            {'label': label, 'value': label, 'count': count}
            for label, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:5]
        ]

        return Response({'data': categories})


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


class AladinBookSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        keyword = request.query_params.get('keyword') or request.query_params.get('q')
        if not keyword:
            raise exceptions.ValidationError('keyword is required.')

        results = search_aladin_books(
            keyword=keyword,
            field=request.query_params.get('field'),
            size=request.query_params.get('size', 10),
            page=request.query_params.get('page', 1),
        )
        return Response({'data': results})


class AladinBookImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        isbn = request.data.get('isbn')
        if not isbn:
            raise exceptions.ValidationError('isbn is required.')

        existing_book = Book.objects.filter(isbn=isbn).first()
        if existing_book:
            serializer = BookSerializer(existing_book, context={'request': request})
            return Response(serializer.data)

        book_data = lookup_aladin_book(isbn)
        if not book_data:
            raise exceptions.NotFound('Book not found from Aladin.')

        book = Book.objects.create(
            title=book_data['title'],
            author=book_data['author'],
            publish_date=book_data['publishDate'],
            isbn=book_data['isbn'] or isbn,
            genre_code=book_data['genreCode'],
            cover_image_url=book_data['coverImageUrl'],
        )
        serializer = BookSerializer(book, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DailyQuoteView(APIView):
    def get(self, request):
        date_str = request.query_params.get('date') or timezone.localdate().isoformat()
        return Response(get_daily_quote(date_str))

# Create your views here.
