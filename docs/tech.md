---
inclusion: always
---

# Technology Stack

## 현재 상태

기획·설계(ERD, `api-spec.md`)를 기반으로 프론트엔드·백엔드 구현과 배포까지 완료된 상태다. 아래 스택과 규약을 기준으로 유지·보수한다.

## 기술 스택

- **프론트엔드:** React (Vite, React Router), axios, Tailwind CSS
- **백엔드:** Django, Django REST Framework
- **데이터베이스:** MySQL
- **인증:** JWT Bearer (djangorestframework-simplejwt)
- **컨테이너/배포:** Docker Compose (nginx + gunicorn + MySQL), KAIST VM
- **API 설계 방식:** REST API

## API 설계 규약 (확정, `api-spec.md` 기준)

- **인증:** JWT Bearer — 로그인 시 발급된 `accessToken`을 `Authorization: Bearer <accessToken>` 헤더로 전송. 세션/토큰 저장 테이블 없이 무상태로 처리.
- **요청/응답 포맷:** `application/json; charset=utf-8`, 필드는 `camelCase` (서버 내부 `snake_case` 컬럼과 매핑).
- **페이지네이션:** 목록 조회는 `{ "data": [...], "pagination": { page, size, totalElements, totalPages } }` 형태로 감싸 반환, 쿼리는 `?page=1&size=20` (기본값).
- **에러 포맷:** `{ "error": { "code": "...", "message": "..." } }`. 공통 코드: `400 VALIDATION_ERROR` · `401 UNAUTHORIZED` · `403 FORBIDDEN` · `404 NOT_FOUND` · `409 DUPLICATE` · `500 INTERNAL_ERROR`.
- **좋아요 집계:** polymorphic 단일 `likes` 테이블(`targetType` + `targetId`)에서 `COUNT`로 파생, 별도 카운트 컬럼 없음.
- 엔드포인트별 요청/응답 예시와 ENUM(`annotations.type`, `visibility`, `friends.status` 등) 전체 목록은 `api-spec.md` 참고.

## 세부 사항 (결정됨)

- **프론트엔드:** 상태 관리는 React Context(`AuthContext`), 스타일링은 Tailwind CSS + 전역 컴포넌트 클래스.
- **인프라/배포:** Docker Compose로 db·backend·frontend 통합 실행, KAIST VM에 배포. 별도 CI/CD 없이 VM에서 `git pull` 후 재빌드.
- **백엔드:** JWT access 토큰(장기 만료, refresh 미사용), 비밀번호 해싱은 Django 기본(pbkdf2_sha256).

## 참고 자료

- [SDD(스펙 주도 개발) 이해하기](https://news.hada.io/topic?id=21338)
- [ERD/DB 설계 총정리](https://inpa.tistory.com/entry/DB-%F0%9F%93%9A-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%AA%A8%EB%8D%B8%EB%A7%81-%EA%B0%9C%EB%85%90-ERD-%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8)
- [API 명세서 작성 가이드라인](https://velog.io/@sebinChu/BackEnd-API-%EB%AA%85%EC%84%B8%EC%84%9C-%EC%9E%91%EC%84%B1-%EA%B0%80%EC%9D%B4%EB%93%9C-%EB%9D%BC%EC%9D%B8)
- [api-spec.md](api-spec.md) — 이 저장소의 API 상세 스펙 (엔드포인트별 요청/응답, ENUM, 설계 가정 요약)

## 공통 명령어

**전체 스택 (Docker Compose, 저장소 루트):**

```bash
docker compose up --build -d                                  # 빌드 및 실행
docker compose exec backend python manage.py migrate          # 마이그레이션
docker compose exec backend python manage.py loaddata seed    # 데모 데이터 적재
```

**백엔드 (로컬 개발, `backend/`):**

```bash
python manage.py runserver 0.0.0.0:8000
python manage.py test
```

**프론트엔드 (`frontend/`):**

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173, /api 는 :8000 프록시)
npm run build    # 프로덕션 빌드
```
