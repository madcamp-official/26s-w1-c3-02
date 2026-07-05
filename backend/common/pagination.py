from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """api-spec 공통 규약: ?page=1&size=20 → { "data": [...], "pagination": {...} }"""

    page_query_param = 'page'
    page_size_query_param = 'size'
    page_size = 20
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'data': data,
            'pagination': {
                'page': self.page.number,
                'size': self.get_page_size(self.request),
                'totalElements': self.page.paginator.count,
                'totalPages': self.page.paginator.num_pages,
            },
        })
