# Backend

**주석노트** 서버. Django + MySQL로 구현하는 REST API 서버.

## 상태

아직 초기화 전 (빈 폴더). 스캐폴딩 후 빌드/실행/마이그레이션 명령어를 이 문서에 채워 넣을 것.

## 역할

- `../docs/api-spec.md`에 정의된 엔드포인트를 구현 (요청/응답 스키마, 에러 포맷, ENUM 등 해당 문서 기준)
- 인증: JWT Bearer 방식. 로그인 시 `accessToken` 발급, 이후 요청은 `Authorization: Bearer <accessToken>` 헤더로 검증
- DB 스키마는 `../README.md`의 "DB 스키마" 섹션(ERD, `../screenshot/db_shcema.png`) 참고

## 참고 문서

- [../docs/tech.md](../docs/tech.md) — 기술 스택, API 설계 규약(페이지네이션·에러 포맷 등)
- [../docs/api-spec.md](../docs/api-spec.md) — 엔드포인트별 요청/응답 스펙
