from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Friend
from books.models import Book
from groups.models import Group, GroupMember

from .models import Annotation, Like


class AnnotationApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email='reader@example.com', nickname='reader', password='pw1234!!')
        self.other = User.objects.create_user(email='other@example.com', nickname='other', password='pw1234!!')
        self.friend = User.objects.create_user(email='friend@example.com', nickname='friend', password='pw1234!!')
        self.book = Book.objects.create(title='데미안', author='헤르만 헤세', genre_code='NOVEL')
        self.group = Group.objects.create(group_name='데미안 같이 읽기', owner=self.user)
        GroupMember.objects.create(group=self.group, user=self.user)
        Friend.objects.create(requester=self.user, addressee=self.friend, status=Friend.Status.ACCEPTED)

        self.public_annotation = Annotation.objects.create(
            user=self.other,
            book=self.book,
            type='REVIEW',
            passage='public passage',
            review='public review',
            page=20,
            visibility=Annotation.Visibility.PUBLIC,
        )
        self.friend_annotation = Annotation.objects.create(
            user=self.friend,
            book=self.book,
            type='QUESTION',
            passage='friend passage',
            review='friend review',
            page=10,
            visibility=Annotation.Visibility.FRIENDS,
        )
        self.private_annotation = Annotation.objects.create(
            user=self.other,
            book=self.book,
            passage='private passage',
            visibility=Annotation.Visibility.PRIVATE,
        )
        Like.objects.create(user=self.user, target_type=Like.TargetType.ANNOTATION, target_id=self.public_annotation.id)
        Like.objects.create(user=self.friend, target_type=Like.TargetType.ANNOTATION, target_id=self.public_annotation.id)
        Like.objects.create(user=self.user, target_type=Like.TargetType.ANNOTATION, target_id=self.friend_annotation.id)

    def test_create_annotation_requires_auth_and_uses_api_spec_shape(self):
        payload = {
            'bookId': self.book.id,
            'type': 'REVIEW',
            'passage': '새는 알에서 나오려고 투쟁한다.',
            'review': '성장에 대한 메모',
            'page': 48,
            'visibility': 'public',
            'isSpoiler': False,
            'groupId': None,
        }

        response = self.client.post('/api/annotations', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.post('/api/annotations', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['book']['bookId'], self.book.id)
        self.assertEqual(response.data['author']['nickname'], 'reader')
        self.assertEqual(response.data['isSpoiler'], False)

    def test_book_annotations_apply_visibility_and_sorting(self):
        response = self.client.get(f'/api/books/{self.book.id}/annotations', {'sort': 'likes,desc'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['annotationId'] for item in response.data['data']], [self.public_annotation.id])

        self.client.force_authenticate(self.user)
        response = self.client.get(f'/api/books/{self.book.id}/annotations', {'sort': 'likes,desc'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item['annotationId'] for item in response.data['data']],
            [self.public_annotation.id, self.friend_annotation.id],
        )
        self.assertEqual(response.data['data'][0]['likeCount'], 2)
        self.assertTrue(response.data['data'][0]['isLiked'])

    def test_detail_patch_delete_owner_permissions(self):
        self.client.force_authenticate(self.other)
        response = self.client.patch(
            f'/api/annotations/{self.public_annotation.id}',
            {'review': '수정됨'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.public_annotation.refresh_from_db()
        self.assertEqual(self.public_annotation.review, '수정됨')

        self.client.force_authenticate(self.user)
        response = self.client.delete(f'/api/annotations/{self.public_annotation.id}')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.other)
        response = self.client.delete(f'/api/annotations/{self.public_annotation.id}')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

# Create your tests here.
