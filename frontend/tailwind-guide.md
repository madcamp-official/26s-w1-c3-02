# Frontend Design Guide

이 문서는 React + Tailwind CSS로 프론트엔드를 만들 때 두 사람이 같은 디자인 톤으로 작업하기 위한 공통 기준이다.

## 1. 디자인 방향

서비스는 책 속 문장을 수집하고, 주석과 생각을 나누는 조용한 서재 같은 공간을 목표로 한다.

- 밝은 배경, 흰 카드, 딥 네이비 포인트를 기본으로 한다.
- 책 표지, 문장 인용, 사용자 아바타, 태그, 저장/좋아요/댓글 액션을 주요 시각 요소로 사용한다.
- 과한 원색, 진한 그라데이션, 게임 같은 UI, 너무 둥근 말랑한 스타일은 피한다.
- 페이지는 넓은 여백을 가지되, 카드와 리스트는 반복 작업에 편하게 정돈한다.

## 2. Tailwind 사용 규칙

현재 프로젝트는 Tailwind CSS를 사용한다.

설정 파일:

```txt
frontend/tailwind.config.js
frontend/postcss.config.js
frontend/src/styles/global.css
```

전역 CSS는 이미 `main.jsx`에서 import하고 있다.

```jsx
import './styles/global.css';
```

Tailwind theme에 등록된 주요 토큰:

```txt
bg-page
bg-pageSoft
bg-surface
bg-surfaceMuted
bg-primary
bg-primary-hover
bg-primary-soft
text-text
text-text-muted
text-text-subtle
border-line
border-line-strong
shadow-soft
shadow-card
shadow-float
max-w-layout
```

기본적으로는 아래 두 방식을 같이 사용한다.

```jsx
// 공통 컴포넌트 스타일
<button className="button button--primary">문장 공유하기</button>

// 페이지별 배치와 미세 조정
<section className="grid gap-4 md:grid-cols-3">
  ...
</section>
```

공통 UI는 `global.css`에 정의된 클래스부터 사용하고, 페이지별 배치에는 Tailwind 유틸리티를 직접 사용한다.

## 3. 공통 className 예시

### Page Layout

```jsx
<main className="page">
  <div className="container">
    <h1 className="page-title">홈</h1>
    <section className="grid gap-6">
      ...
    </section>
  </div>
</main>
```

기본 페이지는 `page`와 `container`를 사용한다.

```txt
page       페이지 상하 여백
container 가운데 정렬 + 최대 폭 1200px
page-title 페이지 제목
section-title 섹션 제목
muted-text 보조 텍스트
```

### Button

```jsx
<button className="button button--primary">저장하기</button>
<button className="button button--secondary">취소</button>
<button className="button button--ghost">더보기</button>
<button className="button button--danger">삭제</button>
```

크기 조절:

```jsx
<button className="button button--primary button--sm">작은 버튼</button>
<button className="button button--primary">기본 버튼</button>
<button className="button button--primary button--lg">큰 버튼</button>
```

사용 기준:

- 주요 CTA는 `button--primary`
- 보조 액션은 `button--secondary`
- 메뉴성 액션은 `button--ghost`
- 삭제/위험 액션은 `button--danger`

### Input / Textarea / Select

```jsx
<label className="form-field">
  <span className="form-label">책 제목</span>
  <input className="input" placeholder="책 제목을 입력하세요" />
  <span className="form-help">제목 또는 저자명으로 검색할 수 있어요.</span>
</label>
```

```jsx
<label className="form-field">
  <span className="form-label">주석 내용</span>
  <textarea className="textarea" placeholder="이 문장에 대한 생각을 적어주세요" />
</label>
```

```jsx
<label className="form-field">
  <span className="form-label">공개 범위</span>
  <select className="select">
    <option value="public">전체 공개</option>
    <option value="friends">친구 공개</option>
    <option value="private">비공개</option>
  </select>
</label>
```

에러 상태:

