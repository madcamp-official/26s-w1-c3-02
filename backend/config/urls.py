"""루트 URL — 앱별 include 골격. 이후 각자 자기 앱의 urls.py만 수정한다.

URL prefix가 앱 경계와 1:1이 아니므로(/api/users/me/* 가 여러 앱에 걸침),
모든 앱을 'api/' 아래에 include하고 각 앱 urls.py에서 전체 하위 경로를 선언한다.
경로가 겹치지 않게 각 앱이 담당하는 endpoint는 backend/plan.md 3절 분담표를 따른다.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),     # B: auth/*, users/me, users, friends, users/me/friends*
    path('api/', include('groups.urls')),       # B: groups/*, users/me/groups
    path('api/', include('books.urls')),        # A: books/*, users/me/favorite-books
    path('api/', include('annotations.urls')),  # A: annotations/*, comments/*, likes, users/me/annotations 등
]
