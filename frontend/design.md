# Frontend Design System

이 문서는 두 명이 각자 페이지를 구현해도 같은 서비스처럼 보이도록 맞추는 공통 디자인 규칙이다. 기준 이미지는 밝은 서재, 흰 카드, 딥 네이비 포인트, 부드러운 그림자, 책과 문장 중심의 조용한 분위기다.

## 1. 디자인 방향

서비스 이름은 임시로 `문장서재` 톤을 따른다. 핵심 이미지는 "책 속 문장을 수집하고 생각을 나누는 공간"이다.

- 전체 인상: 조용함, 정돈됨, 신뢰감, 읽기 좋은 여백
- 피해야 할 인상: 과한 원색, 게임 같은 UI, 진한 그라데이션, 너무 둥근 말랑한 SaaS 스타일
- 화면 밀도: 넓은 데스크톱에서는 여유 있게, 모바일에서는 카드가 한 줄씩 안정적으로 쌓이게
- 주요 시각 요소: 책 표지, 문장 인용, 사용자 아바타, 태그, 저장/좋아요/댓글 아이콘

## 2. 컬러 토큰

CSS 전역 변수는 아래 이름을 그대로 사용한다. 새 색이 필요하면 먼저 이 표 안에서 해결한다.

```css
:root {
  --color-bg: #f8f6f1;
  --color-bg-soft: #fbfaf7;
  --color-surface: #ffffff;
  --color-surface-muted: #f3f5f8;

  --color-primary: #0f2547;
  --color-primary-hover: #173761;
  --color-primary-soft: #e8eef7;

  --color-text: #172033;
  --color-text-muted: #68748a;
  --color-text-subtle: #9aa4b5;

  --color-border: #e3e7ee;
  --color-border-strong: #cfd6e2;

  --color-accent-blue: #dceaf7;
  --color-accent-green: #e4eee5;
  --color-accent-cream: #f3eadc;
  --color-accent-rose: #f1e4e1;

  --color-danger: #b54747;
  --color-danger-soft: #f8e8e8;

  --shadow-sm: 0 2px 8px rgba(15, 37, 71, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 37, 71, 0.10);
  --shadow-lg: 0 18px 48px rgba(15, 37, 71, 0.14);
}
```

### 사용 규칙

- 배경은 `--color-bg` 또는 `--color-bg-soft`를 사용한다.
- 주요 버튼, 활성 탭, 현재 페이지 번호는 `--color-primary`를 사용한다.
- 본문 텍스트는 `--color-text`, 보조 정보는 `--color-text-muted`, 메타 정보는 `--color-text-subtle`을 사용한다.
- 카드 테두리는 `--color-border`, hover 또는 선택 상태는 `--color-border-strong`을 사용한다.
- 태그는 연한 배경색과 네이비/그레이 텍스트 조합으로 만든다.
- 한 화면에서 강한 색은 네이비 하나만 주도한다. 빨강은 삭제/오류에만 쓴다.

## 3. 타이포그래피

기본 폰트는 시스템 폰트를 사용한다. 별도 웹폰트 추가 전까지 아래 스택을 고정한다.

```css
font-family:
  "Pretendard",
  "Apple SD Gothic Neo",
  "Malgun Gothic",
  system-ui,
  sans-serif;
```

### 크기

| 용도 | 크기 | 굵기 | 줄간격 |
|---|---:|---:|---:|
| 페이지 제목 | 28px | 700 | 1.3 |
| 섹션 제목 | 22px | 700 | 1.35 |
| 카드 제목 | 17px | 700 | 1.4 |
| 본문 | 15px | 400 | 1.65 |
| 보조 텍스트 | 14px | 400 | 1.5 |
| 메타/태그 | 12px | 500 | 1.4 |
| 버튼 | 14px | 600 | 1 |

### 문장 카드 규칙

