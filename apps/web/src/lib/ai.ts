import OpenAI from "openai";
import { buildNpcSystemPrompt, validateDialogueResponse } from "./prompt-kit";
import { addMemorySummary, getNpcById, memorySearch } from "./in-memory-db";
import type { NpcId } from "./types";
import { blockForbiddenTopic, canRevealHiddenFact, detectPromptInjection, sanitizeAnswer } from "./guardrails";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const replyCache = new Map<
  string,
  { answer: string; revealedClues: string[]; trustShift: number; safetyFlags: string[]; tokens: number; cacheHit: boolean }
>();

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateNpcReply(input: {
  sessionId: string;
  npcId: NpcId;
  message: string;
  evidenceKeys: string[];
}) {
  const npc = getNpcById(input.npcId);
  if (!npc) {
    return {
      answer: "I cannot speak right now.",
      revealedClues: [],
      trustShift: 0,
      safetyFlags: ["npc_not_found"],
      tokens: 0,
      cacheHit: false
    };
  }
  if (detectPromptInjection(input.message)) {
    return {
      answer: `${npc.name}: I can only discuss the case evidence and timeline.`,
      revealedClues: [],
      trustShift: -1,
      safetyFlags: ["prompt_injection_detected"],
      tokens: 8,
      cacheHit: false
    };
  }
  if (blockForbiddenTopic(input.message, npc)) {
    return {
      answer: `${npc.name}: I cannot discuss that directly. Ask me about records or timing.`,
      revealedClues: [],
      trustShift: -1,
      safetyFlags: ["forbidden_topic"],
      tokens: 10,
      cacheHit: false
    };
  }

  const cacheKey = `${input.sessionId}:${input.npcId}:${input.message.trim().toLowerCase()}:${[...input.evidenceKeys].sort().join(",")}`;
  const cached = replyCache.get(cacheKey);
  if (cached) return { ...cached, safetyFlags: [...cached.safetyFlags, "cache_hit"], cacheHit: true };

  const memories = memorySearch(input.sessionId, input.message);
  const systemPrompt = buildNpcSystemPrompt({
    npcName: npc.name,
    personality: npc.personality,
    knownFacts: npc.knownFacts,
    hiddenFacts: npc.hiddenFacts,
    forbiddenTopics: npc.forbiddenTopics
  });

  if (!client) {
    const fallback = {
      answer: `${npc.name}: I remember this differently. Ask about records or timeline.`,
      revealedClues: [],
      trustShift: 0,
      safetyFlags: ["fallback_no_api_key"]
    };
    addMemorySummary(input.sessionId, `Q:${input.message} A:${fallback.answer}`);
    const offline = { ...fallback, tokens: 40, cacheHit: false };
    replyCache.set(cacheKey, offline);
    return offline;
  }
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            `Current evidence: ${input.evidenceKeys.join(", ") || "none"}`,
            `Retrieved memories: ${memories.join(" | ") || "none"}`,
            `Player question: ${input.message}`
          ].join("\n")
        }
      ],
      temperature: 0.5
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = safeJsonParse(raw);
    let validated;
    try {
      validated = validateDialogueResponse(parsed ?? {});
    } catch {
      validated = {
        answer: `${npc.name}: I need a more specific question about place, record, or time.`,
        revealedClues: [],
        trustShift: 0,
        safetyFlags: ["invalid_json_response"]
      };
    }

    const allowHidden = canRevealHiddenFact(input.evidenceKeys);
    const sanitized = sanitizeAnswer(validated.answer);
    const answer = allowHidden ? sanitized : sanitized.replace(/confess|fraud|tamper|staged/gi, "that");

    addMemorySummary(input.sessionId, `Q:${input.message} A:${answer}`);
    const result = {
      ...validated,
      answer,
      tokens: completion.usage?.total_tokens ?? 0,
      cacheHit: false
    };
    replyCache.set(cacheKey, result);
    return result;
  } catch {
    const fallback = {
      answer: `${npc.name}: I cannot access my full records right now. Ask again with a short question about timeline or evidence.`,
      revealedClues: [],
      trustShift: 0,
      safetyFlags: ["openai_error_fallback"],
      tokens: 24,
      cacheHit: false
    };
    addMemorySummary(input.sessionId, `Q:${input.message} A:${fallback.answer}`);
    replyCache.set(cacheKey, fallback);
    return fallback;
  }
}
