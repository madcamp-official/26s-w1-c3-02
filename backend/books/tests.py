from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from annotations.models import Annotation
from .models import Book, BookFavorite


class BookApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='reader@example.com',
            nickname='reader',
            password='pw1234!!',
        )
        self.book = Book.objects.create(
            title='데미안',
            author='헤르만 헤세',
            publish_date='1919-01-01',
            isbn='9788937460449',
            genre_code='NOVEL',
        )
        Book.objects.create(title='Cosmos', author='Carl Sagan', genre_code='SCIENCE')

    def test_list_books_uses_api_spec_shape(self):
        response = self.client.get('/api/books', {'keyword': '데미안'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data'][0]['bookId'], self.book.id)
        self.assertEqual(response.data['data'][0]['genreCode'], 'NOVEL')
        self.assertEqual(response.data['data'][0]['annotationCount'], 0)
        self.assertFalse(response.data['data'][0]['isFavorited'])

    def test_list_books_can_search_author_only(self):
        Book.objects.create(title='The Author Trap', author='다른 작가')
        response = self.client.get('/api/books', {'keyword': 'The', 'field': 'author'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['totalElements'], 0)

        response = self.client.get('/api/books', {'keyword': '헤르만', 'field': 'author'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['bookId'], self.book.id)

    def test_list_books_can_sort_by_recent_annotation_count(self):
        older_book = Book.objects.create(title='오래된 인기 책', author='작가', genre_code='NOVEL')
        recent_book = Book.objects.create(title='새 주석 책', author='작가', genre_code='NOVEL')

        Annotation.objects.create(user=self.user, book=recent_book, passage='recent 1')
        Annotation.objects.create(user=self.user, book=recent_book, passage='recent 2')
        old_annotation = Annotation.objects.create(user=self.user, book=older_book, passage='old')
        Annotation.objects.filter(pk=old_annotation.pk).update(created_at=timezone.now() - timedelta(hours=25))

        response = self.client.get('/api/books', {
            'sort': 'recentAnnotations',
            'recentHours': 24,
            'size': 3,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['bookId'], recent_book.id)
        self.assertEqual(response.data['data'][0]['annotationCount'], 2)
        self.assertEqual(response.data['data'][1]['annotationCount'], 0)

    def test_create_book_requires_auth_and_rejects_duplicate_isbn(self):
        payload = {'title': '새 책', 'author': '작가', 'isbn': '9788937460449'}

        response = self.client.post('/api/books', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.post('/api/books', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['error']['code'], 'DUPLICATE')

    def test_favorite_book_flow(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(f'/api/books/{self.book.id}/favorite')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(BookFavorite.objects.filter(user=self.user, book=self.book).exists())

        response = self.client.get('/api/users/me/favorite-books')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['bookId'], self.book.id)
        self.assertTrue(response.data['data'][0]['isFavorited'])

        response = self.client.delete(f'/api/books/{self.book.id}/favorite')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(BookFavorite.objects.filter(user=self.user, book=self.book).exists())

    @patch('books.views.search_aladin_books')
    def test_aladin_search_requires_auth_and_returns_candidates(self, mock_search):
        mock_search.return_value = [{
            'title': '알라딘 책',
            'author': '작가',
            'publishDate': '2026-01-01',
            'isbn': '9790000000001',
            'genreCode': 'NOVEL',
            'coverImageUrl': 'https://example.com/cover.jpg',
        }]

        response = self.client.get('/api/books/external-search', {'keyword': '알라딘'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.get('/api/books/external-search', {'keyword': '알라딘', 'field': 'title'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['isbn'], '9790000000001')
        mock_search.assert_called_once()

    @patch('books.views.lookup_aladin_book')
    def test_aladin_import_creates_or_reuses_book_by_isbn(self, mock_lookup):
        mock_lookup.return_value = {
            'title': '새 알라딘 책',
            'author': '알라딘 작가',
            'publishDate': '2026-01-01',
            'isbn': '9790000000002',
            'genreCode': 'Domestic Books > Science > General Science',
            'coverImageUrl': 'https://example.com/cover.jpg',
        }
        self.client.force_authenticate(self.user)

        response = self.client.post('/api/books/import-from-aladin', {'isbn': '9790000000002'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], '새 알라딘 책')
        imported_book = Book.objects.get(isbn='9790000000002')
        self.assertEqual(imported_book.genre_code, 'Domestic Books > Science > General Science')

        response = self.client.post('/api/books/import-from-aladin', {'isbn': '9790000000002'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_lookup.call_count, 1)

# Create your tests here.
