# API 문서 — 주석노트

> 첨부 ERD(`final2.png`)와 서비스 개요를 기준으로 작성. 아래 두 결정을 반영함.
> - **좋아요**: polymorphic `likes` 테이블을 단일 집계 소스로 사용 (`like_count` 컬럼 미사용, `COUNT`로 파생)
> - **유형(주석/질문/토론/일반)**: `annotations.type`에만 부여, 댓글에는 유형 없음

---

## 1. 공통 규약

### Base URL
```
/api
```

### 인증
- 방식: **JWT (Bearer)**. 로그인 시 발급된 `accessToken`을 헤더에 담아 전송.
- 인증 필요 엔드포인트는 각 표의 `인증` 열에 🔒 로 표시.
```
Authorization: Bearer <accessToken>
```

### 요청/응답 포맷
- 모든 요청·응답 본문은 `application/json; charset=utf-8`.
- 필드 표기는 `camelCase`, 서버 내부 컬럼(`snake_case`)과 매핑됨.

### 페이지네이션 응답 포맷
목록 조회는 아래 형태로 감싸서 반환.
```json
{
  "data": [ /* ... */ ],
  "pagination": { "page": 1, "size": 20, "totalElements": 135, "totalPages": 7 }
}
```
- 공통 쿼리: `?page=1&size=20` (기본값 `page=1`, `size=20`)

### 공통 에러 응답 포맷
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "이메일 형식이 올바르지 않습니다." } }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 필수값 누락·형식 오류 |
| 401 | `UNAUTHORIZED` | 토큰 없음/만료/무효 |
| 403 | `FORBIDDEN` | 권한 없음(타인 리소스 수정 등) |
| 404 | `NOT_FOUND` | 대상 리소스 없음 |
| 409 | `DUPLICATE` | 중복(이메일·닉네임·좋아요·즐겨찾기·친구요청 등) |
| 500 | `INTERNAL_ERROR` | 서버 오류 |

### 공통 ENUM / 값 정의

| 필드 | 값 | 설명 |
|---|---|---|
| `annotations.type` | `DISCUSSION` / `QUESTION` / `REVIEW` / `NORMAL` | 토론 / 질문 / 감상 / 일반 (기본값 `NORMAL`) |
| `annotations.visibility` | `public` / `friends` / `group` / `private` | 전체 / 친구 / 그룹 / 비공개 |
| `annotations.isSpoiler` | `true` / `false` | 스포일러 포함 여부 |
| `annotations.groupId` | 그룹 `id` 또는 `null` | 그룹 안에서 작성된 주석이면 그룹 id, 그 외 `null` |
| `likes.targetType` | `annotation` / `comment` | 좋아요 대상 종류 |
| `friends.status` | `PENDING` / `ACCEPTED` | 요청 대기 / 수락됨 |

---

## 2. 인증 · 사용자

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입 | - |
| POST | `/api/auth/login` | 로그인(토큰 발급) | - |
| POST | `/api/auth/logout` | 로그아웃 | 🔒 |
| GET | `/api/users/me` | 내 정보 조회 | 🔒 |
| PATCH | `/api/users/me` | 닉네임/비밀번호 변경 | 🔒 |
| GET | `/api/users` | 닉네임으로 사용자 검색(친구 추가용) | 🔒 |

### POST `/api/auth/register`
요청
```json
{ "nickname": "reader01", "email": "a@b.com", "password": "pw1234!!" }
```
응답 `201`
```json
{ "id": 1, "nickname": "reader01", "email": "a@b.com", "createdAt": "2026-07-03T12:00:00Z" }
```
에러: `400` 형식 오류 · `409` 이메일/닉네임 중복

### POST `/api/auth/login`
요청
```json
{ "email": "a@b.com", "password": "pw1234!!" }
```
응답 `200`
```json
{
  "accessToken": "eyJhbGc...",
  "user": { "id": 1, "nickname": "reader01", "email": "a@b.com" }
}
```
에러: `401` 이메일/비밀번호 불일치

### POST `/api/auth/logout` 🔒
- JWT는 무상태이므로 클라이언트가 토큰을 폐기. (서버에서 블랙리스트를 둘 경우 해당 토큰 무효화)
- 응답 `204 No Content`

