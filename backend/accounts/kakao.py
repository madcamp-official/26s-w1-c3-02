import logging
import uuid

import requests
from django.conf import settings
from rest_framework import exceptions

logger = logging.getLogger(__name__)

KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
KAKAO_USER_ME_URL = 'https://kapi.kakao.com/v2/user/me'


def exchange_code_for_token(code, redirect_uri):
    if not settings.KAKAO_REST_API_KEY:
        raise exceptions.APIException('KAKAO_REST_API_KEY is not configured.')

    body = {
        'grant_type': 'authorization_code',
        'client_id': settings.KAKAO_REST_API_KEY,
        'redirect_uri': redirect_uri,
        'code': code,
    }
    if settings.KAKAO_CLIENT_SECRET:
        body['client_secret'] = settings.KAKAO_CLIENT_SECRET

    try:
        response = requests.post(KAKAO_TOKEN_URL, data=body, timeout=5)
    except requests.RequestException as exc:
        logger.warning('Kakao token exchange request error: %s', exc)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.') from exc

    if response.status_code >= 400:
        logger.warning('Kakao token exchange failed: %s %s', response.status_code, response.text)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.')

    access_token = response.json().get('access_token')
    if not access_token:
        logger.warning('Kakao token exchange returned no access_token: %s', response.text)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.')

    return access_token


def fetch_kakao_profile(kakao_access_token):
    headers = {'Authorization': f'Bearer {kakao_access_token}'}

    try:
        response = requests.get(KAKAO_USER_ME_URL, headers=headers, timeout=5)
    except requests.RequestException as exc:
        logger.warning('Kakao profile fetch request error: %s', exc)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.') from exc

    if response.status_code >= 400:
        logger.warning('Kakao profile fetch failed: %s %s', response.status_code, response.text)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.')

    data = response.json()
    kakao_id = data.get('id')
    if kakao_id is None:
        logger.warning('Kakao profile response missing id: %s', data)
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.')

    kakao_account = data.get('kakao_account') or {}
    profile = kakao_account.get('profile') or {}

    return {
        'kakao_id': str(kakao_id),
        'email': kakao_account.get('email'),
        'nickname': profile.get('nickname'),
    }


def unique_nickname(user_model, base_nickname):
    if not user_model.objects.filter(nickname=base_nickname).exists():
        return base_nickname

    for suffix in range(1, 6):
        candidate = f"{base_nickname}{suffix}"
        if not user_model.objects.filter(nickname=candidate).exists():
            return candidate

    return f"{base_nickname}_{uuid.uuid4().hex[:8]}"
