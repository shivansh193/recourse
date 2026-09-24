import { NextResponse } from "next/server";
import { verifyClaimFacts } from "@/lib/gemini";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { ClaimFacts } from "@/lib/types";

export async function POST(request: Request) {
  const limited = rateLimit(`verify:${clientKey(request)}`, 10, 5 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests — wait a moment and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const intakeText = typeof body?.intakeText === "string" ? body.intakeText.trim().slice(0, 2000) : "";
  const facts = body?.facts as ClaimFacts | undefined;

  if (!intakeText || !facts) {
    return NextResponse.json({ error: "Missing intake text or claim facts." }, { status: 400 });
  }

  if (typeof facts.defendant !== "string" || typeof facts.basis !== "string") {
    return NextResponse.json({ error: "Malformed claim facts." }, { status: 400 });
  }

  try {
    const results = await verifyClaimFacts(intakeText, {
      defendant: facts.defendant.slice(0, 500),
      basis: facts.basis.slice(0, 2000),
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
