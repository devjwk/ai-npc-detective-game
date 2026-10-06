import { NextResponse } from "next/server";
import { evaluateSessionEnding } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";
import type { NpcId } from "@/lib/types";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const body = await req.json();
  const result = evaluateSessionEnding(body.sessionId, body.accusation as NpcId);
  if (!result) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  trackMetric({ name: "ending_evaluate", durationMs: Date.now() - startedAt });
  return NextResponse.json(result);
}
