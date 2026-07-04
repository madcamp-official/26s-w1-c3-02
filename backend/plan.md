# 백엔드 구현 계획 — 문장서재 (2인 분업)

기준 문서: [docs/api-spec.md](../docs/api-spec.md) (단일 진실 공급원), [docs/tech.md](../docs/tech.md), [README.md](../README.md)

## 0. 현재 상태

- Django 6 + DRF + django-cors-headers 스캐폴딩 완료 (`config` 프로젝트 + `bookclub` 앱)
- 모델/뷰/URL 미구현, DB는 로컬 SQLite (배포 시 MySQL 전환 예정)
- 프론트엔드는 mock server(`frontend/mock-server.js`) 기준으로 전 화면 구현 완료 → **백엔드는 api-spec.md 응답 형태를 그대로 재현하면 프론트 수정 없이 연동 가능**

### 시작 전 정리할 것

- [ ] `requirements.txt`가 다시 UTF-16으로 저장됨 → UTF-8로 재저장 (PowerShell에서 `pip freeze > requirements.txt` 하면 재발함. `pip freeze | Out-File -Encoding utf8 requirements.txt` 사용)
- [ ] `djangorestframework-simplejwt` 설치 (JWT 인증)
- [ ] `db.sqlite3` 삭제 후 재생성 — 커스텀 User 모델은 **첫 migrate 전에** 확정해야 함
- [ ] `SECRET_KEY` 환경변수 분리, `TIME_ZONE = 'Asia/Seoul'` (USE_TZ는 True 유지)

## 1. 역할 분담 요약

| 담당 | 이름 | 영역 |
|---|---|---|
| **A** | 이지오 (@easy0131) | 도서 · 주석 · 댓글 · 검색 · 좋아요 · 즐겨찾기 |
| **B** | 박수현 (@suh1088) | 인증 · 사용자/마이페이지 · 친구 · 그룹 주석방 · 공통 인프라 |

앱을 담당별로 분리해서 머지 충돌을 최소화한다:

```text
backend/
├── config/          # 설정·루트 URL (공유 — 수정 시 상대에게 알리기)
├── common/          # B가 초기 구축, 이후 공유 (페이지네이션·에러핸들러·권한)
├── accounts/        # B: User, Friend
├── groups/          # B: Group, GroupMember, GroupBook
├── books/           # A: Book, BookFavorite
└── annotations/     # A: Annotation, Comment, Like, AnnotationFavorite
```

기존 `bookclub` 앱은 위 4개 앱으로 대체하고 삭제한다.

## 2. Phase 0 — 공통 기반 (함께, Day 1)

**이 단계가 끝나기 전에는 각자 작업을 시작하지 않는다.** 모델과 공통 규약이 곧 두 사람 사이의 계약이기 때문.

### 함께 결정·작성

- [ ] **모델 전체 정의 + 마이그레이션 1회 생성** — ERD(`screenshot/db_shcema.png`)와 api-spec.md 기준으로 8개 모델을 한 번에 확정. 이후 모델 변경은 소유자가 하되 사전 공유
- [ ] 커스텀 User 모델 (`accounts.User`, AbstractUser 상속: `nickname` unique, `bio`, `avatar_url`, `avatar_icon`; 로그인 필드는 `email`)
- [ ] 시드 데이터 fixture — mock server의 한국어 데모 데이터를 옮겨서 개발 중 프론트 연동 확인에 사용

### B가 구축 (common/ + config/)

