# Frontend

**주석노트** 클라이언트. React로 구현하는 웹 프런트엔드.

2명이 **병렬로** 작업한다. 서로 다른 폴더/파일을 소유해 충돌을 최소화하는 것이 목표.

## 기술 스택 (제안 · 확정 시 갱신)

| 항목 | 선택 | 비고 |
|---|---|---|
| 빌드 | Vite + React | |
| 라우팅 | React Router | |
| HTTP | axios (`api/client.js` 인스턴스) | JWT 헤더·에러 인터셉터 |
| 전역 상태 | Context API (`AuthContext`) | 규모 커지면 Zustand 검토 |
| 스타일 | CSS Modules | `docs/tech.md`에서 확정 필요 |

> 상태 관리·스타일링은 `../docs/tech.md`의 "추후 결정" 항목. Phase 0에서 확정하고 이 표를 갱신할 것.

## 폴더 구조

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── main.jsx                  # 진입점
    ├── App.jsx                   # 라우터 정의            [공통]
    ├── api/
    │   ├── client.js              # axios 인스턴스 + 인터셉터 [공통]
    │   ├── auth.js  users.js      # 인증·사용자            (B)
    │   ├── friends.js  groups.js  # 친구·그룹             (B)
    │   ├── books.js               # 도서·책 즐겨찾기        (A)
    │   ├── annotations.js         # 주석 카드·주석 즐겨찾기   (A)
    │   └── comments.js  likes.js  # 댓글·좋아요            (A)
    ├── components/
    │   ├── common/                # Button, Input, Modal, Card, Pagination [공통]
    │   └── layout/                # Header, Nav, Layout    [공통]
    ├── features/
    │   ├── books/  annotations/   # (A)
    │   ├── auth/  friends/         # (B)
    │   └── groups/  mypage/        # (B)
    ├── pages/                     # 라우트 단위 페이지 (아래 분담표 참고)
    ├── context/
    │   └── AuthContext.jsx        # 로그인 상태·토큰 보관   [공통, B 주관]
    ├── hooks/  utils/  styles/     # [공통]
```

**원칙:** 도메인별로 `api/ + features/ + pages/`를 한 사람이 수직으로 소유한다. 자기 폴더 안에서만 작업하면 충돌이 나지 않는다.

## Phase 0 — 공통 선행 작업 (둘이 함께, 분담 전에 먼저)

이 부분이 확정돼야 병렬 작업이 충돌 없이 굴러간다. 한 브랜치에서 함께(또는 한 명이 세팅 후 main 병합) 끝낸 뒤 각자 분기.

1. Vite + React 스캐폴딩, 폴더 구조/라우팅 뼈대(`App.jsx`에 빈 페이지로 라우트만 선언)
2. `api/client.js` — baseURL(`/api`), JWT `Authorization: Bearer` 인터셉터, 공통 에러 포맷 처리, 페이지네이션 응답(`{ data, pagination }`) 헬퍼
3. `AuthContext` — 로그인 상태·`accessToken` 보관/주입
4. `components/layout`(Header, Nav) · `components/common`(Button, Input, Modal, Card, Pagination)의 **기본형**
5. 스타일 토큰(색·간격·타이포)

## 작업 분담

두 도메인 묶음의 작업량이 비슷하도록 나눔.

### A — 도서 · 주석 (콘텐츠 코어) - 에이

| 영역 | 페이지 / 컴포넌트 | 관련 API (`../docs/api-spec.md`) |
|---|---|---|
| 홈·책 목록 | `HomePage` (목록·검색·장르 필터) | `GET /books` |
| 책 상세 | `BookDetailPage` (주석 카드 피드, 정렬/유형 필터) | `GET /books/{id}`, `GET /books/{id}/annotations` |
| 주석 작성·수정 | `AnnotationForm` (작성/수정, 공개범위·스포일러) | `POST/PATCH/DELETE /annotations` |
| 주석 상세 | `AnnotationDetailPage` (본문·댓글·좋아요) | `GET /annotations/{id}` |
| 댓글 | 댓글 목록·작성·수정·삭제 | `.../comments`, `PATCH/DELETE /comments/{id}` |
| 좋아요·즐겨찾기 | 좋아요/즐겨찾기 버튼(주석·댓글·책) | `/likes`, `.../favorite` |
| 주석 검색 | `SearchPage` (페이지·키워드) | `GET /annotations/search` |

### B — 계정 · 소셜 (사용자 코어)

| 영역 | 페이지 / 컴포넌트 | 관련 API (`../docs/api-spec.md`) |
|---|---|---|
| 인증 | `LoginPage`, `RegisterPage` | `/auth/register`, `/auth/login`, `/auth/logout` |
| 마이페이지 | `MyPage` (내 주석·즐겨찾기·그룹·친구 탭) | `/users/me`, `/users/me/*` |
| 친구 | `FriendsPage` (검색·요청·수락·목록) | `GET /users`, `/friends`, `/users/me/friend-requests` |
| 그룹 목록·생성 | `GroupListPage`, `GroupForm` | `GET /users/me/groups`, `POST /groups` |
| 그룹 상세 | `GroupDetailPage` (멤버·도서 관리) | `GET/PATCH/DELETE /groups/{id}`, `.../members`, `.../books` |
| 그룹 피드 | 그룹 주석 모아보기 | `GET /groups/{id}/annotations` |

> 인증 상태(`AuthContext`)는 공통이지만 **B가 주 관리**하고, A는 소비만 한다.

## 충돌 주의 파일 (수정 시 서로 알리기)

- **`App.jsx`** — 둘 다 라우트를 추가. Phase 0에서 전체 라우트를 미리 선언해 두면 이후 수정이 거의 없다.
- **`api/client.js`** — Phase 0에서 확정 후 변경 최소화.
- **`components/common/*`** — 새 공통 컴포넌트 추가는 PR로 공유.

## 협업 규칙

- `main` 직접 push 금지. 각자 feature 브랜치 → PR → 병합. (예: `feat/books-feed`, `feat/group-detail`)
- 커밋 전 `main` 최신화(pull → rebase) 후 자기 브랜치 작업.
- API 스펙과 다르게 구현해야 할 상황이 생기면 코드보다 `../docs/api-spec.md`를 먼저 고치고 상대에게 알린다.

## 참고 문서

- [../docs/tech.md](../docs/tech.md) — 기술 스택, API 설계 규약
- [../docs/api-spec.md](../docs/api-spec.md) — 엔드포인트별 요청/응답 스펙
- [../README.md](../README.md) — "IA 및 화면 설계서"(화면 구성), "DB 스키마"