- 인용문은 일반 본문보다 크게 보여준다. 권장: `20px`, `line-height: 1.65`, `font-weight: 500`.
- 인용부호 아이콘이나 큰 따옴표는 연한 블루그레이로 처리한다.
- 긴 문장은 3-5줄 안에서 자연스럽게 보이게 하고, 카드 목록에서는 필요한 경우 말줄임 처리한다.

## 4. 레이아웃

### 전체 폭

```css
--layout-max-width: 1200px;
--layout-page-padding: 24px;
--layout-mobile-padding: 16px;
```

- 데스크톱 본문 컨테이너는 최대 `1200px`.
- 좌우 여백은 데스크톱 `24px`, 모바일 `16px`.
- 페이지 배경은 전체에 깔고, 콘텐츠는 중앙 정렬한다.

### 간격 스케일

아래 값만 우선 사용한다.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### 페이지 구조

기본 페이지는 아래 순서를 따른다.

```txt
Header
Main
  PageTitle or Hero
  PrimarySection
  SecondarySection
Footer
```

- 홈은 상단에 큰 히어로 카드가 있어도 된다.
- 기능 페이지는 마케팅용 히어로 대신 바로 리스트/폼/상세 콘텐츠를 보여준다.
- 카드 안에 또 카드를 넣지 않는다.

## 5. Radius / Shadow / Border

```css
--radius-xs: 6px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-pill: 999px;
```

- 버튼, 입력창, 태그: `8px` 또는 pill
- 일반 카드: `12px`
- 홈의 큰 추천/문장 카드: `18px`
- 모달: `16px`
- 그림자는 기본적으로 `--shadow-sm`, 큰 히어로 카드만 `--shadow-md` 이상 사용한다.
- 테두리는 대부분 `1px solid var(--color-border)`.

## 6. Header / Navigation

헤더는 항상 흰색, 높이 `72px`, 하단 border를 둔다.

구성:

```txt
Logo + 서비스명 + 짧은 설명
SearchBar
Nav links
Notification icon
Avatar menu
```

규칙:

- 로고/서비스명은 왼쪽 고정.
- 검색창은 데스크톱에서 중앙에 두고, 모바일에서는 별도 줄 또는 아이콘 버튼으로 축소한다.
- 활성 메뉴는 네이비 텍스트와 아래쪽 2px 선으로 표시한다.
- 헤더 안 버튼은 배경을 과하게 채우지 않는다.

**구현 위치(공용 컴포넌트):** `src/components/layout/Header.jsx`, `Footer.jsx`, `LogoMark.jsx`. 페이지마다 헤더를 새로 그리지 말고 이 컴포넌트를 그대로 import해서 쓴다. `Header`는 `useAuth()`로 로그인 여부를 읽어 로그인/로그아웃 상태에 맞는 우측 영역을 그리고, 활성 메뉴는 `NavLink`로 현재 라우트에 맞춰 자동 표시된다. 현재 `HomePage`, `MyPage`가 이 컴포넌트를 사용 중이며, `LoginPage`/`RegisterPage`는 아직 헤더 없이 단독 폼만 렌더링한다(추후 통일 필요).

## 7. Button

공통 `Button`은 최소 아래 variant를 가진다.

```txt
primary   네이비 배경, 흰 글자
secondary 흰 배경, 회색 테두리
ghost     배경 없음, hover만
danger    삭제/위험 액션
```

크기:

```txt
sm  height 32px, padding 12px
md  height 40px, padding 16px
lg  height 48px, padding 20px
```

규칙:

- 주요 CTA는 한 화면에 1개만 강한 네이비로 둔다.
- 아이콘이 있으면 왼쪽에 두고 간격은 `8px`.
- 비활성 상태는 opacity만 낮추지 말고 cursor와 색도 바꾼다.

## 8. Input / Search

입력창 기본:

```css
height: 44px;
border: 1px solid var(--color-border);
border-radius: var(--radius-sm);
background: var(--color-surface);
padding: 0 14px;
font-size: 14px;
```

상태:

