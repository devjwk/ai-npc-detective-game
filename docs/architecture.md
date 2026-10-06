# Architecture

## Runtime Flow

1. 클라이언트가 세션 생성 (`/api/session/start`)
2. 탐색/이동/단서 수집으로 상태 갱신
3. 대화 요청 시:
   - 메모리 검색
   - NPC 시스템 프롬프트 생성
   - LLM 응답(JSON) 생성 및 검증
   - 가드레일 적용 후 로그/메모리 저장
4. 지목 요청 시 엔딩 판정기 실행
5. 운영 지표는 `/api/metrics` 및 `/admin`에서 조회

## Module Responsibilities

- `packages/game-engine`
  - 상태 전이(`transitionState`)
  - 진행 점수(`progressScore`)
  - 엔딩 판정(`evaluateEnding`)

- `packages/prompt-kit`
  - NPC 시스템 프롬프트 생성
  - 대화 응답 스키마 검증(zod)

- `apps/web/src/lib`
  - `in-memory-db.ts`: 세션/로그/단서 저장
  - `ai.ts`: 모델 호출, 캐시, 검증, fallback
  - `guardrails.ts`: 인젝션/금지주제/응답 정제
  - `memory.ts`: 토큰 기반 유사도 검색(RAG-lite)
  - `metrics.ts`, `telemetry.ts`: 운영 지표/에러 추적

## Data Model (Planned Persistence)

- `GameSession`, `Evidence`, `SessionEvidence`
- `DialogueLog`, `MemoryChunk(pgvector)`

## Quality Strategy

- 단위 테스트: 엔딩 판정 로직
- 정적 품질: Next lint + Type check(build 단계)
- 운영 관측: 평균 응답시간/토큰/캐시 히트율/에러
