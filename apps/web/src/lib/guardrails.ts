import type { NpcProfile } from "./types";

const FORBIDDEN_PATTERNS = ["ignore previous", "system prompt", "developer message", "jailbreak"];

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export function detectPromptInjection(message: string): boolean {
  const normalized = normalize(message);
  return FORBIDDEN_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function blockForbiddenTopic(message: string, npc: NpcProfile): boolean {
  const normalized = normalize(message);
  return npc.forbiddenTopics.some((topic) => normalized.includes(normalize(topic)));
}

export function canRevealHiddenFact(evidenceKeys: string[], minimumCoreEvidence = 3): boolean {
  return evidenceKeys.length >= minimumCoreEvidence;
}

export function sanitizeAnswer(answer: string): string {
  return answer.replace(/\b(as an ai|language model)\b/gi, "as a witness");
}