- focus: border `--color-primary`, 얇은 네이비 outline 또는 shadow
- error: border `--color-danger`, 아래에 12px 오류 메시지
- disabled: `--color-surface-muted`, 텍스트 `--color-text-subtle`

검색창은 placeholder를 명확하게 쓴다.

```txt
책 제목, 저자, 문장 검색
```

## 9. Card

카드는 서비스의 기본 단위다.

### BookCard

구성:

```txt
책 표지
제목
저자
장르 태그
좋아요/즐겨찾기 수
```

규칙:

- 책 표지는 `aspect-ratio: 3 / 4`.
- 표지가 없으면 연한 배경과 책 제목 첫 글자/기본 이미지로 처리한다.
- 카드 높이는 리스트 안에서 최대한 일정하게 유지한다.

### AnnotationCard

구성:

```txt
작성자 아바타 + 닉네임 + 시간
책 제목/저자
인용 문장
태그
좋아요 / 댓글 / 저장 액션
```

규칙:

- 인용 문장이 시각적 중심이다.
- 좋아요, 댓글, 저장은 하단 액션 영역에 정렬한다.
- 공개 범위와 스포일러는 태그로 표시한다.
- 스포일러 카드는 본문을 흐리게 처리하고 "스포일러 보기" 버튼을 둔다.

## 10. Tag / Badge

태그는 pill 형태를 기본으로 한다.

```css
border-radius: var(--radius-pill);
padding: 4px 9px;
font-size: 12px;
font-weight: 600;
```

권장 매핑:

| 의미 | 배경 | 텍스트 |
|---|---|---|
| 소설/장르 | `--color-accent-blue` | `#42617f` |
| 질문 | `--color-accent-cream` | `#755b2f` |
| 토론 | `--color-accent-green` | `#496a54` |
| 감상 | `--color-accent-rose` | `#7a5651` |
| 일반 | `--color-surface-muted` | `--color-text-muted` |
| 스포일러 | `--color-danger-soft` | `--color-danger` |

## 11. Modal

모달은 화면 중앙에 띄운다.

- overlay: `rgba(15, 23, 42, 0.36)`
- width: 기본 `480px`, 큰 폼은 `640px`
- padding: `24px`
- radius: `16px`
- footer 버튼은 오른쪽 정렬
- 닫기 버튼은 우상단 아이콘

모바일에서는 모달 폭을 `calc(100vw - 32px)`로 제한한다.

## 12. Pagination

페이지네이션은 중앙 정렬한다.

- 현재 페이지: 네이비 원형/rounded 배경, 흰 글자
- 일반 페이지: 흰 배경 또는 투명
- 이전/다음은 화살표 아이콘 사용
- 모바일에서는 숫자를 줄이고 이전/다음 중심으로 보여준다.

## 13. Form

폼은 `label -> input -> helper/error` 순서로 쌓는다.

- label: 14px, 600
- input 간격: `16px`
- 섹션 간격: `24px`
- 제출 버튼은 폼 하단 오른쪽 또는 전체 폭
- 회원가입/로그인처럼 짧은 폼은 최대 폭 `420px`
- 주석 작성 폼은 최대 폭 `720px`

## 14. Icon

아이콘은 가능하면 `lucide-react`를 사용한다.

권장 아이콘:

```txt
Search, Bell, User, ChevronDown, ChevronRight,
Bookmark, Heart, MessageCircle, MoreHorizontal,
PenLine, Plus, X, Trash2, Edit3
```

규칙:

- 기본 크기: `20px`
- 작은 메타 아이콘: `16px`
- 버튼 안 아이콘: `18px`
- 아이콘만 있는 버튼은 `aria-label` 필수

## 15. Responsive

