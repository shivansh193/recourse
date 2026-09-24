import { NextResponse } from "next/server";
import { verifyClaimFacts } from "@/lib/gemini";
import type { ClaimFacts } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const intakeText = typeof body?.intakeText === "string" ? body.intakeText.trim() : "";
  const facts = body?.facts as ClaimFacts | undefined;

  if (!intakeText || !facts) {
    return NextResponse.json({ error: "Missing intake text or claim facts." }, { status: 400 });
  }

  try {
    const results = await verifyClaimFacts(intakeText, {
      defendant: facts.defendant,
      basis: facts.basis,
      demandMade: facts.demandMade,
      periodPassed: facts.periodPassed,
      itemizationReceived: facts.itemizationReceived,
    });
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Self-verification failed:", err);
    return NextResponse.json({ error: "Self-verification failed. Try again." }, { status: 502 });
  }
}
