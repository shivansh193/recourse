import { NextResponse } from "next/server";
import { extractClaimFacts } from "@/lib/gemini";
import type { ClaimFacts } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

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

  const facts: ClaimFacts = {
    plaintiff: "",
    defendant: extracted.defendant,
    courthouseReason: "",
    basis: extracted.basis,
    amount: extracted.amount,
    demandMade: extracted.demandMade,
    periodPassed: extracted.periodPassed,
    itemizationReceived: extracted.itemizationReceived,
  };

  // Eligibility is computed client-side in WorkspaceStep, live against the
  // editable amount field (and any active pasted jurisdiction source) —
  // not duplicated here.
  return NextResponse.json({ facts });
}