breakpoint:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
```

구현 규칙:

- 모바일: 카드 1열
- 태블릿: 책 카드 2-3열, 주석 카드 2열 가능
- 데스크톱: 책 카드 4-5열, 주석 카드 3열 가능
- 헤더 검색창은 모바일에서 폭을 줄이거나 접는다.
- 텍스트가 버튼 밖으로 넘치면 버튼 폭을 키우거나 줄바꿈을 허용한다.

## 16. Loading / Empty / Error 상태

컴포넌트마다 로딩·빈 상태·에러를 각자 다르게 만들면 화면 톤이 흐트러진다. 아래 규칙을 그대로 따른다.

### 로딩

- **리스트/카드**(책 목록, 주석 피드, 댓글, 그룹 목록 등): 스켈레톤. 실제 카드와 동일한 크기·radius를 유지한 채 `--color-surface-muted` 배경에 shimmer.
- **버튼 내부 액션**(좋아요, 즐겨찾기, 폼 제출, 삭제 확인 등): 버튼 안 스피너. 로딩 중엔 버튼을 `disabled` 처리.
- 페이지 전체를 덮는 풀스크린 스피너는 쓰지 않는다.

```txt
.skeleton         기본 shimmer 블록, radius는 대체할 요소와 동일하게
.skeleton--text    한 줄 텍스트 자리 (height 14-18px)
.skeleton--card    BookCard/AnnotationCard 자리 (해당 카드와 동일 크기)
.spinner           16-20px, --color-primary 계열, 버튼 안에서만 사용
```

### 빈 상태 (Empty)

- 아이콘·일러스트·버튼(CTA) 없이, **짧은 안내 문구 한 줄**로만 구성한다.
- 톤은 담담하고 간결하게. 과도한 감탄사·이모지는 쓰지 않는다.
- 문구는 맥락별로 아래를 기준으로 한다.

| 화면 | 문구 |
|---|---|
| 책 목록 검색 결과 없음 | 검색 결과가 없습니다 |
| 책 상세 — 주석 카드 없음 | 아직 등록된 주석이 없습니다 |
| 주석 검색(`/annotations/search`) 결과 없음 | 일치하는 주석을 찾지 못했습니다 |
| 댓글 없음 | 첫 댓글을 남겨보세요 |
| 내 즐겨찾기(책/주석) 없음 | 즐겨찾기한 항목이 없습니다 |
| 내가 작성한 주석 없음 | 작성한 주석이 없습니다 |
| 친구 목록 없음 | 아직 친구가 없습니다 |
| 받은/보낸 친구 요청 없음 | 대기 중인 요청이 없습니다 |
| 그룹 목록 없음 | 참여 중인 그룹이 없습니다 |
| 그룹 멤버/도서 없음 | 등록된 항목이 없습니다 |

```txt
.empty-state          중앙 정렬, 세로 패딩 --space-12
.empty-state__title    14px, 600, --color-text-muted
```

### 에러 (요청 실패)

- **폼 제출 에러**(회원가입, 로그인, 주석/댓글 작성 등): 인라인. 해당 입력창 아래 `.form-error`(13절)로 표시.
- **그 외 액션의 성공/실패**(좋아요, 즐겨찾기, 삭제, 그룹 초대, 친구 요청 등 리스트·카드 단위 액션): 토스트로 표시. 화면 우하단 고정, 3-4초 후 자동 소멸.
- **목록/상세 조회 자체가 실패**(네트워크 오류, `500` 등): 빈 상태와 같은 톤으로 "불러오지 못했습니다" 한 줄만 표시. 재시도 버튼 등 CTA는 넣지 않는다(빈 상태 원칙과 동일).

```txt
.toast              화면 우하단 고정, 카드형 (radius-sm, shadow-md)
.toast--success       --color-primary 텍스트, 흰 배경
.toast--error         --color-danger 텍스트, --color-danger-soft 배경
```

## 17. API 에러 처리 규칙

`docs/api-spec.md`의 공통 에러 포맷을 기준으로 한다.

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "이메일 형식이 올바르지 않습니다." } }
```

