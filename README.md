# AI NPC Detective Game

웹 기반 AI NPC 추리 게임 프로젝트다. 플레이어는 장소를 탐색하고 단서를 수집하며 NPC와 대화해 용의자를 지목한다.

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
