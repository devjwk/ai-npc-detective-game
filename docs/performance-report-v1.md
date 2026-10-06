# Performance and Cost Report v1

## Scope

- Build target: `apps/web`
- Key API routes: `/api/dialogue`, `/api/hint`, `/api/evidence/collect`, `/api/ending/evaluate`
- Metrics source: in-app aggregator (`src/lib/metrics.ts`)

## Optimization Applied

- Response cache for repeated NPC queries (`cacheKey` based on session+npc+message+evidence)
- Memory compression through bounded summary list (max 6 summaries)
- Fast fallback path when API key is missing or model response is invalid JSON

## Operational Visibility

- Request latency tracking (`durationMs`) on all core game routes
- Token usage and cache hit tracking for dialogue route
- Error capture and recent error feed (`/api/metrics`, `/admin`)

## Initial Verification

- `npm run lint` passed
- `npm run test` passed
- `npm run build` passed

## Next Iteration

- Replace in-memory metrics with persistent analytics sink (PostHog or ClickHouse)
- Add percentile latency metrics (p50/p95) and per-session cost dashboard
- Add synthetic load test script for 50 concurrent session simulations
