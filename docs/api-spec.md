# API 명세서 — 문장서재

이 문서는 실제 Django 백엔드(`backend/*/urls.py`, `backend/*/views.py`)를 기준으로 정리한 명세입니다. `frontend/mock-server.js`는 초기 개발용 mock이며, 실제 응답 형식(bare 배열/`{data:[...]}` 등)은 백엔드 구현을 따릅니다.

## 1. 공통 규약

### Base URL

```text
/api
```

### 인증

로그인 성공 시 받은 `accessToken`을 Bearer 토큰으로 전달합니다.

```http
Authorization: Bearer <accessToken>
```

mock server는 개발 편의를 위해 토큰 검증을 강하게 하지 않지만, 실제 API는 🔒 표시된 endpoint에 인증이 필요합니다.

### 응답 형식

단건 조회는 객체를 바로 반환합니다.

목록 조회는 가능한 한 아래 페이지네이션 래퍼를 사용합니다.

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalElements": 0,
    "totalPages": 1
  }
}
```

일부 사용자/친구/그룹 endpoint는 현재 프론트 호환을 위해 `{ data: [...] }` 또는 배열 자체를 반환할 수 있습니다. 프론트는 두 형태를 모두 처리합니다.

### 에러 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "필수값이 누락되었습니다."
  }
}
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 필수값 누락, 형식 오류 |
| 401 | `UNAUTHORIZED` | 인증 실패 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `DUPLICATE` | 중복 요청 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |

### ENUM

| 필드 | 값 |
|---|---|
| `annotation.type` | `QUESTION`, `DISCUSSION`, `REVIEW`, `NORMAL` |
| `annotation.visibility` | `public`, `friends`, `group`, `private` |
| `like.targetType` | `annotation`, `comment` |
| `friend.status` | `PENDING`, `ACCEPTED` |
| `friendRequest.direction` | `received`, `sent` |

### 정렬

현재 구현에서 사용하는 정렬 값입니다.

| 값 | 의미 |
|---|---|
| `recent,desc` | 최신순 |
| `likes,desc` | 좋아요순 |
| `popular` | 좋아요순 alias |
| `pageNumber` | 책 페이지 오름차순 |

## 2. 객체 스키마

### User

```json
{
  "id": 1,
  "nickname": "테스트유저",
  "email": "a@b.com",
  "bio": "책 속의 문장이 나를 바꾸고...",
  "avatarUrl": "",
  "avatarIcon": "",
  "createdAt": "2026-07-03T12:00:00Z"
}
```

### Book

```json
{
  "bookId": 6,
  "title": "데미안",
  "author": "헤르만 헤세",
  "publishDate": "1919-01-01",
  "isbn": "9788937460449",
  "genreCode": "NOVEL",
  "coverImageUrl": "",
  "annotationCount": 3,
  "isFavorited": true
}
```

### Annotation

```json
{
  "annotationId": 8,
  "book": {
    "bookId": 6,
    "title": "데미안",
    "author": "헤르만 헤세",
    "genreCode": "NOVEL",
    "coverImageUrl": ""
  },
  "author": { "id": 1, "nickname": "테스트유저" },
  "type": "REVIEW",
  "passage": "새는 알에서 나오려고 투쟁한다.",
  "review": "성장의 통과의례를 압축한 문장.",
  "page": 48,
  "visibility": "public",
  "isSpoiler": false,
  "groupId": 9,
  "likeCount": 15,
  "commentCount": 4,
  "isLiked": false,
  "isFavorited": true,
  "createdAt": "2026-07-03T19:00:00Z"
}
```

### Comment

현재 프론트는 댓글에도 유형 필터를 제공합니다. 서버는 `type`, `commentType`, `comment_type`, `category`, `commentCategory` 중 전달된 값을 받아 같은 유형으로 저장할 수 있습니다.

```json
{
  "commentId": 1,
  "annotationId": 8,
  "author": { "id": 2, "nickname": "seo_reader" },
  "type": "REVIEW",
  "commentType": "REVIEW",
  "comment_type": "REVIEW",
  "category": "REVIEW",
  "commentCategory": "REVIEW",
  "content": "저는 이 구절을 다르게 읽었어요.",
  "likeCount": 3,
  "isLiked": false,
  "createdAt": "2026-07-03T15:00:00Z"
}
```

### Group

목록 응답:

```json
{
  "groupId": 9,
  "groupName": "데미안 같이 읽기 소모임",
  "owner": { "id": 9, "nickname": "헤세매니아" },
  "memberIds": [9, 1, 5, 7],
  "bookIds": [6, 7],
  "memberCount": 4,
  "bookCount": 2,
  "coverImageUrl": "",
  "books": [
    { "bookId": 6, "title": "데미안", "coverImageUrl": "" }
  ],
  "lastActivityAt": "2026-07-03T08:00:00Z",
  "createdAt": "2026-07-01T14:00:00Z"
}
```

`books`는 카드에 표지를 겹쳐 보여주기 위한 미리보기로 최대 5권만 포함합니다.

상세 응답:

```json
{
  "groupId": 9,
  "groupName": "데미안 같이 읽기 소모임",
  "owner": { "id": 9, "nickname": "헤세매니아" },
  "members": [
    { "id": 9, "nickname": "헤세매니아" },
    { "id": 1, "nickname": "테스트유저" }
  ],
  "books": [
    { "bookId": 6, "title": "데미안", "author": "헤르만 헤세", "genreCode": "NOVEL", "coverImageUrl": "" }
  ],
  "notice": {
    "noticeId": 3,
    "content": "이번 주 모임은 금요일 저녁입니다.",
    "author": { "id": 9, "nickname": "헤세매니아" },
    "createdAt": "2026-07-08T00:00:00Z"
  },
  "createdAt": "2026-07-01T14:00:00Z"
}
```

공지가 없으면 `notice`는 `null`입니다.

## 3. 인증 · 사용자

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입 | - |
| GET | `/api/auth/nickname-check` | 닉네임 중복 확인 | - |
| GET | `/api/auth/email-check` | 이메일 중복 확인 | - |
| POST | `/api/auth/login` | 로그인 및 토큰 발급 | - |
| POST | `/api/auth/kakao` | 카카오 로그인/가입 및 토큰 발급 | - |
| POST | `/api/auth/logout` | 로그아웃 | 🔒 |
| GET | `/api/users/me` | 내 정보 조회 | 🔒 |
| PATCH | `/api/users/me` | 프로필 수정 | 🔒 |
| GET | `/api/users` | 닉네임 사용자 검색 | 🔒 |
| GET | `/api/users/{userId}` | 사용자 공개 프로필 조회 | - |

### POST `/api/auth/register`

요청:

```json
{ "nickname": "reader01", "email": "a@b.com", "password": "pw1234!!" }
```

응답 `201`:

```json
{ "id": 13, "nickname": "reader01", "email": "a@b.com", "createdAt": "2026-07-04T00:00:00.000Z" }
```

### GET `/api/auth/nickname-check?nickname={nickname}`

응답:

```json
{ "available": true }
```

### GET `/api/auth/email-check?email={email}`

응답:

```json
{ "available": true }
```

### POST `/api/auth/login`

요청:

```json
{ "email": "a@b.com", "password": "pw1234!!" }
```

응답 `200`:

```json
{
  "accessToken": "mock-jwt-token-1",
  "user": {
    "id": 1,
    "nickname": "테스트유저",
    "email": "a@b.com",
    "bio": "책 속의 문장이 나를 바꾸고...",
    "avatarUrl": "",
    "avatarIcon": "",
    "createdAt": "2026-07-03T12:00:00Z"
  }
}
```

mock server는 개발 편의를 위해 이메일/비밀번호가 정확히 일치하지 않아도 기본 사용자로 로그인됩니다.

### POST `/api/auth/kakao`

프론트에서 카카오 인가 코드(`code`)와 로그인에 사용한 `redirectUri`를 전달하면, 서버가 카카오 토큰 교환·프로필 조회를 대행하고 신규 유저면 자동 가입시킵니다. 카카오 프로필의 닉네임은 사용하지 않고 임시 닉네임(`카카오사용자####`)을 부여하며, 최초 가입(`isNewUser: true`)이면 프론트는 닉네임 설정 온보딩(`/onboarding/nickname`)으로 이동합니다.

