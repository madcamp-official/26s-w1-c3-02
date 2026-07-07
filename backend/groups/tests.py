from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Group, GroupMember, GroupNotice


class GroupNoticeApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user(
            email='owner@example.com',
            nickname='owner',
            password='pw1234!!',
        )
        self.member = User.objects.create_user(
            email='member@example.com',
            nickname='member',
            password='pw1234!!',
        )
        self.group = Group.objects.create(group_name='Readers', owner=self.owner)
        GroupMember.objects.create(group=self.group, user=self.owner)
        GroupMember.objects.create(group=self.group, user=self.member)

    def test_owner_can_update_notice_and_group_detail_shows_latest_only(self):
        self.client.force_authenticate(self.owner)

        first = self.client.post(
            f'/api/groups/{self.group.id}/notice',
            {'content': 'First notice'},
            format='json',
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            f'/api/groups/{self.group.id}/notice',
            {'content': 'Second notice'},
            format='json',
        )
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GroupNotice.objects.filter(group=self.group).count(), 1)

        detail = self.client.get(f'/api/groups/{self.group.id}')

        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data['notice']['content'], 'Second notice')
        self.assertEqual(detail.data['notice']['author']['id'], self.owner.id)

    def test_owner_can_save_blank_notice(self):
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            f'/api/groups/{self.group.id}/notice',
            {'content': ''},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], '')

    def test_member_cannot_post_notice(self):
        self.client.force_authenticate(self.member)

        response = self.client.post(
            f'/api/groups/{self.group.id}/notice',
            {'content': 'Nope'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
