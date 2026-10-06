# Troubleshooting

## `Module not found: Can't resolve '@/...'`

- 원인: `apps/web/tsconfig.json`의 `baseUrl` 또는 `paths` 미설정
- 해결: `baseUrl: "."` 및 `@/* -> ./src/*` 확인

## `next lint` 실행 시 설정 선택 프롬프트가 뜸

- 원인: ESLint 설정 파일 없음
- 해결: `apps/web/.eslintrc.json` 추가 후 재실행

## OpenAI 응답이 JSON 검증에 실패

- 원인: 모델이 스키마 외 텍스트를 반환
- 해결: `response_format: json_object` 유지 + `validateDialogueResponse` 실패 시 fallback 응답 사용

## 대화 응답이 느리거나 비용이 높음

- 원인: 동일 질의 반복 호출, 과도한 컨텍스트
- 해결:
  - 응답 캐시 사용(`cacheKey`)
  - 메모리 요약 길이 제한(현재 6개)
  - 짧은 질의 가이드 제공

## 힌트가 너무 강하거나 약함

- 원인: 진행도와 힌트 단계 불일치
- 해결: `hintLevel` 기준 로직과 core clue 조건을 조정

## 메모리 검색 품질이 낮음

- 원인: 현재는 토큰 오버랩 기반 RAG-lite
- 해결: pgvector 임베딩 검색으로 교체하고 유사도 임계치 튜닝