요청:

```json
{ "code": "카카오 인가 코드", "redirectUri": "http://localhost:5173/auth/kakao/callback" }
```

응답 `200`:

```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": 20,
    "nickname": "카카오사용자1234",
    "email": "kakao_1234@kakao.local",
    "bio": "",
    "avatarUrl": "",
    "avatarIcon": "",
    "createdAt": "2026-07-08T00:00:00Z"
  },
  "isNewUser": true
}
```

이미 다른 계정에서 같은 이메일을 이메일/비밀번호 방식으로 가입한 경우 `400 VALIDATION_ERROR`를 반환합니다.

### POST `/api/auth/logout` 🔒

응답: `204 No Content`

### GET `/api/users/me` 🔒

응답: `User`

### PATCH `/api/users/me` 🔒

요청:

```json
{
  "nickname": "새닉네임",
  "password": "new-password",
  "bio": "소개",
  "avatarUrl": "",
  "avatarIcon": "reader"
}
```

응답: 수정된 `User`

### GET `/api/users?nickname={keyword}` 🔒

응답:

```json
{
  "data": [
    { "id": 6, "nickname": "easy0131" }
  ]
}
```

### GET `/api/users/{userId}`

공개 프로필. 비로그인도 조회 가능하며, 통계(`annotationCount`, `totalLikes`)는 조회자에게 보이는 공개/친구공개 주석 기준으로 계산합니다.

