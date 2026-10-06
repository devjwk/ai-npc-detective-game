# AI NPC Detective Game PRD

## Product Summary

브라우저 기반 AI NPC 추리 게임이다. 플레이어는 사건 현장을 조사하고 NPC와 대화해 단서를 모은 뒤 용의자를 지목한다.
목표는 20~30분 내 최소 1개 엔딩에 도달하는 짧고 밀도 높은 에피소드 제공이다.

## Core Pillars

- 대화 일관성: NPC 성격과 지식 경계를 유지한다.
- 추론 재미: 단서 수집과 질문 설계가 결말에 영향을 준다.
- 재플레이 가치: 선택지와 대화 흐름에 따라 다른 엔딩을 제공한다.

## Scenario

- 사건명: Midnight Gallery
- 배경: 폐관 직전의 소규모 미술관
- 진실: 큐레이터가 보험 사기를 위해 조명을 조작했고, 경비원은 이를 숨기기 위해 증거를 옮겼다.

## NPC Design

- Mina(Curator): 침착한 설명가, 핵심 비밀 보유
- Jae(Security): 방어적 태도, 일부 단서 은폐
- Sol(Artist): 감정적이고 단서의 맥락 제공
- Ara(Archivist): 조력자, 진행 막힘 시 힌트 제공

## Evidence Graph

- `brokenSensorLog`: 경보 시스템 오작동 로그
- `insuranceEmail`: 보험 담당자와의 사전 통신
- `nightShiftNote`: 야간 근무 기록 수정 흔적
- `cameraBlindSpotMap`: 카메라 사각지대 지도
- `paintFragment`: 손상된 작품 조각
- `vaultKeyTrace`: 금고 열쇠 사용 기록
- `footprintPhoto`: 신발 자국 사진
- `maintenanceTicket`: 조명 점검 요청서
- `alarmPanelScreenshot`: 패널 상태 캡처
- `phoneTranscript`: 사건 당일 통화 기록
- `deliveryManifest`: 반입 물품 목록
- `witnessMemo`: 목격자 메모

## Endings

- TruthEnding: 플레이어가 핵심 단서 4개 이상 확보 + 올바른 용의자 지목
- FalseAccusationEnding: 단서 부족 또는 오지목
- TimeoutEnding: 제한 턴(예: 18턴) 내 결론 미도출

## Functional Requirements

- 사건 탐색 화면, 장소 이동, 단서 인벤토리 제공
- NPC 대화(LLM), 대화 로그 저장, 세션 재개
- 증거 플래그 기반 엔딩 판정
- 힌트 시스템(조력자 NPC를 통한 단계별 힌트)

## Non-Functional Requirements

- 평균 응답시간 2.5초 이하(캐시 적중 시 1.2초 목표)
- 세션당 토큰 비용 추적 및 절감 지표 제공
- 오류율 1% 이하 유지

## Success Metrics

- 엔딩 도달률 60% 이상
- 2회차 플레이 비율 25% 이상
- 힌트 사용률 20~40%(너무 낮거나 높지 않게 유지)
