# Game State Machine

## States

- `intro`: 사건 브리핑과 목표 확인
- `explore`: 장소 이동 및 단서 수집
- `dialogue`: NPC 대화 수행
- `deduction`: 용의자 지목 및 근거 제출
- `ending`: 결과 출력

## Events

- `START_GAME`
- `MOVE_LOCATION`
- `COLLECT_CLUE`
- `START_DIALOGUE`
- `END_DIALOGUE`
- `SUBMIT_ACCUSATION`
- `TURN_EXPIRED`
- `RETRY`

## Transition Rules

- `intro -> explore`: `START_GAME`
- `explore -> dialogue`: `START_DIALOGUE`
- `dialogue -> explore`: `END_DIALOGUE`
- `explore -> deduction`: 플레이어가 지목하기 선택
- `deduction -> ending`: `SUBMIT_ACCUSATION`
- `explore/dialogue -> ending`: `TURN_EXPIRED`
- `ending -> intro`: `RETRY`

## Guards

- `SUBMIT_ACCUSATION`는 최소 단서 3개 수집 후 허용
- 대화는 해당 NPC가 있는 장소에서만 시작 가능
- 턴은 행동(이동, 단서 조사, 질문)마다 감소

## Derived Data

- `progressScore`: 수집 단서 및 핵심 단서 가중치 기반 점수
- `suspicionMap`: NPC별 의심도
- `storyFlags`: 비밀 공개 여부, 거짓말 탐지 여부 등