```jsx
<label className="form-field">
  <span className="form-label">이메일</span>
  <input className="input input--error" />
  <span className="form-error">이메일 형식이 올바르지 않습니다.</span>
</label>
```

### Card

```jsx
<article className="card card--padded">
  <h2 className="section-title">오늘의 문장</h2>
  <p className="annotation-quote">
    자기 자신으로 있기 위해서는 끊임없이 자신을 갱신해야 한다.
  </p>
</article>
```

카드 종류:

```txt
card             기본 카드
card--padded     내부 여백이 있는 카드
hero-card        홈 상단 큰 추천/문장 카드
book-card        책 목록 카드
annotation-card  주석 카드
```

### Tag

```jsx
<span className="tag tag--blue">소설</span>
<span className="tag tag--cream">질문</span>
<span className="tag tag--green">토론</span>
<span className="tag tag--rose">감상</span>
<span className="tag">일반</span>
<span className="tag tag--danger">스포일러</span>
```

권장 매핑:

```txt
소설/장르: tag--blue
질문: tag--cream
토론: tag--green
감상: tag--rose
일반: tag
스포일러: tag--danger
```

### Pagination

```jsx
<nav className="pagination" aria-label="페이지">
  <button className="pagination__item">‹</button>
  <button className="pagination__item pagination__item--active">1</button>
  <button className="pagination__item">2</button>
  <button className="pagination__item">3</button>
  <button className="pagination__item">›</button>
</nav>
```

### Modal

```jsx
<div className="modal-overlay">
  <section className="modal">
    <h2 className="section-title">주석 삭제</h2>
    <p className="mt-3 text-text-muted">삭제한 주석은 복구할 수 없습니다.</p>
    <div className="mt-6 flex justify-end gap-2">
      <button className="button button--secondary">취소</button>
      <button className="button button--danger">삭제</button>
    </div>
  </section>
</div>
```

## 4. Button / Input / Card / Tag JSX 예시

### 추천 책 카드

```jsx
function BookCard({ book }) {
  return (
    <article className="card book-card">
      <img className="book-cover" src={book.coverImageUrl} alt={`${book.title} 표지`} />
      <div className="min-w-0">
        <h3 className="truncate text-[17px] font-bold text-text">{book.title}</h3>
        <p className="mt-1 text-sm text-text-muted">{book.author}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="tag tag--blue">{book.genreName}</span>
          <span className="text-sm text-text-muted">♡ {book.favoriteCount}</span>
        </div>
      </div>
    </article>
  );
}
```

### 주석 카드

```jsx
function AnnotationCard({ annotation }) {
  return (
    <article className="card annotation-card">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img className="avatar" src={annotation.author.avatarUrl} alt="" />
          <div>
            <strong className="block text-sm text-text">{annotation.author.nickname}</strong>
            <span className="text-xs text-text-subtle">{annotation.createdAt}</span>
          </div>
        </div>
        <button className="button button--ghost button--sm" aria-label="더보기">
          ...
        </button>
      </header>

      <p className="annotation-quote">{annotation.passage}</p>

      <footer className="card-actions">
        <div className="flex gap-2">
          <span className="tag tag--rose">감상</span>
          {annotation.isSpoiler && <span className="tag tag--danger">스포일러</span>}
        </div>
        <div className="flex gap-4">
          <span>♡ {annotation.likeCount}</span>
          <span>💬 {annotation.commentCount}</span>
        </div>
      </footer>
    </article>
  );
}
```

### 로그인 폼

```jsx
function LoginForm() {
  return (
    <form className="card card--padded mx-auto grid max-w-[420px] gap-4">
      <h1 className="page-title mb-2">로그인</h1>

      <label className="form-field">
        <span className="form-label">이메일</span>
        <input className="input" type="email" placeholder="you@example.com" />
      </label>

      <label className="form-field">
        <span className="form-label">비밀번호</span>
        <input className="input" type="password" placeholder="비밀번호" />
      </label>

      <button className="button button--primary button--lg mt-2" type="submit">
        로그인
      </button>
    </form>
  );
}
```

