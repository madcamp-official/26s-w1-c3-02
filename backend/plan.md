# 백엔드 구현 계획 (2인 분업)

`docs/tech.md`·`docs/api-spec.md`·루트 `README.md` 기준으로 정리한 Django 백엔드 구현 계획입니다.
프론트엔드에서 이미 자리잡은 담당 구분을 그대로 이어받아 병렬 개발 시 충돌을 최소화합니다.

| 이름 | 담당 |
|---|---|
| 이지오 (A) | 도서·주석·댓글·좋아요·즐겨찾기·검색 |
| 박수현 (B) | 인증·사용자·친구·그룹 주석방 |

## 0. 공통 전제 (시작 전 반드시 합의)

이 항목들은 나중에 바꾸기 어렵거나(마이그레이션 재작성) 두 사람 코드에 동시에 영향을 주므로, 각자 앱 개발에 들어가기 전에 **한 사람이 먼저 세팅하고 다른 한 명이 리뷰**하는 방식을 권장합니다. 인증 담당인 B가 이 부분을 먼저 세팅하는 것을 제안합니다.

- [ ] **커스텀 User 모델**: Django 기본 User에는 `nickname`, `bio`, `avatarUrl`, `avatarIcon`이 없음. `accounts.User`를 `AUTH_USER_MODEL`로 지정 — **첫 마이그레이션 전에 반드시 확정** (나중에 바꾸려면 DB를 새로 파야 함).
- [ ] **DRF + JWT 설치/설정**: `mysqlclient`, `djangorestframework-simplejwt` 추가 설치 (`requirements.txt`에 없음, 이번에 추가 필요). `Authorization: Bearer <accessToken>` 방식.
- [ ] **camelCase 매핑**: DB 컬럼은 snake_case, API 응답은 camelCase (`djangorestframework-camel-case` 등 검토).
- [ ] **공통 응답 포맷**: 목록은 `{ data, pagination: { page, size, totalElements, totalPages } }`, 단건은 객체 그대로 — DRF `PageNumberPagination` 서브클래싱.
- [ ] **공통 에러 포맷**: `{ error: { code, message } }`, DRF `exception_handler` 커스터마이징. 코드: `VALIDATION_ERROR`(400) / `UNAUTHORIZED`(401) / `FORBIDDEN`(403) / `NOT_FOUND`(404) / `DUPLICATE`(409) / `INTERNAL_ERROR`(500).
- [ ] **DB**: `docs/tech.md` 기준 MySQL 확정. 로컬 개발 초반엔 SQLite로 빠르게 진행하고 스키마가 어느 정도 안정되면 MySQL로 전환해도 되고, 처음부터 MySQL(로컬 설치 또는 Docker)로 맞춰도 됨 — 두 사람이 같은 방식으로 통일할 것.
- [ ] **CORS**: `django-cors-headers`로 `http://localhost:5173` 허용.
- [ ] **브랜치 전략**: 앱 단위로 작은 브랜치/PR (`backend/accounts`, `backend/books` 등)로 나눠 자주 머지. 이번 세션에서 프론트 쪽 대형 브랜치가 stale해져 머지 충돌·롤백까지 갔던 사고가 있었으니, 백엔드는 작은 단위로 자주 합치는 쪽을 권장합니다.

## 1. Django 앱 구조 및 담당

| 앱 | 담당 | 모델 | api-spec.md 섹션 |
|---|---|---|---|
| `accounts` | B | User | §3 인증·사용자 |
| `books` | A | Book, BookFavorite | §4 책 |
| `annotations` | A | Annotation, Comment, Like, AnnotationFavorite | §5 주석, §6 댓글, §7 좋아요 |
| `social` | B | Friend | §8 친구 |
| `groups` | B | Group, GroupMember, GroupBook | §9 그룹 주석방 |

## 2. A 담당 — 도서 · 주석 · 댓글 · 좋아요

### `books` 앱
- [ ] `Book` 모델 (`title`, `author`, `publishDate`, `isbn`, `genreCode`, `coverImageUrl`)
- [ ] `BookFavorite` 모델 (user, book, unique together)
- [ ] `GET /api/books` (keyword/genreCode/sort=popular/페이지네이션)
- [ ] `GET /api/books/recommendations`
- [ ] `GET /api/books/{bookId}`
- [ ] `POST /api/books` 🔒
- [ ] `POST|DELETE /api/books/{bookId}/favorite` 🔒
- [ ] `GET /api/users/me/favorite-books` 🔒