### GET `/api/users/me` 🔒
응답 `200`
```json
{
  "id": 1, "nickname": "reader01", "email": "a@b.com",
  "bio": "책 속의 문장이 나를 바꾸고, 나의 문장이 누군가에게 닿기를.",
  "avatarUrl": "https://.../avatar.jpg",
  "avatarIcon": "cat",
  "createdAt": "2026-07-03T12:00:00Z"
}
```
- `bio`, `avatarUrl`은 마이페이지 대시보드 프로필 카드용 선택 필드. 미설정 시 `null`.
- `avatarIcon`은 사용자가 이미지 업로드 대신 선택하는 프리셋 아이콘 키(예: `reader`/`cat`/`fox`/`bear`/`rabbit`/`owl`/`star`/`plant`/`coffee`/`moon`, 프런트 `AVATAR_ICON_OPTIONS` 참고). 미설정 시 `null`. `avatarUrl`과는 별개 필드이며 동시에 값이 있을 경우 어느 쪽을 화면에 렌더링할지는 추후 결정(현재는 어느 화면에도 표시하지 않고 설정 저장만 지원).

### PATCH `/api/users/me` 🔒
요청(부분 수정)
```json
{ "nickname": "reader_new", "password": "newpw!!", "bio": "새 소개", "avatarUrl": "https://.../avatar.jpg", "avatarIcon": "cat" }
```
응답 `200` — 수정된 사용자 객체 · 에러 `409` 닉네임 중복

### GET `/api/users?nickname={nickname}` 🔒
- 친구 추가 시 사용. 닉네임 부분/완전 일치 검색.
응답 `200`
```json
{ "data": [ { "id": 5, "nickname": "reader_kim" } ] }
```

---

## 3. 도서

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/books` | 책 목록 조회 · 검색(제목/저자) | - |
| GET | `/api/books/{bookId}` | 책 상세 | - |
| POST | `/api/books` | 새 책 등록 | 🔒 |

### GET `/api/books`
쿼리
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `keyword` | - | 제목 또는 저자명 검색 |
| `genreCode` | - | 장르 필터 |
| `page`, `size` | - | 페이지네이션 |

응답 `200`
```json
{
  "data": [
    {
      "bookId": 3, "title": "데미안", "author": "헤르만 헤세",
      "publishDate": "2020-01-01", "isbn": "9788937460449",
      "genreCode": "NOVEL", "coverImageUrl": "https://.../cover.jpg"
    }
  ],
  "pagination": { "page": 1, "size": 20, "totalElements": 42, "totalPages": 3 }
}
```

### GET `/api/books/{bookId}`
응답 `200`
```json
{
  "bookId": 3, "title": "데미안", "author": "헤르만 헤세",
  "publishDate": "2020-01-01", "isbn": "9788937460449",
  "genreCode": "NOVEL", "coverImageUrl": "https://.../cover.jpg",
  "annotationCount": 17, "isFavorited": false
}
```
- `isFavorited`: 인증된 요청일 때만 채워지며, 비로그인 시 `false`.
- 에러 `404` 책 없음

### POST `/api/books` 🔒
요청
```json
{
  "title": "데미안", "author": "헤르만 헤세",
  "publishDate": "2020-01-01", "isbn": "9788937460449",
  "genreCode": "NOVEL", "coverImageUrl": "https://.../cover.jpg"
}
```
응답 `201` — 생성된 책 객체 · 에러 `409` 동일 ISBN 존재

---

## 4. 즐겨찾기 — 책

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/books/{bookId}/favorite` | 책 즐겨찾기 추가 | 🔒 |
| DELETE | `/api/books/{bookId}/favorite` | 즐겨찾기 해제 | 🔒 |
| GET | `/api/users/me/favorite-books` | 내 즐겨찾기 책 목록 | 🔒 |

- `POST` 응답 `201` · 이미 즐겨찾기 상태면 `409`
- `DELETE` 응답 `204`
- `GET` 응답 `200` — 책 객체 배열(페이지네이션)

---