응답:

```json
{
  "id": 6,
  "nickname": "easy0131",
  "bio": "책 속의 문장이 나를 바꾸고...",
  "avatarUrl": "",
  "avatarIcon": "cat",
  "createdAt": "2026-07-03T12:00:00Z",
  "annotationCount": 12,
  "totalLikes": 34
}
```

## 4. 책

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/books` | 책 목록/검색 | - |
| GET | `/api/books/categories` | 최근 30일 좋아요 기반 인기 카테고리 상위 3개 | - |
| GET | `/api/books/daily-quote` | 오늘의 문장 큐레이션 | - |
| GET | `/api/books/external-search` | 알라딘 도서 검색(등록 전 미리보기) | - |
| POST | `/api/books/import-from-aladin` | 알라딘 ISBN으로 책 등록/조회 | - |
| GET | `/api/books/recommendations` | 추천 책 목록 | - |
| GET | `/api/books/{bookId}` | 책 상세 | - |
| POST | `/api/books` | 책 등록 | 🔒 |
| POST | `/api/books/{bookId}/favorite` | 책 북마크 추가 | 🔒 |
| DELETE | `/api/books/{bookId}/favorite` | 책 북마크 해제 | 🔒 |
| GET | `/api/users/me/favorite-books` | 내 북마크 책 목록 | 🔒 |

### GET `/api/books`

쿼리:

| 이름 | 설명 |
|---|---|
| `keyword` | 제목 또는 저자 검색 |
| `genreCode` | 장르 필터 |
| `sort` | `popular` 지원 |
| `page`, `size` | 페이지네이션 |

응답:

```json
{
  "data": [ { "bookId": 6, "title": "데미안", "author": "헤르만 헤세", "genreCode": "NOVEL", "annotationCount": 3, "isFavorited": true } ],
  "pagination": { "page": 1, "size": 20, "totalElements": 1, "totalPages": 1 }
}
```

### GET `/api/books/categories`

최근 30일간 좋아요를 받은 주석이 속한 책의 중분류 카테고리를 집계해 상위 3개를 반환합니다(홈 화면 인기 카테고리).

응답:

```json
{
  "data": [
    { "label": "에세이", "value": "에세이", "count": 12 }
  ]
}
```

### GET `/api/books/daily-quote?date={YYYY-MM-DD}`

`date` 생략 시 오늘 날짜 기준. 해당 월/일의 큐레이션 문장 중 하나를 무작위로 반환합니다.

응답:

```json
{
  "date": "7월 8일",
  "topic": "여름밤의 기억",
  "author": "헤르만 헤세",
  "book_title": "데미안",
  "content": "새는 알에서 나오려고 투쟁한다.",
  "coverImageUrl": "",
  "isbn": "9788937460449"
}
```

### GET `/api/books/external-search?keyword={keyword}`

알라딘 API로 외부 도서를 검색합니다(아직 DB에 등록되지 않은 책 포함). 쿼리 `field`(제목/저자 등), `page`, `size` 지원.

응답:

```json
{ "data": [ { "title": "데미안", "author": "헤르만 헤세", "isbn": "9788937460449", "genreCode": "NOVEL", "coverImageUrl": "" } ] }
```

### POST `/api/books/import-from-aladin`

요청:

```json
{ "isbn": "9788937460449" }
```

이미 DB에 같은 ISBN의 책이 있으면 그 `Book`을 그대로 반환(`200`)하고, 없으면 알라딘 조회 결과로 새로 생성해 반환합니다(`201`). 알라딘에서 찾지 못하면 `404`.

응답: `Book`

### GET `/api/books/{bookId}`

응답: `Book`

### POST `/api/books` 🔒

요청:

```json
{
  "title": "새 책",
  "author": "작가",
  "publishDate": "2026-01-01",
  "isbn": "isbn",
  "genreCode": "NOVEL",
  "coverImageUrl": ""
}
```

응답: 생성된 `Book`

### POST `/api/books/{bookId}/favorite` 🔒

책 북마크 추가. 홈, 검색, 책 상세, 마이페이지에서 사용합니다.

응답: `201`

### DELETE `/api/books/{bookId}/favorite` 🔒

책 북마크 해제.

응답: `204`

### GET `/api/users/me/favorite-books` 🔒

응답: `Book` 목록 페이지네이션

## 5. 주석

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/annotations/feed` | 홈/둘러보기 주석 피드 | - |
| GET | `/api/annotations/search` | 주석 검색 | - |
| POST | `/api/annotations` | 주석 작성 | 🔒 |
| GET | `/api/annotations/{annotationId}` | 주석 상세 | - |
| PATCH | `/api/annotations/{annotationId}` | 주석 수정 | 🔒 |
| DELETE | `/api/annotations/{annotationId}` | 주석 삭제 | 🔒 |
| GET | `/api/books/{bookId}/annotations` | 책별 주석 목록 | - |
| POST | `/api/annotations/{annotationId}/favorite` | 주석 즐겨찾기 추가 | 🔒 |
| DELETE | `/api/annotations/{annotationId}/favorite` | 주석 즐겨찾기 해제 | 🔒 |
| GET | `/api/users/me/annotations` | 내가 작성한 주석 목록 | 🔒 |
| GET | `/api/users/{userId}/annotations` | 특정 사용자가 작성한 주석 목록(공개 범위 준수) | - |
| GET | `/api/users/me/favorite-annotations` | 내 즐겨찾기 주석 목록 | 🔒 |