- 백엔드가 이미 한국어 `message`를 내려주므로, **`error.message`를 그대로 표시하는 것을 기본으로 한다.** 화면에서 문구를 새로 짓지 않는다.
- `message`가 비어있을 때만 `code` 기준 대체 문구를 쓴다.

| code | 대체 문구 |
|---|---|
| `VALIDATION_ERROR` | 입력값을 확인해주세요 |
| `UNAUTHORIZED` | 로그인이 필요합니다 |
| `FORBIDDEN` | 권한이 없습니다 |
| `NOT_FOUND` | 대상을 찾을 수 없습니다 |
| `DUPLICATE` | 이미 존재합니다 |
| `INTERNAL_ERROR` | 일시적인 오류가 발생했습니다 |

- **`401 UNAUTHORIZED`는 예외적으로 토스트로 띄우지 않는다.** 로그인 상태(`AuthContext`)를 초기화하고 `/login`으로 이동시킨다 — 토큰 만료는 사용자 액션의 실패가 아니라 세션 문제이기 때문이다.
- 표시 위치는 위 16절 규칙을 그대로 따른다: 폼 제출 중 에러는 인라인, 그 외(좋아요/즐겨찾기/삭제/그룹·친구 액션 등)는 토스트.

## 18. 페이지별 기준

### HomePage

- 상단: 오늘의 문장 또는 추천 문장 히어로
- 중간: 추천 책 가로 리스트
- 하단: 오늘의 문장 피드
- 주요 CTA: `문장 공유하기`

### BookDetailPage

- 상단: 책 표지 + 책 정보 + 즐겨찾기
- 본문: 주석 카드 피드
- 필터: 유형, 정렬, 공개 범위
- 주요 CTA: `주석 작성`

### AnnotationDetailPage

- 상단: 책 정보와 작성자
- 중심: 인용 구절과 주석 본문
- 하단: 좋아요, 저장, 댓글
- 댓글 목록은 카드보다 가벼운 리스트로 표현한다.

### LoginPage / RegisterPage

- 중앙 정렬 폼
- 배경은 `--color-bg`
- 카드 하나 안에 입력 필드와 버튼을 배치한다.
- 로고와 짧은 문장으로 서비스 분위기를 전달한다.

### MyPage

