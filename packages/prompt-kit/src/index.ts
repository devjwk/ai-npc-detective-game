import { z } from "zod";

export const DialogueResponseSchema = z.object({
  answer: z.string().min(1),
  revealedClues: z.array(z.string()).default([]),
  trustShift: z.number().int().min(-2).max(2).default(0),
  safetyFlags: z.array(z.string()).default([])
});

export type DialogueResponse = z.infer<typeof DialogueResponseSchema>;

export function buildNpcSystemPrompt(input: {
  npcName: string;
  personality: string;
  knownFacts: string[];
  hiddenFacts: string[];
  forbiddenTopics: string[];
}): string {
  return [
    `You are ${input.npcName}.`,
    `Personality: ${input.personality}.`,
    "Rules:",
    "- Stay in character.",
    "- Do not reveal hidden facts unless player has enough evidence.",
    "- If asked about unknown information, answer that you do not know.",
    `Known facts: ${input.knownFacts.join(", ") || "none"}.`,
    `Hidden facts: ${input.hiddenFacts.join(", ") || "none"}.`,
    `Forbidden topics: ${input.forbiddenTopics.join(", ") || "none"}.`,
    "Always output JSON with keys: answer, revealedClues, trustShift, safetyFlags."
  ].join("\n");
}

export function validateDialogueResponse(payload: unknown): DialogueResponse {
  return DialogueResponseSchema.parse(payload);
}
