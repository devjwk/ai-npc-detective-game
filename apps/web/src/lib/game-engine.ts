export type GameState = "intro" | "explore" | "dialogue" | "deduction" | "ending";
export type EndingType = "truth" | "false_accusation" | "timeout";

export type SessionSnapshot = {
  state: GameState;
  turn: number;
  collectedEvidence: string[];
  accusation?: string;
  coreEvidenceKeys: string[];
};

export function transitionState(state: GameState, event: string): GameState {
  if (state === "intro" && event === "START_GAME") return "explore";
  if (state === "explore" && event === "START_DIALOGUE") return "dialogue";
  if (state === "dialogue" && event === "END_DIALOGUE") return "explore";
  if (state === "explore" && event === "GO_DEDUCTION") return "deduction";
  if (state === "deduction" && event === "SUBMIT_ACCUSATION") return "ending";
  if ((state === "explore" || state === "dialogue") && event === "TURN_EXPIRED") return "ending";
  if (state === "ending" && event === "RETRY") return "intro";
  return state;
}

export function progressScore(collectedEvidence: string[], coreEvidenceKeys: string[]): number {
  const coreSet = new Set(coreEvidenceKeys);
  return collectedEvidence.reduce((score, key) => score + (coreSet.has(key) ? 2 : 1), 0);
}

export function evaluateEnding(snapshot: SessionSnapshot, correctSuspect: string, minCoreCount = 4): EndingType {
  if (snapshot.turn <= 0) return "timeout";
  const collectedCoreCount = snapshot.collectedEvidence.filter((key) => snapshot.coreEvidenceKeys.includes(key)).length;
  const enoughCoreEvidence = collectedCoreCount >= minCoreCount;
  const correctAccusation = snapshot.accusation === correctSuspect;

  if (enoughCoreEvidence && correctAccusation) return "truth";
  return "false_accusation";
}