## 5. 주석 카드

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/annotations` | 주석 카드 작성 | 🔒 |
| GET | `/api/books/{bookId}/annotations` | 특정 책의 주석 카드 피드 | - |
| GET | `/api/annotations/{annotationId}` | 주석 카드 상세 | - |
| PATCH | `/api/annotations/{annotationId}` | 주석 카드 수정(작성자) | 🔒 |
| DELETE | `/api/annotations/{annotationId}` | 주석 카드 삭제(작성자) | 🔒 |
| GET | `/api/annotations/search` | 페이지·키워드로 공개 주석 검색 | - |
| GET | `/api/users/me/annotations` | 내가 작성한 주석 목록(마이페이지) | 🔒 |

### 주석 카드 객체(응답 공통 형태)
```json
{
  "annotationId": 12,
  "book": { "bookId": 3, "title": "데미안", "author": "헤르만 헤세", "coverImageUrl": "https://.../cover.jpg" },
  "author": { "id": 5, "nickname": "reader_kim" },
  "type": "REVIEW",
  "passage": "새는 알에서 나오려고 투쟁한다.",
  "review": "성장의 통과의례를 압축한 문장.",
  "page": 152,
  "visibility": "public",
  "isSpoiler": false,
  "groupId": null,
  "likeCount": 8,
  "commentCount": 3,
  "isLiked": true,
  "isFavorited": false,
  "createdAt": "2026-07-03T12:00:00Z"
}
```
- `likeCount`는 `likes`(targetType=`annotation`) 집계값.
- `isLiked` / `isFavorited` / `commentCount`는 상세·목록 응답에 포함, 비로그인 시 `isLiked`·`isFavorited`는 `false`.
- `groupId`는 그룹 안에서 작성된 주석이면 그룹 id, 그 외 `null`.
- `book.coverImageUrl`은 책 표지 이미지 URL(도서 객체와 동일 필드). 표지가 없으면 `null` 또는 빈 문자열.

### POST `/api/annotations` 🔒
요청
```json
{
  "bookId": 3,
  "type": "REVIEW",
  "passage": "새는 알에서 나오려고 투쟁한다.",
  "review": "성장의 통과의례를 압축한 문장.",
  "page": 152,
  "visibility": "public",
  "isSpoiler": false,
  "groupId": null
}
```
- `type` 생략 시 `NORMAL`(기본값).
- `passage`는 저작권 고려로 길이 제한(예: 최대 200자). 초과 시 `400`.
- `visibility=friends` → 작성자의 친구(ACCEPTED)에게만 노출.
- `groupId`가 있으면 그룹 안에서 작성된 주석으로 저장되며, 이 경우 `visibility`는 `group` 권장. 요청자가 해당 그룹 멤버가 아니면 `403`.
- `groupId` 미지정 시 `null`로 저장.
응답 `201` — 주석 카드 객체 · 에러 `404` 책/그룹 없음 · `403` 그룹 멤버 아님

### GET `/api/books/{bookId}/annotations`
쿼리
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `type` | - | `DISCUSSION`/`QUESTION`/`REVIEW`/`NORMAL` 필터 |
| `sort` | - | `latest`(기본) / `popular`(좋아요순) / `pageNumber`(책 페이지 오름차순) |
| `page`, `size` | - | 페이지네이션(정렬 옵션 `pageNumber`와는 별개 파라미터) |

- 반환 범위: `public` 전체 + 요청자가 작성자와 친구인 `friends` 주석 + 요청자 본인의 모든 주석. `group` 및 타인 `private`은 제외(그룹 주석은 §13 참고).
응답 `200` — 주석 카드 객체 배열(페이지네이션)

### GET `/api/annotations/{annotationId}`
응답 `200` — 주석 카드 객체
- 에러 `404` 없음 · `403` 접근 권한 없음(타인 `private`, 친구 아닌 `friends`, 멤버 아닌 `group`)

### PATCH `/api/annotations/{annotationId}` 🔒
요청(부분 수정)
```json
{ "review": "수정된 감상", "visibility": "private", "isSpoiler": true, "type": "NORMAL" }
```
응답 `200` · 에러 `403` 작성자 아님 · `404` 없음

### DELETE `/api/annotations/{annotationId}` 🔒
응답 `204` · 에러 `403` 작성자 아님 · `404` 없음

### GET `/api/annotations/search`
- 이해가 안 되는 구절에 대해 **공개 주석**을 검색.
쿼리
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `bookId` | 권장 | 검색 범위를 특정 책으로 한정 |
| `keyword` | - | `passage`·`review` 본문 키워드 |
| `pageNumber` | - | 책의 페이지 번호로 검색 |
| `type` | - | 유형 필터 |
| `sort` | - | `latest`(기본) / `popular` / `pageNumber` |
| `page`, `size` | - | 페이지네이션 |

- `keyword`와 `pageNumber` 중 최소 하나 필요. 둘 다 주면 AND 조건.
- `visibility=public`만 검색 대상.
응답 `200` — 주석 카드 객체 배열(페이지네이션)

### GET `/api/users/me/annotations` 🔒
- 마이페이지용. 본인이 작성한 주석 전체(공개범위·그룹 여부 무관).
응답 `200` — 주석 카드 객체 배열(페이지네이션)

---

## 6. 댓글

> `annotation_comments`는 `annotation_id`만 참조하는 **2단 구조**(원글 → 댓글). 대댓글 없음. 유형 없음.

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/annotations/{annotationId}/comments` | 댓글 작성 | 🔒 |
| GET | `/api/annotations/{annotationId}/comments` | 댓글 목록 | - |
| PATCH | `/api/comments/{commentId}` | 댓글 수정(작성자) | 🔒 |
| DELETE | `/api/comments/{commentId}` | 댓글 삭제(작성자) | 🔒 |