- 레이아웃: 좌측 사이드바(탭 네비게이션) + 우측 콘텐츠 영역. 상단 가로 탭 대신 왼쪽 고정 메뉴를 사용한다.
- 사이드바 항목: 대시보드, 내 주석, 즐겨찾기한 주석, 내 서재(즐겨찾기 책), 그룹 라운지, 친구, 설정
  - **대시보드**: 4개 블록으로 구성.
    1. 프로필 카드 — 아바타(+사진 변경 버튼) · 닉네임 · "편집" 버튼(설정 탭으로 이동) · 소개(`bio`) · 가입일 · 이메일, 오른쪽에 통계 배지 4개(작성한 주석/좋아요 받은 주석/즐겨찾기한 문장/친구, 각각 해당 탭으로 이동)
    2. 최근 활동(최근 주석 3개, 책 표지 썸네일+유형 태그+인용구+상대 시간+좋아요 수) · 내 주석 요약(유형별 도넛 차트 + 범례)
    3. 참여 중인 그룹 라운지(최근 활동순 상위 3개) · 즐겨찾기한 문장(최근 2개)
    - 통계·차트에 쓰이는 데이터는 대시보드 진입 시 한 번에 불러오는 `getMyAnnotations/getFavoriteBooks/getFavoriteAnnotations/getMyGroups/getMyFriends` 응답에서 클라이언트가 직접 집계한다(추가 API 호출 없음).
    - 큰 숫자는 `1.2K` 형태로 축약(`formatCount`), 시간은 "2시간 전/어제/3일 전"으로 표시(`formatRelativeTime`).
    - 도넛 차트 색상(`DONUT_TYPE_ORDER`, 질문/토론/감상/일반 = blue/aqua/yellow/green)은 임의 색이 아니라 dataviz 스킬의 `validate_palette.js`로 명도·채도·색맹 분리(CVD ΔE)를 검증한 조합이다. 이 팔레트의 태그 색(`.tag--cream/green/rose`)은 배지용 파스텔이라 채도가 낮아 차트에는 부적합해서(검증 결과 chroma/CVD 모두 fail) 별도 팔레트를 썼다. 값을 바꾸거나 순서를 섞기 전에 반드시 재검증할 것 — 순서는 고정이며 데이터에 따라 순환시키지 않는다.
  - **설정**: 닉네임 변경 폼 + **프로필 아이콘 선택** + 로그아웃. 별도 모달 없이 탭 안에 인라인으로 둔다.
    - **프로필 아이콘 선택**: 사용자가 이미지를 직접 업로드하는 대신, 미리 정해둔 10종 프리셋(`AVATAR_ICON_OPTIONS`, `src/pages/MyPage.jsx`) 중 하나를 골라 원형 배지 그리드에서 선택한다. 선택 상태는 `ring-2 ring-primary`로 표시하고, 같은 아이콘을 다시 누르면 선택 해제된다.
    - 저장 시 닉네임과 함께 `PATCH /api/users/me`에 `avatarIcon` 필드로 전송(`docs/api-spec.md` §3 참고).
    - **중요**: 이 아이콘은 마이페이지를 포함해 앱 어디에도 아직 실제로 렌더링하지 않는다 — 선택·저장 기능만 우선 구현한 것으로, 팀원이 진행 중인 다른 화면 작업과의 깃 충돌을 피하기 위한 의도적 결정이다. 헤더/그룹 멤버 목록 등에 실제로 표시하는 작업은 이후 별도로 진행한다.
    - 소개(`bio`)·프로필 사진 URL(`avatarUrl`)은 대시보드 프로필 카드 표시용 필드로 남아 있지만, 설정 탭에서 직접 수정하는 UI는 만들지 않는다(요청 범위 밖이라 제거).
- 사이드바 활성 항목은 `--color-primary-soft` 배경 + `--color-primary` 텍스트로 표시한다(7절 네비게이션 활성 표시 규칙과 동일한 톤).

**내 주석 / 즐겨찾기한 주석 — 한 줄형 카드**
- 그리드가 아닌 **세로 1열** 리스트. 카드 왼쪽에 책 표지(`coverImageUrl`, 없으면 "No Cover" placeholder)·제목·저자, 오른쪽에 주석 본문(인용구·리뷰·유형 태그·좋아요/댓글 수)을 배치한다.
- 내 주석: 헤더에 작성일. 즐겨찾기한 주석: 헤더에 작성자 아바타+닉네임(다른 사용자의 글이므로) — 책 표지 오른쪽, 주석 본문(인용구) 바로 위에 위치.
- 이 두 탭은 `AnnotationRow` 컴포넌트를 공유한다(`src/pages/MyPage.jsx`).
- **내 주석 탭에서만** 카드 헤더 우측에 수정(연필)·삭제(휴지통) 아이콘 버튼을 노출한다(`AnnotationRow`의 `onEdit`/`onDelete` prop — 즐겨찾기한 주석 탭은 남의 글이므로 prop을 넘기지 않아 버튼이 아예 렌더링되지 않는다). 수정은 인용구/감상/유형/스포일러 여부를 입력받는 모달, 삭제는 `window.confirm` 확인 후 `DELETE /api/annotations/{id}`(`docs/api-spec.md` §5) 호출 + 목록에서 즉시 제거.

**내 서재 — 북마크 배지**
- 책 카드는 기존 `.book-card` 그리드 그대로 사용하되, 표지 좌상단에 빨간 원형 북마크 배지(`bg-danger`, 채워진 북마크 아이콘)를 얹는다.
- 배지 클릭 시 `DELETE /books/{bookId}/favorite` 호출 후 목록에서 즉시 제거(낙관적 업데이트) + 토스트. 카드 자체의 클릭(책 상세 이동)과 배지 클릭이 겹치지 않도록 배지는 `stopPropagation` 처리한다.

