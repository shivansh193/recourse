import { NextResponse } from "next/server";
import { extractClaimFacts } from "@/lib/gemini";
import { findVerbatimSpan } from "@/lib/text-match";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { ClaimFacts, ScreeningResult } from "@/lib/types";

export async function POST(request: Request) {
  const limited = rateLimit(`extract:${clientKey(request)}`, 10, 5 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests — wait a moment and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 2000) : "";

  if (!text) {
    return NextResponse.json(
      { error: "Describe your situation before checking your case." },
      { status: 400 }
    );
  }

  let extracted;
  try {
    extracted = await extractClaimFacts(text);
  } catch (err) {
    console.error("Fact extraction failed:", err);
    return NextResponse.json(
      {
        error:
          "Fact extraction failed. Check that GEMINI_API_KEY is configured on the server and try again.",
      },
      { status: 502 }
    );
  }

  // Gemini can retype a name with a character subtly altered (e.g. an
  // accented letter swapped for a similar-looking one). Force it back to
  // the user's own literal words when a close match exists in the source.
  const defendant = findVerbatimSpan(extracted.defendant, text);

  const facts: ClaimFacts = {
    plaintiff: "",
    defendant,
    courthouseReason: "",
    basis: extracted.basis,
    amount: extracted.amount,
    demandMade: extracted.demandMade,
    periodPassed: extracted.periodPassed,
    itemizationReceived: extracted.itemizationReceived,
  };

  const screening: ScreeningResult = {
    isSecurityDepositClaim: extracted.isSecurityDepositClaim,
    higherStakesFlag: extracted.higherStakesFlag,
    note: extracted.screeningNote,
  };

  // Eligibility is computed client-side in WorkspaceStep, live against the
  // editable amount field (and any active pasted jurisdiction source) —
  // not duplicated here.
  return NextResponse.json({ facts, screening });
}