## 5. 페이지별 기본 레이아웃 예시

### HomePage

```jsx
function HomePage() {
  return (
    <main className="page">
      <div className="container grid gap-8">
        <section className="hero-card p-8">
          <div className="max-w-[620px]">
            <p className="text-sm font-bold text-text-muted">오늘의 문장</p>
            <h1 className="mt-4 text-3xl font-bold leading-normal text-text">
              자기 자신으로 있기 위해서는 끊임없이 자신을 갱신해야 한다.
            </h1>
            <p className="mt-4 text-text-muted">헤르만 헤세, 데미안</p>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="section-title">이런 책은 어때요?</h2>
            <button className="button button--ghost button--sm">더보기</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* BookCard */}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="section-title">오늘의 문장 피드</h2>
            <button className="button button--primary">문장 공유하기</button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* AnnotationCard */}
          </div>
        </section>
      </div>
    </main>
  );
}
```

### BookDetailPage

```jsx
function BookDetailPage() {
  return (
    <main className="page">
      <div className="container grid gap-8">
        <section className="card card--padded grid gap-6 md:grid-cols-[160px_1fr]">
          <div className="aspect-[3/4] rounded-md bg-primary-soft" />
          <div>
            <span className="tag tag--blue">소설</span>
            <h1 className="page-title mt-4">책 제목</h1>
            <p className="muted-text">저자명</p>
            <div className="mt-6 flex gap-2">
              <button className="button button--primary">주석 작성</button>
              <button className="button button--secondary">즐겨찾기</button>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">주석 카드</h2>
            <select className="select w-[160px]">
              <option>최신순</option>
              <option>인기순</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* AnnotationCard */}
          </div>
        </section>
      </div>
    </main>
  );
}
```

### AnnotationDetailPage

```jsx
function AnnotationDetailPage() {
  return (
    <main className="page">
      <div className="container grid max-w-[860px] gap-6">
        <article className="card card--padded">
          <header className="flex items-center justify-between gap-3">
            <div>
              <span className="tag tag--rose">감상</span>
              <h1 className="page-title mt-4">문장 상세</h1>
            </div>
            <button className="button button--secondary">저장</button>
          </header>

          <blockquote className="annotation-quote border-l-4 border-primary-soft pl-5">
            인용 구절이 들어갑니다.
          </blockquote>

          <p className="leading-[1.8] text-text">작성자의 주석 본문이 들어갑니다.</p>
        </article>

        <section className="card card--padded grid gap-4">
          <h2 className="section-title">댓글</h2>
          <textarea className="textarea" placeholder="댓글을 입력하세요" />
          <div className="flex justify-end">
            <button className="button button--primary">댓글 작성</button>
          </div>
        </section>
      </div>
    </main>
  );
}
```

### MyPage

```jsx
function MyPage() {
  return (
    <main className="page">
      <div className="container grid gap-6">
        <section className="card card--padded flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="page-title mb-2">내 서재</h1>
            <p className="muted-text">내 주석과 즐겨찾기를 모아봅니다.</p>
          </div>
          <button className="button button--primary">문장 공유하기</button>
        </section>

        <nav className="flex gap-2 overflow-x-auto">
          <button className="button button--primary button--sm">내 주석</button>
          <button className="button button--secondary button--sm">즐겨찾기 책</button>
          <button className="button button--secondary button--sm">그룹</button>
          <button className="button button--secondary button--sm">친구</button>
        </nav>
      </div>
    </main>
  );
}
```

## 6. Loading / Empty / Error 상태

컴포넌트마다 로딩·빈 상태·에러를 다르게 만들면 화면 톤이 흐트러진다. 아래 규칙을 따른다.

### Loading

리스트/카드 로딩은 스켈레톤을 사용한다.

사용 위치:

```txt
책 목록
주석 피드
댓글 목록
친구 목록
그룹 목록
마이페이지 목록
```