**그룹 라운지 — 카드 확대**
- 기존보다 큰 카드(`min-h-[168px]`)를 사용하고, 늘어난 공간에는 **멤버 수 · 책 권수**를 아이콘과 함께 표시한다(`GET /api/users/me/groups` 응답의 `memberCount`/`bookCount` 필드, `docs/api-spec.md` §10 참고).

**그룹 라운지 — 만들기 버튼**
- 그룹 라운지 탭 콘텐츠 상단(로딩/에러/빈 상태와 무관하게 항상 노출)에 "라운지 만들기" 버튼(`button--primary button--sm`)을 우측 정렬로 배치.
- 클릭 시 모달(그룹 이름 입력만 받는 최소 폼)이 뜨고, `POST /api/groups`(`docs/api-spec.md` §10) 호출 후 성공 토스트 + 그룹 목록 재조회.
- 멤버 초대·책 추가는 이 모달에서 받지 않고 "라운지를 만든 뒤 라운지 페이지에서 진행"으로 안내(그룹 상세 페이지가 아직 구현되지 않아 초대/도서 선택 UI를 여기서 만들지 않음).

### FriendsPage / GroupsPage

### FriendsPage / GroupsPage

- 운영 도구처럼 명확하고 단순하게 만든다.
- 검색, 목록, 요청 상태, 액션 버튼을 한눈에 보이게 한다.

### GroupDetailPage (`/groups/:groupId`, `src/pages/GroupDetailPage.jsx`)

- 초안(1차 구현) — `GET /api/groups/{groupId}`(§10)로 그룹 상세(방장·멤버·도서)를 불러온다. **그룹 안에 자체 주석 피드는 없다** — 주석은 항상 책 상세 페이지에서 본다(아래 참고).
- 레이아웃(위→아래): 그룹 정보 카드 → **그룹 도서**(전체 폭) → **멤버**.
  - **그룹 정보 카드**: 그룹 이름(방장만 연필 아이콘으로 인라인 수정, `PATCH /api/groups/{id}`) · 방장 닉네임 · 멤버/책 수. 우측에 방장은 "그룹 삭제"(`DELETE /api/groups/{id}`), 일반 멤버는 "그룹 나가기"(`DELETE /api/groups/{id}/members/{내id}`) 버튼 — 둘 다 `window.confirm` 확인 후 실행하고 성공 시 마이페이지로 이동.
  - **그룹 도서**: 마이페이지 "내 서재"와 동일한 `.book-card`/`.grid--books` 그리드로, 그룹이 선정한 책들을 나열한다. **각 책 카드는 `/books/{bookId}?groupId={groupId}`로 이동하는 링크**다(마이페이지 "내 서재"처럼 책 상세로 이동 — 그룹 안에서 필터링하는 대신 책 상세 페이지에서 그룹 컨텍스트를 넘겨받는다). 카드 좌상단 × 버튼(제거, `DELETE .../books/{bookId}`)은 `preventDefault`+`stopPropagation`으로 카드 이동과 분리. 헤더의 "책 추가" 버튼은 검색 모달(`GET /api/books?keyword=` → `POST /api/groups/{id}/books`)을 연다.
  - **멤버**: 아바타(이니셜)+닉네임, 방장은 `tag`로 표시. 방장만 "멤버 초대"(닉네임 검색 → `POST /api/groups/{id}/members`)와 각 멤버 옆 ×(내보내기, `DELETE .../members/{userId}`) 버튼을 볼 수 있다.
