# Technical Design

## System Overview

- Frontend: Next.js App Router
- API: Next.js Route Handlers
- DB: PostgreSQL + Prisma
- Vector Search: pgvector
- AI: OpenAI Chat + Embeddings

## Data Model

- `GameSession`: user, currentState, turn, selectedEnding
- `Evidence`: key, label, location, isCore
- `SessionEvidence`: sessionId, evidenceId
- `DialogueLog`: sessionId, npcId, role, content, tokens
- `MemoryChunk`: sessionId, embedding, summary, tags

## API Contracts

- `POST /api/session/start`: 새 세션 시작
- `GET /api/session/[id]`: 진행 상태 조회
- `POST /api/dialogue`: NPC 질의/응답
- `POST /api/evidence/collect`: 단서 수집 처리
- `POST /api/ending/evaluate`: 엔딩 판정
- `POST /api/hint`: 힌트 요청

## Prompt Strategy

- System Prompt: NPC의 성격, 지식 경계, 금지사항
- Context Block: 현재 턴, 위치, 수집 단서, 최근 대화 요약
- Output Contract: 구조화된 JSON(`answer`, `revealedClues`, `trustShift`)

## Cost & Reliability

- 답변 생성 전 대화 요약 메모리 우선 주입
- 동일 질의/상태 조합 캐시 키로 응답 재사용
- 모델 실패 시 fallback 메시지와 재시도 1회
