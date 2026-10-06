import { NextResponse } from "next/server";
import { generateNpcReply } from "@/lib/ai";
import { getSession, saveDialogue } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";
import { captureError } from "@/lib/telemetry";
import type { NpcId } from "@/lib/types";

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const session = getSession(body.sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const reply = await generateNpcReply({
      sessionId: body.sessionId,
      npcId: body.npcId as NpcId,
      message: body.message,
      evidenceKeys: session.evidenceKeys
    });

    const updated = saveDialogue({
      sessionId: body.sessionId,
      npcId: body.npcId as NpcId,
      userText: body.message,
      aiText: reply.answer,
      tokens: reply.tokens
    });

    trackMetric({
      name: "dialogue_request",
      durationMs: Date.now() - startedAt,
      tokens: reply.tokens,
      cacheHit: reply.cacheHit
    });

    return NextResponse.json({
      reply,
      session: updated
    });
  } catch (error) {
    captureError("api/dialogue", error);
    return NextResponse.json({ error: "Failed to process dialogue" }, { status: 500 });
  }
}