### GET `/api/annotations/feed`

쿼리:

| 이름 | 설명 |
|---|---|
| `recentHours` | 최근 N시간 주석만 조회 |
| `scope` | `friends`면 친구 공개/공개 피드 |
| `sort` | `likes,desc`, `recent,desc` |
| `page`, `size` | 페이지네이션 |

응답: `Annotation` 목록 페이지네이션

### GET `/api/annotations/search`

쿼리:

| 이름 | 설명 |
|---|---|
| `bookId` | 특정 책으로 제한 |
| `keyword` | 인용 구절 또는 주석 본문 검색 |
| `pageNumber` | 페이지 번호 검색 |
| `type` | 주석 유형 필터 |
| `sort` | 정렬 |
| `page`, `size` | 페이지네이션 |

응답: `Annotation` 목록 페이지네이션

### POST `/api/annotations` 🔒

요청:

```json
{
  "bookId": 6,
  "type": "REVIEW",
  "passage": "새는 알에서 나오려고 투쟁한다.",
  "review": "성장에 대한 메모",
  "page": 48,
  "visibility": "public",
  "isSpoiler": false,
  "groupId": null
}
```

응답: 생성된 `Annotation`

### GET `/api/books/{bookId}/annotations`

쿼리:

| 이름 | 설명 |
|---|---|
| `type` | 주석 유형 필터 |
| `sort` | `recent,desc`, `likes,desc`, `popular`, `pageNumber` |
| `page`, `size` | 페이지네이션 |

응답: `Annotation` 목록 페이지네이션

### POST `/api/annotations/{annotationId}/favorite` 🔒

주석 즐겨찾기 추가. 홈 피드, 검색, 책 상세, 주석 상세에서 사용합니다.

응답: `201`

### DELETE `/api/annotations/{annotationId}/favorite` 🔒

주석 즐겨찾기 해제.