### `annotations` 앱
- [ ] `Annotation` 모델 (`book` FK, `author` FK, `type` ENUM, `passage`, `review`, `page`, `visibility` ENUM, `isSpoiler`, `groupId` — 아래 3.3 참고)
- [ ] `Comment` 모델 (`annotation` FK, `author` FK, `type`, `content`)
- [ ] `Like` 모델 (polymorphic: `targetType` = `annotation`|`comment`, `targetId`) — 카운트 컬럼 없이 `COUNT`로 집계
- [ ] `AnnotationFavorite` 모델
- [ ] `GET /api/annotations/feed` (recentHours/scope=friends/sort)
- [ ] `GET /api/annotations/search` (bookId/keyword/pageNumber/type/sort)
- [ ] `POST /api/annotations` 🔒
- [ ] `GET /api/annotations/{annotationId}`
- [ ] `PATCH|DELETE /api/annotations/{annotationId}` 🔒
- [ ] `GET /api/books/{bookId}/annotations`
- [ ] `POST|DELETE /api/annotations/{annotationId}/favorite` 🔒
- [ ] `GET /api/users/me/annotations` 🔒
- [ ] `GET /api/users/me/favorite-annotations` 🔒
- [ ] `GET|POST /api/annotations/{annotationId}/comments`
- [ ] `PATCH|DELETE /api/comments/{commentId}` 🔒
- [ ] `POST|DELETE /api/likes` 🔒

## 3. B 담당 — 인증 · 사용자 · 친구 · 그룹

### `accounts` 앱
- [ ] 커스텀 `User` 모델 (`nickname`, `email`, `password`, `bio`, `avatarUrl`, `avatarIcon`)
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login` (JWT `accessToken` 발급)
- [ ] `POST /api/auth/logout` 🔒
- [ ] `GET|PATCH /api/users/me` 🔒
- [ ] `GET /api/users?nickname={keyword}` 🔒 (친구 검색에서도 재사용)

### `social` 앱 (친구)
- [ ] `Friend` 모델 (`requester`, `addressee`, `status` ENUM `PENDING`/`ACCEPTED`)
- [ ] `GET /api/users/me/friends` 🔒
- [ ] `GET /api/users/me/friend-requests` 🔒 (`direction=received|sent`)
- [ ] `POST /api/friends` 🔒
- [ ] `POST /api/friends/{userId}/accept` 🔒
- [ ] `DELETE /api/friends/{userId}` 🔒

### `groups` 앱 (그룹 주석방)
- [ ] `Group` 모델 (`groupName`, `owner` FK)
- [ ] `GroupMember` 모델 (group, user)
- [ ] `GroupBook` 모델 (group, book FK → A의 `books.Book`)
- [ ] `GET /api/users/me/groups` 🔒
- [ ] `POST /api/groups` 🔒
- [ ] `GET|PATCH|DELETE /api/groups/{groupId}` 🔒
- [ ] `GET|POST /api/groups/{groupId}/members`, `DELETE .../members/{userId}` 🔒
- [ ] `GET|POST /api/groups/{groupId}/books`, `DELETE .../books/{bookId}` 🔒
- [ ] `GET /api/groups/{groupId}/annotations` 🔒 (bookId/type/sort — A의 `annotations.Annotation` 조회, 아래 3.3 참고)

## 4. 교차 지점 (양쪽 다 인지해야 할 것)

프론트에서 겪었던 것과 같은 종류의 문제(한쪽 도메인 모델을 다른 쪽이 참조)가 백엔드 모델 관계에도 그대로 있습니다. 구현 순서와 인터페이스를 미리 합의해둘 것.

1. **`Annotation.group` (A → B 참조)**: 주석의 `groupId` 필드와 `visibility=group`은 B의 `Group` 모델을 가리킴. `groups` 앱이 먼저 존재해야 FK를 걸 수 있으므로, B가 `Group` 모델을 먼저 만들고 A에게 앱/모델명을 공유하거나, 초반엔 nullable `IntegerField`로 느슨하게 두고 나중에 FK로 전환.
2. **`GET /api/groups/{groupId}/annotations` (B → A 참조)**: B의 `groups` 뷰가 A의 `Annotation` 모델을 그룹 멤버 기준으로 필터링해 조회해야 함. A가 재사용 가능한 쿼리 함수(예: `annotations/services.py`의 `get_group_annotations(group, **filters)`)를 제공하면 B가 그대로 호출하는 방식을 권장.
3. **`Like`의 대상이 `annotation`/`comment` 둘 다** (A 내부에서 처리되지만, 다른 곳에서 좋아요 대상이 추가될 가능성은 없는지 확인).
4. **`User` 모델은 모든 앱의 기반**이므로 B가 0단계에서 가장 먼저 완성해야 A/그룹 앱 작업이 막히지 않음.

## 5. 진행 순서 제안

1. **(B 우선, 블로킹)** 0단계 공통 설정 + `accounts` 커스텀 User + JWT 로그인/회원가입까지 → A에게 공유
2. **(병렬)** A: `books` 앱 / B: `social`(친구) 앱 — 서로 의존성 없음
3. **(병렬)** A: `annotations`+`comments`+`likes` / B: `groups` 앱 (단, groups의 book FK는 A의 `books.Book`이 먼저 존재해야 함)
4. **(교차 통합)** 위 "4. 교차 지점" 항목 연결 — `Annotation.group` 필드, `groups/{id}/annotations` 엔드포인트
5. 각자 도메인 기준으로 `docs/api-spec.md` 응답 예시와 실제 응답 diff 확인 (mock server 응답과 필드명이 정확히 같아야 프론트 수정 없이 붙음)
