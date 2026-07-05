from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler


class DuplicateError(exceptions.APIException):
    """중복 요청(친구/멤버/도서/즐겨찾기 등) → 409 DUPLICATE"""

    status_code = status.HTTP_409_CONFLICT
    default_detail = '이미 존재하는 요청입니다.'
    default_code = 'DUPLICATE'


STATUS_TO_CODE = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'DUPLICATE',
}


def _flatten_message(detail):
    """DRF ValidationError의 dict/list 구조에서 사람이 읽을 첫 메시지를 뽑는다."""
    if isinstance(detail, dict):
        for value in detail.values():
            return _flatten_message(value)
        return '잘못된 요청입니다.'
    if isinstance(detail, list):
        return _flatten_message(detail[0]) if detail else '잘못된 요청입니다.'
    return str(detail)


def custom_exception_handler(exc, context):
    """모든 에러를 api-spec 공통 포맷 { "error": { "code", "message" } }로 변환."""
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()

    response = exception_handler(exc, context)

    if response is None:
        # DRF가 처리하지 못한 예외 → 500 INTERNAL_ERROR (DEBUG 시에는 Django 기본 traceback 유지)
        from django.conf import settings
        if settings.DEBUG:
            return None
        return Response(
            {'error': {'code': 'INTERNAL_ERROR', 'message': '서버 오류가 발생했습니다.'}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    code = getattr(exc, 'default_code', None)
    code = code.upper() if code and code.upper() in STATUS_TO_CODE.values() else None
    if code is None:
        code = STATUS_TO_CODE.get(response.status_code, 'INTERNAL_ERROR')

    response.data = {'error': {'code': code, 'message': _flatten_message(getattr(exc, 'detail', exc))}}
    return response