- [ ] **페이지네이션 클래스**: `?page=1&size=20` → `{ "data": [...], "pagination": { page, size, totalElements, totalPages } }`
- [ ] **예외 핸들러**: 모든 에러를 `{ "error": { "code", "message" } }`로 변환 (`VALIDATION_ERROR` / `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `DUPLICATE` / `INTERNAL_ERROR`)
- [ ] **JWT 설정**: simplejwt, `Authorization: Bearer` — 무상태 (토큰 저장 테이블 없음, 로그아웃은 204만 반환)
- [ ] **camelCase 정책**: 응답 필드가 api-spec과 완전히 같아야 하므로 serializer에서 명시적으로 camelCase 필드명 선언 (`bookId = serializers.IntegerField(source='id')` 방식). 자동 변환 라이브러리보다 스펙 일치 확인이 쉬움
- [ ] `IsOwnerOrReadOnly` 등 공통 권한 클래스
- [ ] `config/urls.py`에 앱별 `include()` 골격 — 이후 각자 자기 앱의 `urls.py`만 수정

### 모델 소유권

| 모델 | 소유 | 비고 |
|---|---|---|
| `User` | B | AbstractUser 확장 |
| `Friend` | B | `requester`/`addressee` + `status(PENDING/ACCEPTED)`, unique 쌍 |
| `Group`, `GroupMember`, `GroupBook` | B | |
| `Book` | A | |
| `BookFavorite` | A | user×book unique |
| `Annotation` | A | `type`, `visibility`, `is_spoiler`, `group` FK(nullable, → groups.Group) |
| `Comment` | A | 2단 구조 (대댓글 없음), `type` 필드 |
| `Like` | A | polymorphic: `target_type(annotation/comment)` + `target_id`, 카운트 컬럼 없이 COUNT 집계 |
| `AnnotationFavorite` | A | user×annotation unique |

## 3. 엔드포인트 분담

### A — 이지오 (도서 · 주석 · 댓글 · 좋아요 · 즐겨찾기)

| 그룹 | 엔드포인트 |
|---|---|
| 책 | `GET/POST /api/books`, `GET /api/books/{id}`, `GET /api/books/recommendations` |
| 책 북마크 | `POST/DELETE /api/books/{id}/favorite`, `GET /api/users/me/favorite-books` |
| 주석 | `POST /api/annotations`, `GET/PATCH/DELETE /api/annotations/{id}`, `GET /api/books/{id}/annotations` |
| 피드·검색 | `GET /api/annotations/feed`, `GET /api/annotations/search` |
| 주석 즐겨찾기 | `POST/DELETE /api/annotations/{id}/favorite`, `GET /api/users/me/annotations`, `GET /api/users/me/favorite-annotations` |
| 댓글 | `GET/POST /api/annotations/{id}/comments`, `PATCH/DELETE /api/comments/{id}` |
| 좋아요 | `POST /api/likes`, `DELETE /api/likes?targetType=&targetId=` |

핵심 난이도 포인트:
- **visibility 필터링** (아래 4절 인터페이스 사용): 피드/검색/책별 목록에서 `public` + 내 글 + 친구의 `friends` 글 + 내 그룹의 `group` 글만 노출
- Annotation 응답의 `likeCount`/`commentCount`/`isLiked`/`isFavorited`는 annotate 서브쿼리로 (N+1 주의)
- 정렬 4종: `recent,desc` / `likes,desc` / `popular` / `pageNumber`

### B — 박수현 (인증 · 사용자 · 친구 · 그룹)

| 그룹 | 엔드포인트 |
|---|---|
| 인증 | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| 사용자 | `GET/PATCH /api/users/me`, `GET /api/users?nickname=` |
| 친구 | `GET /api/users/me/friends`, `GET /api/users/me/friend-requests?direction=`, `POST /api/friends`, `POST /api/friends/{userId}/accept`, `DELETE /api/friends/{userId}` |
| 그룹 | `GET /api/users/me/groups`, `POST /api/groups`, `GET/PATCH/DELETE /api/groups/{id}` |
| 그룹 멤버 | `GET/POST /api/groups/{id}/members`, `DELETE /api/groups/{id}/members/{userId}` |
| 그룹 도서 | `GET/POST /api/groups/{id}/books`, `DELETE /api/groups/{id}/books/{bookId}` |
| 그룹 피드 | `GET /api/groups/{id}/annotations` — A의 Annotation serializer·필터 재사용 |

핵심 난이도 포인트:
- 친구 관계는 단방향 요청 → 수락 시 양방향 취급 (친구 목록 조회 시 requester/addressee 양쪽 검색)
- 그룹 권한: 상세/피드는 멤버만, 수정/삭제/내보내기는 owner만, 나가기는 본인
- 중복 요청(친구·멤버·도서)은 `409 DUPLICATE`

## 4. 상호 인터페이스 계약

서로의 코드에 의존하는 지점. **시그니처를 바꿀 때는 반드시 사전 합의.**

| 제공자 | 인터페이스 | 사용자 | 용도 |
|---|---|---|---|
| B | `Friend.friend_ids_of(user) -> QuerySet[int]` | A | 피드/검색 visibility 필터, `scope=friends` |
| B | `GroupMember.group_ids_of(user) -> QuerySet[int]` | A | `visibility=group` 주석 노출 판단 |
| B | `common.pagination`, `common.exceptions`, `common.permissions` | A·B | 전 API 공통 |
| A | `AnnotationSerializer` + `visible_to(user)` 쿼리셋 헬퍼 | B | 그룹 피드(`/groups/{id}/annotations`)에서 재사용 |
| A | `Book` 모델, 간단 Book serializer | B | 그룹 도서 목록·그룹 상세의 `books` 필드 |

의존 방향 정리: **Phase 0에서 모델을 함께 만들기 때문에 모델 수준 의존은 없음.** 런타임 헬퍼 5개만 계약으로 관리하면 됨. 상대 헬퍼가 아직 없으면 스텁(빈 쿼리셋 반환)으로 먼저 진행.

## 5. 일정 (7일 기준)

| Day | A (이지오) | B (박수현) |
|---|---|---|
| 1 | Phase 0: 모델 함께 확정, 마이그레이션 | Phase 0: + common/ 인프라, JWT 설정 |
| 2 | Book CRUD·검색·북마크 | 회원가입·로그인·users/me·닉네임 검색 |
| 3 | Annotation CRUD, 책별 목록, 정렬 | 친구 요청/수락/삭제/목록 |
| 4 | 댓글·좋아요·즐겨찾기, count annotate | 그룹 CRUD·멤버·도서 |
| 5 | 피드·검색 + visibility 필터 (B 헬퍼 연동) | 그룹 피드 (A serializer 연동), 시드 데이터 정비 |
| 6 | **통합**: 프론트 axios baseURL 전환(:4000→:8000), 전 화면 수동 점검, 버그 수정 | 동일 + MySQL 전환 (`mysqlclient`, KAIST VM DB) |
| 7 | 버그 수정·마무리 | KAIST VM 배포 (gunicorn + nginx), README 배포 섹션 작성 |

- Day 5 저녁에 중간 통합 리허설 (양쪽 브랜치 머지 후 프론트 붙여보기)
- MySQL 전환은 로컬 개발 마찰을 줄이기 위해 Day 6까지 SQLite 유지. 단, raw SQL 금지·ORM만 사용해서 전환 리스크 제거

## 6. 협업 규칙

- **브랜치**: `main` 직접 푸시 금지. `feat/<영역>` 브랜치 → PR → 상대 리뷰 후 머지 (예: `feat/auth`, `feat/annotations`)
- **공유 파일** (`config/settings.py`, `config/urls.py`, `common/*`, 상대 소유 모델): 수정 전 채팅으로 알리고, 가급적 B가 일괄 관리
- **API 스펙 변경이 필요하면** 코드보다 `docs/api-spec.md`를 먼저 고치고 상대 확인 후 구현 (structure.md 원칙)
- **커밋 단위**: 엔드포인트 그룹 단위로 작게. 마이그레이션 파일은 생성한 사람이 커밋하고 충돌 시 재생성
- **완료 기준 (엔드포인트별 DoD)**:
  1. api-spec.md의 요청/응답 예시와 필드명·구조 일치 (camelCase 포함)
  2. 인증(🔒)·권한(작성자/멤버/owner) 검사 동작
  3. 에러 포맷·상태코드 일치 (400/401/403/404/409)
  4. 시드 데이터 기준으로 프론트 해당 화면 동작 확인
