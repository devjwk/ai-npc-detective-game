import { NextResponse } from "next/server";
import { collectEvidence } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const body = await req.json();
  const session = collectEvidence(body.sessionId, body.evidenceKey);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  trackMetric({ name: "collect_evidence", durationMs: Date.now() - startedAt });
  return NextResponse.json({ session });
}