- 초대/책검색 모달은 마이페이지의 "친구 찾기"/"라운지 만들기" 모달과 동일한 시각 패턴(`modal-overlay`/`modal`, 검색창+결과 리스트)을 따른다.
- 로딩/에러/빈 상태는 다른 탭들과 동일하게 스켈레톤(`animate-pulse`)·인라인 에러 텍스트 패턴을 사용.
- 아직 다듬지 않은 부분(다음 단계에서 보강): 멤버·도서 변경 시 목록 재조회(`loadGroup()`)가 그룹 전체를 다시 불러오는 단순한 방식이라 데이터가 많아지면 최적화 필요.

### BookDetailPage — 그룹 경유 진입 (`?groupId=` 쿼리)

- `GroupDetailPage`의 책 카드에서 넘어오면 URL이 `/books/{bookId}?groupId={groupId}` 형태가 된다. `BookDetailPage`는 이 쿼리 파라미터 유무로 두 가지 모드를 구분한다.
  - **groupId 없음(일반 진입, 예: 검색/홈에서)**: `GET /api/books/{bookId}/annotations`(§5)로 공개 주석 피드를 보여준다.
  - **groupId 있음(그룹 경유)**: `GET /api/groups/{groupId}/annotations?bookId={bookId}`(§13)로 **그 그룹 멤버들이 이 책에 남긴 주석만** 보여준다. 상단에 "🔒 이 목록은 《그룹 이름》 멤버들이 작성한 주석만 보여줍니다" 배너 + 그룹으로 돌아가는 링크를 표시하고, 상단 브레드크럼도 "둘러보기" 대신 그룹 이름으로 바뀐다.
- 유형 필터(전체/질문/토론/감상/일반)와 정렬(최신순/인기순/페이지순)은 두 모드 모두에서 동작하며, 필터가 바뀌면 API에 다시 쿼리해 서버 필터링 결과를 그대로 쓴다(클라이언트 재필터링 없음).
- 이 페이지는 원래 A(도서/주석) 담당 정적 목업이었으나, 그룹 기능과 맞물리는 부분이라 실제 `GET /api/books/{bookId}`·`GET /api/books/{bookId}/annotations` 연동까지 포함해 이번에 함께 구현했다. 헤더/히어로 레이아웃 등 기존 시각 디자인은 그대로 유지했다.

## 19. 공통 CSS 시작점

추후 `src/styles/global.css`를 만든다면 아래를 기준으로 시작한다.

```css
* {
  box-sizing: border-box;
}

html {
  color: var(--color-text);
  background: var(--color-bg);
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--color-bg);
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}
```

## 20. 협업 규칙

- 공통 컴포넌트는 `src/components/common`에 만든다.
- 레이아웃 컴포넌트는 `src/components/layout`에 만든다.
- 페이지별 전용 컴포넌트는 각 feature 폴더에 둔다.
- 색상, radius, shadow 값은 직접 쓰지 말고 토큰을 사용한다.
- 새 컴포넌트를 만들 때 기본/hover/focus/disabled 상태를 같이 구현한다.
- 카드, 버튼, 입력창의 모양을 페이지마다 새로 만들지 않는다.
- 실제 이미지가 필요한 곳은 책 표지나 사용자 아바타처럼 의미 있는 이미지로 채운다.

## 21. 빠른 체크리스트

구현 후 아래를 확인한다.

- 헤더 높이와 메뉴 활성 상태가 맞는가?
- 버튼 색이 primary/secondary/ghost 규칙을 지키는가?
- 카드 radius와 shadow가 과하지 않은가?
- 모바일에서 텍스트가 버튼이나 카드 밖으로 넘치지 않는가?
- 태그 색이 의미별로 일관적인가?
- 한 화면에 강한 네이비 CTA가 여러 개 있지 않은가?
- 리스트/카드는 스켈레톤, 버튼 액션은 스피너로 로딩을 표시했는가? (16절)
- 빈 상태에 CTA 버튼 없이 안내 문구만 있는가? (16절)
- 폼 에러는 인라인, 그 외 액션 에러는 토스트로 표시했는가? (16-17절)
- 에러 메시지에 `error.message`를 그대로 쓰고, 직접 문구를 새로 짓지 않았는가? (17절)
