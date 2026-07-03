---
inclusion: always
---

# Technology Stack

## 현재 상태

기술 스택 및 API 설계 방식 **확정**. DB 스키마(ERD)·API 상세 스펙(`api-spec.md`) 문서화까지 완료됐으나, 아직 실제 소스 코드는 없는 설계 단계다. 아래 스택과 규약을 기준으로 구현을 시작한다.

## 기술 스택

- **프론트엔드:** React
- **백엔드:** Django
- **데이터베이스:** MySQL
- **인프라/배포:** KAIST VM
- **API 설계 방식:** REST API

## API 설계 규약 (확정, `api-spec.md` 기준)

- **인증:** JWT Bearer — 로그인 시 발급된 `accessToken`을 `Authorization: Bearer <accessToken>` 헤더로 전송. 세션/토큰 저장 테이블 없이 무상태로 처리.
- **요청/응답 포맷:** `application/json; charset=utf-8`, 필드는 `camelCase` (서버 내부 `snake_case` 컬럼과 매핑).
- **페이지네이션:** 목록 조회는 `{ "data": [...], "pagination": { page, size, totalElements, totalPages } }` 형태로 감싸 반환, 쿼리는 `?page=1&size=20` (기본값).
- **에러 포맷:** `{ "error": { "code": "...", "message": "..." } }`. 공통 코드: `400 VALIDATION_ERROR` · `401 UNAUTHORIZED` · `403 FORBIDDEN` · `404 NOT_FOUND` · `409 DUPLICATE` · `500 INTERNAL_ERROR`.
- **좋아요 집계:** polymorphic 단일 `likes` 테이블(`targetType` + `targetId`)에서 `COUNT`로 파생, 별도 카운트 컬럼 없음.
- 엔드포인트별 요청/응답 예시와 ENUM(`annotations.type`, `visibility`, `friends.status` 등) 전체 목록은 `api-spec.md` 참고.

## 세부 사항 (추후 결정 필요)

- **프론트엔드:** 상태 관리, 스타일링 방식
- **인프라/배포:** CI/CD 여부, 배포 절차, KAIST VM 접속·배포 스크립트
- **백엔드:** JWT 토큰 만료/갱신(refresh token) 정책, 비밀번호 해싱 방식

결정되는 대로 이 문서와 README.md의 "배포 결과물" 섹션을 함께 갱신할 것.

## 참고 자료

- [SDD(스펙 주도 개발) 이해하기](https://news.hada.io/topic?id=21338)
- [ERD/DB 설계 총정리](https://inpa.tistory.com/entry/DB-%F0%9F%93%9A-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%AA%A8%EB%8D%B8%EB%A7%81-%EA%B0%9C%EB%85%90-ERD-%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8)
- [API 명세서 작성 가이드라인](https://velog.io/@sebinChu/BackEnd-API-%EB%AA%85%EC%84%B8%EC%84%9C-%EC%9E%91%EC%84%B1-%EA%B0%80%EC%9D%B4%EB%93%9C-%EB%9D%BC%EC%9D%B8)
- [api-spec.md](api-spec.md) — 이 저장소의 API 상세 스펙 (엔드포인트별 요청/응답, ENUM, 설계 가정 요약)

## 공통 명령어

아직 정의되지 않음. 프로젝트 스캐폴딩 후 빌드/테스트/실행 명령어를 이 섹션에 기록할 것.
