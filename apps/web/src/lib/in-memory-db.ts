import { randomUUID } from "node:crypto";
import { evaluateEnding, progressScore, transitionState } from "./game-engine";
import { CORRECT_SUSPECT, EVIDENCES, MAX_TURNS, NPCS } from "./game-data";
import type { GameSession, NpcId } from "./types";
import { addMemoryEmbedding, searchMemory } from "./memory";

const sessions = new Map<string, GameSession>();

function createSession(): GameSession {
  return {
    id: randomUUID(),
    state: "intro",
    turn: MAX_TURNS,
    location: "lobby",
    evidenceKeys: [],
    logs: [],
    memorySummaries: [],
    hintLevel: 0,
    tokenUsage: 0
  };
}

export function startSession() {
  const session = createSession();
  session.state = transitionState(session.state, "START_GAME");
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string) {
  return sessions.get(id);
}

export function listCollectedEvidence(session: GameSession) {
  return EVIDENCES.filter((item) => session.evidenceKeys.includes(item.key));
}

export function collectEvidence(sessionId: string, evidenceKey: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.ending) return session;
  if (!session.evidenceKeys.includes(evidenceKey)) {
    session.evidenceKeys.push(evidenceKey);
    session.turn -= 1;
  }
  if (session.turn <= 0) {
    session.ending = "timeout";
    session.state = "ending";
  }
  return session;
}

export function moveLocation(sessionId: string, location: GameSession["location"]) {
  const session = sessions.get(sessionId);
  if (!session || session.ending) return null;
  session.location = location;
  session.turn -= 1;
  if (session.turn <= 0) {
    session.ending = "timeout";
    session.state = "ending";
  }
  return session;
}

export function saveDialogue(params: {
  sessionId: string;
  npcId: NpcId;
  userText: string;
  aiText: string;
  tokens: number;
}) {
  const session = sessions.get(params.sessionId);
  if (!session || session.ending) return null;
  session.state = transitionState(session.state, "START_DIALOGUE");
  session.logs.push({ npcId: params.npcId, role: "user", content: params.userText, tokens: 0 });
  session.logs.push({ npcId: params.npcId, role: "assistant", content: params.aiText, tokens: params.tokens });
  session.state = transitionState(session.state, "END_DIALOGUE");
  session.turn -= 1;
  session.tokenUsage += params.tokens;
  if (session.turn <= 0) {
    session.ending = "timeout";
    session.state = "ending";
  }
  return session;
}

export function addMemorySummary(sessionId: string, summary: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.memorySummaries.push(summary);
  addMemoryEmbedding(sessionId, summary);
  if (session.memorySummaries.length > 6) {
    session.memorySummaries = session.memorySummaries.slice(-6);
  }
  return session;
}

export function evaluateSessionEnding(sessionId: string, accusation: NpcId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.state = transitionState("explore", "GO_DEDUCTION");
  session.accusation = accusation;
  const ending = evaluateEnding(
    {
      state: "deduction",
      turn: session.turn,
      accusation,
      collectedEvidence: session.evidenceKeys,
      coreEvidenceKeys: EVIDENCES.filter((item) => item.isCore).map((item) => item.key)
    },
    CORRECT_SUSPECT
  );
  session.ending = ending;
  session.state = transitionState("deduction", "SUBMIT_ACCUSATION");
  return {
    session,
    ending,
    score: progressScore(session.evidenceKeys, EVIDENCES.filter((item) => item.isCore).map((item) => item.key))
  };
}

export function getHint(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.hintLevel += 1;

  const missingCore = EVIDENCES.filter((item) => item.isCore && !session.evidenceKeys.includes(item.key));
  if (missingCore.length > 0) {
    if (session.hintLevel === 1) {
      return `Ara: You are still missing critical proof. Revisit ${missingCore[0].location.replace("_", " ")}.`;
    }
    if (session.hintLevel === 2) {
      return `Ara: Focus on ${missingCore[0].label}. It links directly to intent.`;
    }
    return `Ara: Collect ${missingCore[0].label} in ${missingCore[0].location.replace("_", " ")} now.`;
  }

  const minaLogs = session.logs.filter((log) => log.npcId === "mina" && log.role === "assistant").length;
  if (minaLogs < 2) return "Ara: Ask Mina about policy timing and why records changed that night.";
  return "Ara: You have enough clues. Compare sensor timeline with key trace and choose the suspect who benefits.";
}

export function memorySearch(sessionId: string, query: string): string[] {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return searchMemory(sessionId, query);
}

export function getNpcById(npcId: NpcId) {
  return NPCS.find((npc) => npc.id === npcId);
}
