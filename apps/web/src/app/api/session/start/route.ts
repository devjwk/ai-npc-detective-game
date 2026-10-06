import { NextResponse } from "next/server";
import { startSession } from "@/lib/in-memory-db";
import { trackMetric } from "@/lib/metrics";

export async function POST() {
  const startedAt = Date.now();
  const session = startSession();
  trackMetric({ name: "session_start", durationMs: Date.now() - startedAt });
  return NextResponse.json({ session });
}