스켈레톤은 실제 카드와 비슷한 크기, radius를 유지한다.

```jsx
function BookCardSkeleton() {
  return (
    <article className="card book-card animate-pulse">
      <div className="book-cover bg-surfaceMuted" />
      <div className="min-w-0">
        <div className="h-4 w-2/3 rounded bg-surfaceMuted" />
        <div className="mt-2 h-3 w-1/2 rounded bg-surfaceMuted" />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-6 w-14 rounded-full bg-surfaceMuted" />
          <div className="h-3 w-10 rounded bg-surfaceMuted" />
        </div>
      </div>
    </article>
  );
}
```

주석 카드 스켈레톤:

```jsx
function AnnotationCardSkeleton() {
  return (
    <article className="card annotation-card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="avatar bg-surfaceMuted" />
        <div className="grid flex-1 gap-2">
          <div className="h-3 w-24 rounded bg-surfaceMuted" />
          <div className="h-3 w-16 rounded bg-surfaceMuted" />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="h-5 w-full rounded bg-surfaceMuted" />
        <div className="h-5 w-5/6 rounded bg-surfaceMuted" />
        <div className="h-5 w-2/3 rounded bg-surfaceMuted" />
      </div>

      <div className="flex justify-between">
        <div className="h-6 w-14 rounded-full bg-surfaceMuted" />
        <div className="h-4 w-24 rounded bg-surfaceMuted" />
      </div>
    </article>
  );
}
```

버튼 내부 액션 로딩은 버튼 안 스피너를 사용하고, 로딩 중에는 버튼을 `disabled` 처리한다.

```jsx
<button className="button button--primary" disabled>
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  저장 중
</button>
```

페이지 전체를 덮는 풀스크린 스피너는 사용하지 않는다.

### Empty

빈 상태는 아이콘, 일러스트, CTA 버튼 없이 짧은 안내 문구 한 줄로만 구성한다.

```jsx
function EmptyState({ children }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-semibold text-text-muted">{children}</p>
    </div>
  );
}
```

권장 문구:

| 화면 | 문구 |
|---|---|
| 책 목록 검색 결과 없음 | 검색 결과가 없습니다 |
| 책 상세 주석 카드 없음 | 아직 등록된 주석이 없습니다 |
| 주석 검색 결과 없음 | 일치하는 주석을 찾지 못했습니다 |
| 댓글 없음 | 첫 댓글을 남겨보세요 |
| 내 즐겨찾기 없음 | 즐겨찾기한 항목이 없습니다 |
| 내가 작성한 주석 없음 | 작성한 주석이 없습니다 |
| 친구 목록 없음 | 아직 친구가 없습니다 |
| 친구 요청 없음 | 대기 중인 요청이 없습니다 |
| 그룹 목록 없음 | 참여 중인 그룹이 없습니다 |
| 그룹 멤버/도서 없음 | 등록된 항목이 없습니다 |

사용 예시:

```jsx
{books.length === 0 && <EmptyState>검색 결과가 없습니다</EmptyState>}
```

### Error

폼 제출 에러는 인라인으로 표시한다.

```jsx
<label className="form-field">
  <span className="form-label">이메일</span>
  <input className="input input--error" />
  <span className="form-error">{error.message}</span>
</label>
```

좋아요, 즐겨찾기, 삭제, 그룹 초대, 친구 요청 같은 카드/리스트 단위 액션의 성공·실패는 토스트로 표시한다.

```jsx
function Toast({ type = 'success', message }) {
  const tone =
    type === 'error'
      ? 'bg-danger-soft text-danger'
      : 'bg-white text-primary';

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-sm px-4 py-3 text-sm font-semibold shadow-card ${tone}`}>
      {message}
    </div>
  );
}
```

목록/상세 조회 자체가 실패하면 빈 상태와 같은 톤으로 한 줄만 표시한다. 재시도 버튼은 넣지 않는다.

```jsx
{isError && (
  <div className="py-12 text-center">
    <p className="text-sm font-semibold text-text-muted">불러오지 못했습니다</p>
  </div>
)}
```

## 7. API 에러 처리 규칙

백엔드 공통 에러 포맷은 아래 형태다.

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "이메일 형식이 올바르지 않습니다." } }
```