### 댓글 객체
```json
{
  "commentId": 44,
  "annotationId": 12,
  "author": { "id": 7, "nickname": "reader_lee" },
  "content": "저는 이 구절을 다르게 읽었어요.",
  "likeCount": 2,
  "isLiked": false,
  "createdAt": "2026-07-03T13:00:00Z"
}
```
- `likeCount`는 `likes`(targetType=`comment`) 집계값.

### POST `/api/annotations/{annotationId}/comments` 🔒
요청
```json
{ "content": "저는 이 구절을 다르게 읽었어요." }
```
응답 `201` — 댓글 객체 · 에러 `404` 원글 없음

### GET `/api/annotations/{annotationId}/comments`
응답 `200` — 댓글 객체 배열(페이지네이션)

### PATCH `/api/comments/{commentId}` 🔒
요청 `{ "content": "수정된 댓글" }` · 응답 `200` · 에러 `403`/`404`

### DELETE `/api/comments/{commentId}` 🔒
응답 `204` · 에러 `403`/`404`

---

## 7. 즐겨찾기 — 주석

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/annotations/{annotationId}/favorite` | 주석 즐겨찾기 추가 | 🔒 |
| DELETE | `/api/annotations/{annotationId}/favorite` | 즐겨찾기 해제 | 🔒 |
| GET | `/api/users/me/favorite-annotations` | 내 즐겨찾기 주석 목록 | 🔒 |

- `POST` `201` · 중복 시 `409`
- `DELETE` `204`
- `GET` `200` — 주석 카드 객체 배열(페이지네이션)

---

## 8. 좋아요

> 단일 `likes` 테이블에 polymorphic 저장. 대상은 `targetType` + `targetId`로 지정.
> 좋아요 수는 이 테이블 `COUNT`로 파생되어 각 객체의 `likeCount`로 노출됨.

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/likes` | 좋아요 추가 | 🔒 |
| DELETE | `/api/likes` | 좋아요 취소 | 🔒 |

### POST `/api/likes` 🔒
요청
```json
{ "targetType": "annotation", "targetId": 12 }
```
응답 `201`
```json
{ "likeId": 501, "targetType": "annotation", "targetId": 12, "createdAt": "2026-07-03T13:10:00Z" }
```
- 동일 사용자·동일 대상 중복 시 `409`(유니크: `user_id + target_type + target_id`).
- 에러 `404` 대상 없음

### DELETE `/api/likes?targetType={type}&targetId={id}` 🔒
- 예: `DELETE /api/likes?targetType=comment&targetId=44`
응답 `204` · 에러 `404` 좋아요 기록 없음

---

## 9. 친구

