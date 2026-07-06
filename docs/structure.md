---
inclusion: always
---

# Project Structure

## 현재 상태

기획·설계 문서와 프론트엔드/백엔드 소스 코드, 배포 설정까지 갖춘 모노레포 상태다. 설계 문서는 `docs/` 아래에 모여 있다.

```
26s-w1-c3-02/
├── README.md            # 프로젝트 개요/기능/화면/실행·배포 — 전체 진행 상황 허브
├── docker-compose.yml   # db(MySQL) + backend + frontend 통합 실행
├── backend/             # Django + DRF (앱: accounts, groups, books, annotations, common, config)
├── frontend/            # Vite + React (src/api, components, context, pages, utils, styles)
├── docs/
│   ├── api-spec.md      # API 상세 스펙: 공통 규약(인증·페이지네이션·에러 포맷), ENUM, 요청/응답 예시
│   ├── product.md       # steering 문서: 제품 개요
│   ├── structure.md     # 이 문서: 저장소/문서 구조
│   └── tech.md          # steering 문서: 기술 스택
└── screenshot/          # IA 와이어프레임, 화면 목업, DB ERD(db_shcema.png) 이미지
```

## 문서 간 관계

- **README.md**가 진행 상황을 보여주는 메인 허브. "API 문서" 섹션은 엔드포인트 목록을 요약 표로만 담고, 상세 스펙(ENUM, 객체 스키마, 에러코드 등)은 `api-spec.md`로 링크한다.
- **api-spec.md**가 API의 단일 진실 공급원(source of truth). 프론트/백엔드 구현 시 이 문서의 요청/응답 스키마를 기준으로 삼는다.
- README.md는 아래 내용을 담는 구조:
  1. 프로젝트 개요·팀원
  2. 핵심 기능 (인증/책/주석/즐겨찾기/그룹)
  3. 화면 구조 (경로별 화면·기능)
  4. 기술 스택 — 완료 (React + Django + MySQL + Docker)
  5. 폴더 구조 — 완료 (모노레포)
  6. 실행 방법 — 완료 (Docker Compose)
  7. API 문서 — 완료 (요약은 README, 상세는 `docs/api-spec.md`)

기능이나 설계가 바뀌면 코드와 함께 이 문서들을 갱신하는 것을 원칙으로 한다.

## 소스 구조

- **backend/** — Django 프로젝트. 도메인별 앱으로 분리: `accounts`(인증·사용자·친구), `groups`(그룹 주석방), `books`(도서·북마크·알라딘), `annotations`(주석·댓글·좋아요·즐겨찾기), `common`(페이지네이션·예외·권한), `config`(설정·루트 URL).
- **frontend/** — Vite + React. `src/api`(도메인별 axios 모듈), `src/pages`(화면), `src/components`, `src/context`(AuthContext), `src/utils`, `src/styles`.
- **docker-compose.yml** — `db`(MySQL) · `backend`(gunicorn) · `frontend`(nginx, 정적 서빙 + `/api`·`/admin` 프록시) 3개 서비스로 통합 실행.
