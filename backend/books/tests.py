from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

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

# Create your tests here.