> `friends.status`(`PENDING`/`ACCEPTED`) 기반 **요청 → 수락** 흐름.
> 친구 요청을 보내면 `PENDING`으로 저장되고, 받은 사람이 수락하면 `ACCEPTED`가 됨.

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/friends` | 친구 요청 보내기 | 🔒 |
| GET | `/api/users/me/friend-requests` | 받은/보낸 친구 요청 목록 | 🔒 |
| POST | `/api/friends/{userId}/accept` | 친구 요청 수락 | 🔒 |
| DELETE | `/api/friends/{userId}` | 요청 거절·취소 / 친구 삭제 | 🔒 |
| GET | `/api/users/me/friends` | 내 친구 목록(수락된 것만) | 🔒 |

### POST `/api/friends` 🔒
- 닉네임 검색(`GET /api/users`)으로 얻은 `userId`를 전달. 상태 `PENDING`으로 요청 생성.
요청
```json
{ "friendId": 5 }
```
응답 `201`
```json
{ "requesterId": 1, "addresseeId": 5, "status": "PENDING", "createdAt": "2026-07-03T14:00:00Z" }
```
- 에러 `409` 이미 요청/친구 · `404` 대상 없음 · `400` 자기 자신

### GET `/api/users/me/friend-requests` 🔒
쿼리
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `direction` | - | `received`(기본, 내가 받은 대기 요청) / `sent`(내가 보낸 대기 요청) |

응답 `200`
```json
{ "data": [ { "userId": 5, "nickname": "reader_kim", "status": "PENDING", "createdAt": "2026-07-03T14:00:00Z" } ] }
```

### POST `/api/friends/{userId}/accept` 🔒
- `{userId}`가 나에게 보낸 `PENDING` 요청을 수락 → `ACCEPTED`.
응답 `200`
```json
{ "userId": 5, "nickname": "reader_kim", "status": "ACCEPTED" }
```
- 에러 `404` 해당 요청 없음 · `403` 내가 받은 요청이 아님

### DELETE `/api/friends/{userId}` 🔒
- 상태에 따라 동작: `PENDING`이면 **거절**(받은 쪽)·**취소**(보낸 쪽), `ACCEPTED`면 **친구 삭제**.
응답 `204` · 에러 `404` 관계 없음

### GET `/api/users/me/friends` 🔒
- `ACCEPTED` 상태만 반환.
응답 `200`
```json
{ "data": [ { "id": 5, "nickname": "reader_kim" } ] }
```

---

## 10. 그룹 주석방

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/groups` | 그룹 생성(생성자=방장) | 🔒 |
| GET | `/api/users/me/groups` | 내가 속한 그룹 목록 | 🔒 |
| GET | `/api/groups/{groupId}` | 그룹 상세(멤버·도서 포함) | 🔒(멤버) |
| PATCH | `/api/groups/{groupId}` | 그룹 이름 변경(방장) | 🔒 |
| DELETE | `/api/groups/{groupId}` | 그룹 삭제(방장) | 🔒 |

### POST `/api/groups` 🔒
요청
```json
{
  "groupName": "데미안 같이 읽기",
  "bookIds": [3],
  "memberIds": [5, 7]
}
```
- `memberIds`는 **친구 여부와 무관하게** 초대 가능.
응답 `201`
```json
{
  "groupId": 9, "groupName": "데미안 같이 읽기",
  "owner": { "id": 1, "nickname": "reader01" },
  "createdAt": "2026-07-03T14:00:00Z"
}
```

### GET `/api/users/me/groups` 🔒
응답 `200`
```json
[
  {
    "groupId": 9,
    "groupName": "데미안 같이 읽기",
    "owner": { "id": 2, "nickname": "헤세매니아" },
    "memberCount": 4,
    "bookCount": 2,
    "coverImageUrl": "https://.../cover.jpg",
    "lastActivityAt": "2026-07-03T09:00:00Z",
    "createdAt": "2026-07-01T14:00:00Z"
  }
]
```
- `memberCount`/`bookCount`는 마이페이지 그룹 목록 카드용 요약 필드로, 멤버·도서 목록 자체는 `GET /api/groups/{groupId}`에서 조회한다(목록 화면에서 그룹별로 상세를 추가 조회하지 않도록 하기 위함).
- `coverImageUrl`은 그룹 대표 이미지(그룹 도서 중 하나의 표지 등), 없으면 `null`.
- `lastActivityAt`은 그룹 내 최근 주석 작성 시각(마이페이지 대시보드의 "최근 활동" 표시용), 활동 없으면 `createdAt`과 동일.

