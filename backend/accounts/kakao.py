import uuid

import requests
from rest_framework import exceptions

KAKAO_USER_ME_URL = 'https://kapi.kakao.com/v2/user/me'


def fetch_kakao_profile(kakao_access_token):
    headers = {'Authorization': f'Bearer {kakao_access_token}'}

    try:
        response = requests.get(KAKAO_USER_ME_URL, headers=headers, timeout=5)
    except requests.RequestException as exc:
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.') from exc

    if response.status_code >= 400:
        raise exceptions.AuthenticationFailed('카카오 인증에 실패했습니다.')

    data = response.json()
    kakao_id = data.get('id')
    if kakao_id is None:
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