응답: `204`

## 6. 댓글

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/annotations/{annotationId}/comments` | 댓글 목록 | - |
| POST | `/api/annotations/{annotationId}/comments` | 댓글 작성 | 🔒 |
| PATCH | `/api/comments/{commentId}` | 댓글 수정 | 🔒 |
| DELETE | `/api/comments/{commentId}` | 댓글 삭제 | 🔒 |

### GET `/api/annotations/{annotationId}/comments`

쿼리:

| 이름 | 설명 |
|---|---|
| `type` | `QUESTION`, `REVIEW`, `DISCUSSION`, `NORMAL` |
| `sort` | `popular`, `recent,desc` |
| `page`, `size` | 페이지네이션 |

응답: `Comment` 목록 페이지네이션

### POST `/api/annotations/{annotationId}/comments` 🔒

요청:

```json
{
  "type": "REVIEW",
  "commentType": "REVIEW",
  "comment_type": "REVIEW",
  "category": "REVIEW",
  "commentCategory": "REVIEW",
  "content": "저는 이 구절을 이렇게 읽었어요."
}
```

응답: 생성된 `Comment`

## 7. 좋아요

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/likes` | 좋아요 추가 | 🔒 |
| DELETE | `/api/likes` | 좋아요 취소 | 🔒 |

### POST `/api/likes` 🔒

요청:

```json
{ "targetType": "annotation", "targetId": 8 }
```

응답:

```json
{ "likeId": 1, "targetType": "annotation", "targetId": 8, "createdAt": "2026-07-04T00:00:00.000Z" }
```

### DELETE `/api/likes?targetType={targetType}&targetId={targetId}` 🔒

응답: `204`

## 8. 친구

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/users/me/friends` | 내 친구 목록 | 🔒 |
| GET | `/api/users/me/friend-requests` | 친구 요청 목록 | 🔒 |
| POST | `/api/friends` | 친구 요청 보내기 | 🔒 |
| POST | `/api/friends/{userId}/accept` | 친구 요청 수락 | 🔒 |
| DELETE | `/api/friends/{userId}` | 요청 취소/거절 또는 친구 삭제 | 🔒 |

### GET `/api/users/me/friend-requests`

쿼리:

| 이름 | 설명 |
|---|---|
| `direction` | `received` 또는 `sent` |

응답:

```json
{
  "data": [
    { "userId": 10, "nickname": "책벌레A", "status": "PENDING", "createdAt": "2026-07-03T15:00:00Z" }
  ]
}
```

### POST `/api/friends` 🔒

요청:

```json
{ "friendId": 6 }
```

응답:

```json
{ "requesterId": 1, "addresseeId": 6, "status": "PENDING", "createdAt": "2026-07-04T00:00:00.000Z" }
```

## 9. 그룹 주석방

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/users/me/groups` | 내가 속한 그룹 목록 | 🔒 |
| POST | `/api/groups` | 그룹 생성 | 🔒 |
| GET | `/api/groups/{groupId}` | 그룹 상세 | 🔒 |
| PATCH | `/api/groups/{groupId}` | 그룹 이름 수정 | 🔒 |
| DELETE | `/api/groups/{groupId}` | 그룹 삭제 | 🔒 |
| GET | `/api/groups/{groupId}/members` | 그룹 멤버 목록 | 🔒 |
| POST | `/api/groups/{groupId}/members` | 멤버 초대/추가 | 🔒 |
| DELETE | `/api/groups/{groupId}/members/{userId}` | 멤버 내보내기/나가기 | 🔒 |
| POST | `/api/groups/{groupId}/members/{userId}/accept` | 그룹 초대 수락(URL의 userId는 무시, 본인만 가능) | 🔒 |
| GET | `/api/groups/{groupId}/invitations` | 대기 중인 초대 목록(owner 전용) | 🔒 |
| GET | `/api/users/me/group-invitations` | 내가 받은 대기 중인 그룹 초대 목록 | 🔒 |
| POST | `/api/groups/{groupId}/notice` | 그룹 공지 작성/수정(owner 전용, 최신 1건 갱신) | 🔒 |
| GET | `/api/groups/{groupId}/books` | 그룹 도서 목록 | 🔒 |
| POST | `/api/groups/{groupId}/books` | 그룹 도서 추가 | 🔒 |
| DELETE | `/api/groups/{groupId}/books/{bookId}` | 그룹 도서 제거 | 🔒 |
| GET | `/api/groups/{groupId}/annotations` | 그룹 주석 피드 | 🔒 |

