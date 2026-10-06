# AI NPC Detective Game

웹 기반 AI NPC 추리 게임 프로젝트다. 플레이어는 장소를 탐색하고 단서를 수집하며 NPC와 대화해 용의자를 지목한다.

| | |
|---|---|
| 기간 | 2026년 2월 |
| 인원 | 개인 프로젝트 |
| 기술 | Next.js (App Router), TypeScript, Tailwind CSS, Zustand, OpenAI API, Prisma, PostgreSQL, Vercel |

![게임 화면](screenshots/main-game-ui.png)

## 왜 만들었나

LLM으로 NPC 대화를 만들면 금방 그럴듯해 보이지만, 실제 게임에 넣으면 문제가 생깁니다. 캐릭터가 설정을 벗어나고, 플레이어가 프롬프트를 조작해 정답을 캐내고, 응답 형식이 깨지고, 호출할 때마다 비용이 듭니다. 이 프로젝트는 그 문제들을 다루면서 20~30분 분량의 추리 에피소드를 끝까지 플레이할 수 있게 만드는 것이 목표였습니다.

## 내 역할

기획부터 구현, 문서화까지 혼자 했습니다.

- 게임 상태머신과 엔딩 판정 로직 (`packages/game-engine`)
- NPC 대화 파이프라인: 프롬프트 구성, JSON 응답 검증, 가드레일 (`packages/prompt-kit`, `apps/web/src/lib`)
- 대화 요약 메모리와 응답 캐시
- 지연 시간·토큰·캐시 적중률·오류를 모으는 지표 API와 관리자 화면
- PRD, 기술 설계, 성능 보고서, 트러블슈팅 문서 (`docs/`)

## 배운 것

- LLM 응답을 신뢰하지 않는 설계: 스키마로 검증하고, 실패하면 준비된 대체 응답을 쓰는 방식
- 프롬프트 인젝션을 입력 단계에서 걸러내는 방법과 그 한계
- 같은 질문에 대한 캐시와 요약 길이 제한으로 토큰 비용을 줄이는 방법
- 게임 규칙을 상태머신으로 분리하면 UI와 독립적으로 테스트할 수 있다는 점
- 모노레포에서 패키지를 나누고 경로 별칭을 맞추는 방법

## Highlights

- 상태머신 기반 코어 루프: 탐색 -> 대화 -> 추론 -> 엔딩
- NPC 대화 가드레일: 프롬프트 인젝션 차단, 포맷 검증, 금지 주제 처리
- 메모리 검색(RAG-lite): 대화 요약 저장 및 유사 질의 검색
- 운영 지표: API 지연시간, 토큰, 캐시 히트율, 에러 이벤트 추적

## Tech Stack

- Next.js(App Router), TypeScript, Tailwind, Zustand
- OpenAI Chat API + Embeddings 대응 구조
- Prisma + PostgreSQL 스키마(패키지 제공)
- Vercel 배포 설정(`vercel.json`)

## Monorepo Structure

- `apps/web`: 프론트엔드 + API 라우트 + 운영 대시보드
- `packages/game-engine`: 상태머신/엔딩 판정 로직
- `packages/prompt-kit`: 프롬프트/응답 검증
- `packages/data`: Prisma 스키마 및 데이터 레이어 타입
- `docs`: PRD, 기술 설계, 운영 보고서, 트러블슈팅

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저 경로:

- 게임: `http://localhost:3000`
- 운영 지표: `http://localhost:3000/admin`

## Scripts

- `npm run dev`: 웹 앱 개발 서버
- `npm run lint`: 웹 린트
- `npm run test`: 게임 엔진 테스트
- `npm run build`: 프로덕션 빌드

## Environment Variables

- `OPENAI_API_KEY`: NPC 대화 모델 호출 키
- `DATABASE_URL`: Prisma/PostgreSQL 연결 문자열
- `NEXT_PUBLIC_APP_NAME`: 앱 이름(선택)

## Deployment

1. Vercel 프로젝트 생성 후 루트 연결
2. 환경변수 등록
3. `main` 브랜치 배포
4. 스모크 테스트(`docs/staging-checklist.md`) 수행

## Current Status

- MVP 게임 루프 완성
- 메모리 검색/가드레일/힌트 시스템 적용
- 운영 지표 API와 관리자 화면 제공
- 포트폴리오 제출용 문서화 완료

## 사용한 자료

- Next.js, OpenAI API, Prisma, Zustand 공식 문서
- Vercel 배포 문서

## 결과

- 탐색 → 대화 → 추론 → 엔딩의 전체 루프가 동작합니다.
- `npm run lint`, `npm run test`, `npm run build`를 통과합니다.
- 관리자 화면에서 API 지연 시간, 토큰 사용량, 캐시 적중률, 최근 오류를 볼 수 있습니다.

![운영 지표 화면](screenshots/admin-metrics.png)

## 한계와 다음 단계

- 지표와 세션이 메모리에만 저장되어 서버를 재시작하면 사라집니다. Prisma 스키마는 준비되어 있지만 연결하지 않았습니다.
- 메모리 검색이 단어 겹침 기반입니다. 임베딩 검색(pgvector)으로 바꿔야 품질이 올라갑니다.
- 지연 시간은 평균만 봅니다. p50/p95와 세션별 비용 집계가 필요합니다.
- 동시 접속 부하 테스트를 하지 않았습니다.
- 에피소드가 하나뿐입니다.
