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
- JWT Bearer 토큰 기반 API 인증
- 마이페이지에서 내 정보, 작성한 주석, 즐겨찾기한 책/주석, 친구, 그룹 확인
- 닉네임 기반 사용자 검색 및 친구 요청/수락/삭제

### 책 탐색 및 북마크

- 홈 화면에서 책 목록과 장르 필터 제공
- 검색 화면에서 책 제목/저자/주석 통합 검색
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

- 마이페이지에서 그룹 생성
- 그룹 상세에서 그룹 이름 수정, 그룹 삭제/나가기
- 멤버 초대/내보내기
- 그룹 도서 추가/제거
- 그룹 도서를 클릭하면 해당 책 상세로 이동
- 그룹 주석 피드는 `groupId`, `bookId`, `type` 기반 필터를 지원하는 API로 확장 가능

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
| `/mypage` | 마이페이지 | 대시보드, 내 주석, 즐겨찾기, 내 서재, 그룹, 친구, 설정 |
| `/groups/:groupId` | 그룹 상세 | 그룹 정보, 멤버 관리, 도서 관리 |

## 기술 스택

| 영역 | 사용 |
|---|---|
| Frontend | Vite, React, React Router |
| HTTP Client | axios |
| Styling | Tailwind CSS + 전역 컴포넌트 클래스 |
| Mock API | json-server 기반 Express 스타일 mock server |
| Auth State | React Context |

## 폴더 구조

```text
frontend/
├── mock-server.js
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── annotations.js
│   │   ├── comments.js
│   │   ├── likes.js
│   │   ├── users.js
│   │   ├── friends.js
│   │   └── groups.js
│   ├── components/
│   │   └── SiteHeader.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── BookDetailPage.jsx
│   │   ├── AnnotationFormPage.jsx
│   │   ├── AnnotationDetailPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── MyPage.jsx
│   │   └── GroupDetailPage.jsx
│   └── styles/
│       └── global.css
└── package.json
```

## 실행 방법

```bash
cd frontend
npm install
npm run mock
```

다른 터미널에서:

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Mock API: `http://localhost:4000`
- 테스트 로그인: mock 서버에서는 기본 사용자로 로그인 가능하도록 완화되어 있습니다.

## API 문서

상세 API 명세는 [docs/api-spec.md](docs/api-spec.md)를 참고합니다.

주요 API 그룹:

- 인증/사용자: `/api/auth/*`, `/api/users/*`
- 책: `/api/books`, `/api/books/{bookId}`, `/api/books/{bookId}/favorite`
- 주석: `/api/annotations`, `/api/annotations/search`, `/api/annotations/{annotationId}/favorite`
- 댓글: `/api/annotations/{annotationId}/comments`, `/api/comments/{commentId}`
- 좋아요: `/api/likes`
- 친구: `/api/friends`, `/api/users/me/friend-requests`
- 그룹: `/api/groups`, `/api/groups/{groupId}/members`, `/api/groups/{groupId}/books`

## 구현 상태

- 홈/검색/책 상세/주석 상세/작성/수정 플로우 구현
- 책 북마크 및 주석 즐겨찾기 UI 구현
- 주석/댓글 좋아요 구현
- 마이페이지 대시보드, 내 주석, 즐겨찾기, 내 서재, 친구, 그룹 탭 구현
- 그룹 생성/상세/멤버 초대/도서 추가 구현
- mock server에 한국어 데모 데이터와 전체 API 응답 구현

## 참고 문서

- [docs/api-spec.md](docs/api-spec.md): API 상세 명세
- [docs/product.md](docs/product.md): 제품 기획 메모
- [docs/structure.md](docs/structure.md): 구조 문서
- [docs/tech.md](docs/tech.md): 기술 문서