### GET `/api/users/me/groups` 🔒

응답: `Group` 목록. 페이지네이션 없이 배열 자체를 반환합니다.

### POST `/api/groups` 🔒

요청:

```json
{
  "groupName": "데미안 같이 읽기",
  "bookIds": [6],
  "memberIds": [5, 7]
}
```

응답: 생성된 `Group`

### GET `/api/groups/{groupId}` 🔒

응답: 그룹 상세 객체

### POST `/api/groups/{groupId}/members` 🔒

요청:

```json
{ "userId": 7 }
```

응답:

```json
{ "userId": 7, "status": "JOINED" }
```

중복이면 `409 DUPLICATE`.

### GET `/api/groups/{groupId}/invitations` 🔒

owner만 조회 가능. 대기 중(PENDING)인 초대 대상자 목록을 반환합니다.

응답:

```json
[
  { "userId": 7, "nickname": "책벌레A", "avatarUrl": "", "avatarIcon": "cat", "invitedAt": "2026-07-04T00:00:00Z" }
]
```

### GET `/api/users/me/group-invitations` 🔒

내가 받은 대기 중(PENDING)인 그룹 초대 목록.

응답:

```json
[
  {
    "groupId": 9,
    "groupName": "데미안 같이 읽기 소모임",
    "owner": { "id": 9, "nickname": "헤세매니아" },
    "memberCount": 4,
    "invitedAt": "2026-07-04T00:00:00Z"
  }
]
```

### POST `/api/groups/{groupId}/notice` 🔒

owner만 작성 가능. 그룹당 최신 공지 1건만 유지하며, 이미 공지가 있으면 내용을 덮어씁니다.

요청:

```json
{ "content": "이번 주 모임은 금요일 저녁입니다." }
```

응답 `201`:

```json
{
  "noticeId": 3,
  "content": "이번 주 모임은 금요일 저녁입니다.",
  "author": { "id": 9, "nickname": "헤세매니아" },
  "createdAt": "2026-07-08T00:00:00Z"
}
```

### POST `/api/groups/{groupId}/books` 🔒

요청:

```json
{ "bookId": 6 }
```

응답:

```json
{ "bookId": 6 }
```

중복이면 `409 DUPLICATE`.

### GET `/api/groups/{groupId}/annotations` 🔒

쿼리:

| 이름 | 설명 |
|---|---|
| `bookId` | 특정 책으로 제한 |
| `type` | 주석 유형 필터 |
| `sort` | 정렬 |
| `page`, `size` | 페이지네이션 |

응답: `Annotation` 목록 페이지네이션

## 10. 프론트 사용 요약

| 화면 | 사용하는 주요 API |
|---|---|
| 로그인/회원가입 | `POST /auth/login`, `POST /auth/kakao`, `POST /auth/register`, `GET /auth/nickname-check`, `GET /auth/email-check` |
| 홈 | `GET /books`, `GET /books/categories`, `GET /books/daily-quote`, `GET /annotations/feed`, 책 북마크, 주석 즐겨찾기 |
| 검색 | `GET /books`, `GET /books/external-search`, `GET /annotations/search`, `GET /annotations/feed`, 책 북마크, 주석 즐겨찾기 |
| 책 상세 | `GET /books/{bookId}`, `GET /books/{bookId}/annotations`, `GET /annotations/search`, 책 북마크, 주석 좋아요/즐겨찾기 |
| 주석 상세 | `GET /annotations/{annotationId}`, `GET/POST /annotations/{id}/comments`, 좋아요, 주석 즐겨찾기 |
| 마이페이지 | `GET /users/me/*`, 주석/책 즐겨찾기 목록, 친구/그룹 API |
| 사용자 프로필 | `GET /users/{userId}`, `GET /users/{userId}/annotations` |
| 그룹 라운지 | `GET /users/me/groups`, `GET /users/me/group-invitations`, `POST /groups` |
| 그룹 상세 | `GET/PATCH/DELETE /groups/{groupId}`, 멤버/초대/공지, 도서 추가·삭제 |