### GET `/api/groups/{groupId}` 🔒(멤버)
응답 `200`
```json
{
  "groupId": 9,
  "groupName": "데미안 같이 읽기",
  "owner": { "id": 1, "nickname": "reader01" },
  "members": [ { "id": 1, "nickname": "reader01" }, { "id": 5, "nickname": "reader_kim" } ],
  "books": [ { "bookId": 3, "title": "데미안", "author": "헤르만 헤세" } ]
}
```
- 에러 `403` 멤버 아님 · `404` 없음

### PATCH `/api/groups/{groupId}` 🔒
요청 `{ "groupName": "새 이름" }` · 응답 `200` · 에러 `403` 방장 아님

### DELETE `/api/groups/{groupId}` 🔒
응답 `204` · 에러 `403` 방장 아님

---

## 11. 그룹 참여자

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/groups/{groupId}/members` | 멤버 초대/추가(방장) | 🔒 |
| GET | `/api/groups/{groupId}/members` | 멤버 목록 | 🔒(멤버) |
| DELETE | `/api/groups/{groupId}/members/{userId}` | 내보내기(방장) 또는 나가기(본인) | 🔒 |

### POST `/api/groups/{groupId}/members` 🔒
요청 `{ "userId": 8 }`
- 방장만 초대 가능. **친구 여부와 무관하게** 임의 사용자 초대 가능.
응답 `201` · 에러 `403` 방장 아님 · `409` 이미 멤버 · `404` 사용자 없음

### DELETE `/api/groups/{groupId}/members/{userId}` 🔒
- `userId == 본인` → 그룹 나가기 / `방장` → 타 멤버 내보내기.
응답 `204` · 에러 `403` 권한 없음

---

## 12. 그룹 도서

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/groups/{groupId}/books` | 그룹에 도서 추가 | 🔒(멤버) |
| GET | `/api/groups/{groupId}/books` | 그룹 도서 목록 | 🔒(멤버) |
| DELETE | `/api/groups/{groupId}/books/{bookId}` | 그룹 도서 제거 | 🔒(멤버) |

- `POST` 요청 `{ "bookId": 3 }` · 응답 `201` · 중복 시 `409`
- `DELETE` 응답 `204`

---

## 13. 그룹 주석 피드

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/groups/{groupId}/annotations` | 그룹 안에서 작성된 주석 모아보기 | 🔒(멤버) |

- 조회 조건: `annotations.group_id = {groupId}` (그룹 안에서 작성돼 `group_id`가 채워진 주석).
- 쿼리: `type`, `sort`(`latest`/`popular`/`pageNumber`), `page`, `size` 지원.
- 그룹 안 작성 주석은 `POST /api/annotations`에 `groupId`를 담아 생성(§5 참고).
응답 `200` — 주석 카드 객체 배열(페이지네이션) · 에러 `403` 멤버 아님

---

## 부록 — 설계 가정 요약

| 항목 | 결정/가정 | 근거 |
|---|---|---|
| 좋아요 집계 | `likes` 단일 테이블 `COUNT` 파생 | 사용자 확정 |
| 카드 유형 | `annotations.type`만 사용(`DISCUSSION`/`QUESTION`/`REVIEW`/`NORMAL`, 기본 `NORMAL`), 댓글엔 유형 없음 | 사용자 확정 |
| 정렬 | `latest` / `popular` / `pageNumber`(책 페이지순) | 사용자 요청 |
| 공개범위 | `public` / `friends` / `group` / `private` | 사용자 요청 |
| 댓글 구조 | 원글→댓글 2단(대댓글 없음) | `annotation_comments`가 `annotation_id`만 참조 |
| 인증 | JWT Bearer | 세션/토큰 테이블 부재 |
| 친구 | `status`(PENDING/ACCEPTED) 기반 요청→수락 흐름 | 사용자 요청(상태 컬럼 추가) |
| 그룹 초대 | 친구 아니어도 초대 가능, 방장 권한 | 사용자 요청 |
| 그룹 도서 | 한 그룹에 복수 도서 가능 | `group_books` M:N |
| 그룹 주석 | `annotations.group_id`로 명시적 구분(그룹 외 작성은 `null`) | 사용자 요청(컬럼 추가) |