화면에는 기본적으로 `error.message`를 그대로 표시한다. 백엔드가 이미 한국어 문구를 내려주므로 프론트에서 문구를 새로 만들지 않는다.

`message`가 비어있을 때만 `code` 기준 대체 문구를 사용한다.

| code | 대체 문구 |
|---|---|
| `VALIDATION_ERROR` | 입력값을 확인해주세요 |
| `UNAUTHORIZED` | 로그인이 필요합니다 |
| `FORBIDDEN` | 권한이 없습니다 |
| `NOT_FOUND` | 대상을 찾을 수 없습니다 |
| `DUPLICATE` | 이미 존재합니다 |
| `INTERNAL_ERROR` | 일시적인 오류가 발생했습니다 |

표시 위치:

```txt
폼 제출 에러: input 아래 form-error
좋아요/즐겨찾기/삭제/그룹/친구 액션 에러: toast
목록/상세 조회 실패: "불러오지 못했습니다" 한 줄
```

`401 UNAUTHORIZED`는 토스트로 띄우지 않는다. 로그인 상태를 초기화하고 `/login`으로 이동시킨다.

```jsx
if (error.status === 401) {
  logout();
  navigate('/login');
}
```

에러 메시지 helper 예시:

```js
const fallbackMessages = {
  VALIDATION_ERROR: '입력값을 확인해주세요',
  UNAUTHORIZED: '로그인이 필요합니다',
  FORBIDDEN: '권한이 없습니다',
  NOT_FOUND: '대상을 찾을 수 없습니다',
  DUPLICATE: '이미 존재합니다',
  INTERNAL_ERROR: '일시적인 오류가 발생했습니다',
};

export const getErrorMessage = (error) =>
  error?.message || fallbackMessages[error?.code] || '요청을 처리하지 못했습니다';
```

## 8. 반응형 기준

기본 breakpoint는 Tailwind 기본값을 사용한다.

```txt
sm 640px
md 768px
lg 1024px
xl 1280px
```

권장 레이아웃:

```txt
모바일: 카드 1열
태블릿: 책 카드 2열, 주석 카드 2열 가능
데스크톱: 책 카드 4열, 주석 카드 3열 가능
```

예시:

```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  ...
</div>
```

모바일에서 긴 텍스트가 버튼이나 카드 밖으로 넘치지 않도록 `min-w-0`, `truncate`, `break-words`를 사용한다.

```jsx
<h3 className="min-w-0 truncate text-[17px] font-bold">긴 책 제목</h3>
<p className="break-words leading-[1.7]">긴 주석 본문</p>
```

## 9. 구현 체크리스트

페이지 구현 후 아래를 확인한다.

- `page`, `container`, `page-title` 구조를 사용했는가?
- 주요 버튼은 `button button--primary`를 사용했는가?
- 입력창은 `input`, `textarea`, `select` 클래스를 사용했는가?
- 반복되는 콘텐츠는 `card` 계열 클래스를 사용했는가?
- 태그 색상이 의미별로 일관적인가?
- 모바일에서 카드가 1열로 자연스럽게 쌓이는가?
- 텍스트가 버튼이나 카드 밖으로 넘치지 않는가?
- 로딩, 빈 상태, 에러 상태가 필요한 페이지에 있는가?
- 리스트/카드는 스켈레톤, 버튼 액션은 스피너로 로딩을 표시했는가?
- 빈 상태에 CTA 버튼 없이 안내 문구만 있는가?
- 폼 에러는 인라인, 그 외 액션 에러는 토스트로 표시했는가?
- 에러 메시지는 `error.message`를 우선 사용했는가?
