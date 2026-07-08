# 문장서재

책 속 문장을 직접 기록하고, 같은 구절에 대한 질문·토론·감상을 나누는 웹 기반 독서 주석 서비스입니다.

## 프로젝트 개요

문장서재는 책 전문을 제공하지 않고, 사용자가 직접 입력한 짧은 인용 구절과 페이지 번호를 기준으로 주석 카드를 쌓아가는 서비스입니다. 개인 독서 노트처럼 비공개로 기록할 수도 있고, 공개·친구 공개·그룹 공개 범위를 선택해 다른 독자와 생각을 나눌 수도 있습니다.

## 팀원

| 이름 | GitHub | 담당 |
|---|---|---|
| 이지오 | [@easy0131](https://github.com/easy0131) | 도서·주석·검색·좋아요·즐겨찾기 |
| 박수현 | [@suh1088](https://github.com/suh1088) | 인증·마이페이지·친구·그룹 주석방 |

## 핵심 기능

### 인증 및 사용자

- 이메일/비밀번호 기반 회원가입 및 로그인
- 카카오 소셜 로그인 (최초 로그인 시 닉네임 설정 온보딩 포함)
- JWT Bearer 토큰 기반 API 인증
- 로그인 없이도 홈/검색/책·주석 열람 가능, 작성·참여·마이페이지는 로그인 필요
- 마이페이지에서 내 정보, 작성한 주석, 즐겨찾기한 책/주석, 친구, 그룹 확인
- 닉네임 기반 사용자 검색 및 친구 요청/수락/삭제

### 책 탐색 및 북마크

- 홈 화면에서 책 목록과 장르 필터 제공
- 검색 화면에서 책 제목/저자/주석 통합 검색
- 알라딘 API 연동으로 새로운 책 검색 및 등록
- 책 상세 화면에서 주석 피드, 페이지/키워드 검색, 정렬 제공
- 책 북마크 추가/해제
- 북마크한 책은 마이페이지 내 서재에서 확인 및 해제 가능

### 주석 카드

- 책별로 구절 노트 작성
- 주석 유형: `QUESTION`, `DISCUSSION`, `REVIEW`, `NORMAL`
- 입력 항목: 책, 페이지, 인용 구절, 주석 내용, 공개 범위, 스포일러 여부, 그룹 여부
- 주석 상세에서 댓글 작성, 댓글 유형 필터, 좋아요, 수정/삭제 지원
- 스포일러 주석은 기본적으로 가려서 표시하고 사용자가 직접 열람

### 주석 즐겨찾기와 좋아요

- 주석 즐겨찾기 추가/해제
- 홈 피드, 검색 결과, 책 상세 주석 카드, 주석 상세에서 바로 저장 가능
- 즐겨찾기한 주석은 마이페이지에서 다시 확인
- 주석과 댓글 좋아요 추가/취소

### 그룹 주석방

- 라운지(그룹 목록) 및 마이페이지에서 그룹 생성
- 그룹 상세에서 그룹 이름 수정, 그룹 삭제/나가기
- 멤버 초대 → 상대방 수락/거절 흐름, 멤버 내보내기
- 받은 초대는 라운지와 마이페이지에서 확인 및 수락/거절
- 그룹 도서 추가/제거
- 그룹 도서를 클릭하면 그룹원 주석만 모아 보는 책 상세로 이동
- 그룹 주석 피드는 `groupId`, `bookId`, `type` 기반 필터를 지원

## 화면 구조

| 경로 | 화면 | 주요 기능 |
|---|---|---|
| `/` | 홈 | 책 목록, 장르 필터, 오늘의 문장피드, 책 북마크, 주석 저장 |
| `/search` | 둘러보기/검색 | 책 검색, 주석 검색, 인기 책, 인기 구절노트, 북마크/저장 |
| `/books/:bookId` | 책 상세 | 책 정보, 책 북마크, 주석 목록, 주석 검색, 주석 저장/좋아요 |
| `/annotations/new` | 주석 작성 | 책/구절/페이지/유형/공개범위/스포일러 입력 |
| `/annotations/:annotationId` | 주석 상세 | 주석 본문, 좋아요, 저장, 댓글 작성/삭제 |
| `/annotations/:annotationId/edit` | 주석 수정 | 기존 주석 편집 |
| `/login` | 로그인 | 로그인 및 토큰 저장 |
| `/register` | 회원가입 | 계정 생성 |
| `/auth/kakao/callback` | 카카오 로그인 콜백 | 카카오 인가 코드 처리 및 토큰 저장 |
| `/onboarding/nickname` | 닉네임 설정 온보딩 | 카카오 최초 로그인 시 닉네임 입력 |
| `/mypage` | 마이페이지 | 대시보드, 내 주석, 즐겨찾기, 내 서재, 그룹, 친구, 설정 |
| `/users/:userId` | 사용자 프로필 | 다른 사용자의 공개 프로필/활동 조회 |
| `/friends` | 친구 | 친구 목록/요청 관리 |
| `/groups` | 라운지 | 참여 중인 그룹 목록, 그룹 생성, 받은 초대 수락/거절 |
| `/groups/:groupId` | 그룹 상세 | 그룹 정보, 멤버 초대/관리, 도서 관리 |

## 기술 스택

| 영역 | 사용 |
|---|---|
| Frontend | Vite, React, React Router |
| HTTP Client | axios |
| Styling | Tailwind CSS + 전역 컴포넌트 클래스 |
| Auth State | React Context |
| Backend | Django, Django REST Framework |
| Database | MySQL |
| Auth | JWT Bearer (djangorestframework-simplejwt), 카카오 소셜 로그인(OAuth) |
| 배포 | Docker Compose (nginx + gunicorn + MySQL), KAIST VM |

## 폴더 구조

```text
26s-w1-c3-02/
├── docker-compose.yml       # db(MySQL) + backend(gunicorn) + frontend(nginx) 통합 실행
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/              # 설정·루트 URL (settings, urls, wsgi)
│   ├── common/              # 공통 인프라 (pagination, exceptions, permissions)
│   ├── accounts/            # User, Friend — 인증·사용자·친구 (카카오 로그인 포함)
│   ├── groups/              # Group, GroupMember, GroupBook — 그룹 주석방
│   ├── books/               # Book, BookFavorite — 도서·북마크·알라딘 연동
│   ├── annotations/         # Annotation, Comment, Like, AnnotationFavorite
│   └── fixtures/            # seed.json (데모 데이터)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf           # 정적 서빙 + /api·/admin 프록시
    ├── src/
    │   ├── api/             # axios 클라이언트 및 도메인별 API 모듈
    │   ├── components/
    │   ├── context/         # AuthContext
    │   ├── features/        # 도메인별 기능 모듈 (annotations, auth, books, friends, groups, mypage)
    │   ├── hooks/
    │   ├── lib/             # kakao.js 등 외부 연동
    │   ├── pages/           # 화면 컴포넌트 (위 화면 구조 참고)
    │   ├── utils/
    │   └── styles/
    └── package.json
```

## 실행 방법

저장소 루트의 `.env`를 준비한 뒤(`.env.example` 참고), Docker Compose로 전체 스택을 한 번에 실행합니다.

```bash
docker compose up --build -d
```

최초 1회, 데이터베이스 마이그레이션과 데모 데이터를 적재합니다.

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py loaddata seed
```

- 서비스: `http://<배포-호스트>` (로컬 실행 시 `http://localhost`)
- 관리자 페이지: `http://<배포-호스트>/admin`
- 데모 계정 비밀번호: `pw1234!!`

환경 변수(DB 접속 정보, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, 알라딘 API 키 등)는 모두 루트 `.env`로 주입합니다. 배포 시에는 `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`에 배포 호스트를 지정합니다.

## API 문서

상세 API 명세는 [docs/api-spec.md](docs/api-spec.md)를 참고합니다. Base URL은 `/api`이며, JWT Bearer 토큰으로 인증합니다.

API는 6개 카테고리로 구성됩니다.

- **인증/사용자** — 이메일·카카오 로그인, 회원가입, 프로필 조회/수정, 사용자 검색·공개 프로필
- **책** — 목록/검색/상세, 알라딘 연동 외부 검색·등록, 오늘의 문장, 북마크
- **주석** — 홈 피드, 검색, 작성/수정/삭제, 즐겨찾기
- **댓글 · 좋아요** — 주석·댓글 댓글/좋아요
- **친구** — 검색, 요청/수락/삭제
- **그룹 주석방** — 생성/관리, 멤버 초대, 공지, 그룹 도서, 그룹 전용 주석 피드

<details>
<summary>전체 엔드포인트 목록 보기</summary>

- 인증/사용자: `/api/auth/register`, `/api/auth/nickname-check`, `/api/auth/email-check`, `/api/auth/login`, `/api/auth/kakao`, `/api/auth/logout`, `/api/users/me`, `/api/users`, `/api/users/{userId}`
- 책: `/api/books`, `/api/books/{bookId}`, `/api/books/{bookId}/favorite`, `/api/books/categories`, `/api/books/daily-quote`, `/api/books/external-search`, `/api/books/import-from-aladin`, `/api/books/recommendations`, `/api/users/me/favorite-books`
- 주석: `/api/annotations/feed`, `/api/annotations/search`, `/api/annotations`, `/api/annotations/{annotationId}`, `/api/books/{bookId}/annotations`, `/api/annotations/{annotationId}/favorite`, `/api/users/me/annotations`, `/api/users/{userId}/annotations`, `/api/users/me/favorite-annotations`
- 댓글: `/api/annotations/{annotationId}/comments`, `/api/comments/{commentId}`
- 좋아요: `/api/likes`
- 친구: `/api/friends`, `/api/friends/{userId}/accept`, `/api/friends/{userId}`, `/api/users/me/friends`, `/api/users/me/friend-requests`
- 그룹: `/api/groups`, `/api/groups/{groupId}`, `/api/groups/{groupId}/members`, `/api/groups/{groupId}/members/{userId}`, `/api/groups/{groupId}/books`, `/api/groups/{groupId}/books/{bookId}`, `/api/groups/{groupId}/annotations`, `/api/users/me/groups`
- 그룹 초대/공지: `/api/groups/{groupId}/invitations`, `/api/groups/{groupId}/members/{userId}/accept`, `/api/users/me/group-invitations`, `/api/groups/{groupId}/notice`

</details>

## 구현 상태

- 홈/검색/책 상세/주석 상세/작성/수정 플로우 구현
- 이메일/카카오 소셜 로그인 및 닉네임 설정 온보딩 구현
- 책 북마크 및 주석 즐겨찾기 구현
- 주석/댓글 좋아요 구현
- 마이페이지 대시보드, 내 주석, 즐겨찾기, 내 서재, 친구, 그룹 탭 구현
- 그룹 생성/상세/멤버 초대·수락/도서 추가 구현
- Django REST Framework 기반 전체 API 및 MySQL 연동 구현
- 알라딘 API 연동 도서 검색·등록 구현
- Docker Compose 기반 통합 실행 및 KAIST VM 배포

## 데모

<!-- TODO: 움짤(GIF) 4개 이상 또는 20초 이상 동영상(혹은 스크린샷 4장 이상)을 아래에 추가하세요. -->

| 화면 | 데모 |
|---|---|
| 홈 | ![홈 화면 데모](docs/media/demo-home.gif) |
| 책 상세 | ![책 상세 데모](docs/media/demo-book-detail.gif) |
| 주석 작성 | ![주석 작성 데모](docs/media/demo-annotation.gif) |
| 마이페이지 | ![마이페이지 데모](docs/media/demo-mypage.gif) |

<!-- 또는 동영상 링크: [데모 영상](docs/media/demo.mp4) -->

## 🔁 회고 (KPT)

### Keep

<!-- TODO: 계속 유지하고 싶은 좋았던 점을 작성하세요. -->

### Problem

<!-- TODO: 아쉬웠던 점, 문제였던 점을 작성하세요. -->

### Try

<!-- TODO: 다음에 시도해볼 점을 작성하세요. -->

## 참고 문서

- [docs/api-spec.md](docs/api-spec.md): API 상세 명세
- [docs/product.md](docs/product.md): 제품 기획 메모
- [docs/structure.md](docs/structure.md): 구조 문서
- [docs/tech.md](docs/tech.md): 기술 문서
