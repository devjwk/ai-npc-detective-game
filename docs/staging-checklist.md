# Staging Deployment Checklist

## Environment

- [ ] `OPENAI_API_KEY` configured
- [ ] `DATABASE_URL` configured
- [ ] `NEXT_PUBLIC_APP_NAME` configured

## Pre-Deploy Gates

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`

## Staging Smoke Tests

- [ ] Start a session from `/`
- [ ] Move between all 4 locations
- [ ] Collect at least 3 clues
- [ ] Complete 2 NPC dialogues
- [ ] Request hint and verify progressive behavior
- [ ] Reach one ending via accusation
- [ ] Verify `/admin` shows metric events

## Observability

- [ ] Ensure `error` events are visible after forced API failure
- [ ] Verify cache hit appears after repeated same dialogue prompt

## Release Readiness

- [ ] README updated with runbook
- [ ] Docs synced: PRD, architecture, troubleshooting, report
