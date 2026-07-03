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

## 16. 페이지별 기준

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

- 상단: 사용자 프로필 요약
- 탭: 내 주석, 즐겨찾기 책, 즐겨찾기 주석, 그룹, 친구
- 반복 목록은 동일한 카드 컴포넌트를 재사용한다.

### FriendsPage / GroupsPage

- 운영 도구처럼 명확하고 단순하게 만든다.
- 검색, 목록, 요청 상태, 액션 버튼을 한눈에 보이게 한다.

## 17. 공통 CSS 시작점

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

## 18. 협업 규칙

- 공통 컴포넌트는 `src/components/common`에 만든다.
- 레이아웃 컴포넌트는 `src/components/layout`에 만든다.
- 페이지별 전용 컴포넌트는 각 feature 폴더에 둔다.
- 색상, radius, shadow 값은 직접 쓰지 말고 토큰을 사용한다.
- 새 컴포넌트를 만들 때 기본/hover/focus/disabled 상태를 같이 구현한다.
- 카드, 버튼, 입력창의 모양을 페이지마다 새로 만들지 않는다.
- 실제 이미지가 필요한 곳은 책 표지나 사용자 아바타처럼 의미 있는 이미지로 채운다.

## 19. 빠른 체크리스트

구현 후 아래를 확인한다.

- 헤더 높이와 메뉴 활성 상태가 맞는가?
- 버튼 색이 primary/secondary/ghost 규칙을 지키는가?
- 카드 radius와 shadow가 과하지 않은가?
- 모바일에서 텍스트가 버튼이나 카드 밖으로 넘치지 않는가?
- 태그 색이 의미별로 일관적인가?
- 한 화면에 강한 네이비 CTA가 여러 개 있지 않은가?
- 빈 상태, 로딩, 에러 상태가 있는가?
