import { NextResponse } from "next/server";
import { getSession, listCollectedEvidence } from "@/lib/in-memory-db";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const session = getSession(params.id);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json({
    session,
    evidence: listCollectedEvidence(session)
  });
}
