import { NextResponse } from "next/server";
import { summarizeMetrics } from "@/lib/metrics";
import { getRecentErrors } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...summarizeMetrics(),
    errors: getRecentErrors()
  });
}
