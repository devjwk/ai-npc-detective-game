import { NextResponse } from "next/server";
import { getHint } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const body = await req.json();
  const hint = getHint(body.sessionId);
  if (!hint) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  trackMetric({ name: "hint_request", durationMs: Date.now() - startedAt });
  return NextResponse.json({ hint });
}
