import { NextResponse } from "next/server";
import { moveLocation } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const body = await req.json();
  const session = moveLocation(body.sessionId, body.location);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  trackMetric({ name: "session_move", durationMs: Date.now() - startedAt });
  return NextResponse.json({ session });
}
