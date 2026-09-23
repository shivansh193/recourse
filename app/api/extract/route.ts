import { NextResponse } from "next/server";
import { extractClaimFacts } from "@/lib/gemini";
import { CCP_116_221 } from "@/lib/grounding/ccp-116-221";
import type { ClaimFacts, Eligibility } from "@/lib/types";

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

  const amountNumber = Number(extracted.amount.replace(/[^0-9.]/g, ""));
  const hasAmount = Number.isFinite(amountNumber) && amountNumber > 0;

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

  const eligibility: Eligibility = {
    eligible: hasAmount && amountNumber <= CCP_116_221.individualLimit,
    amountNumber: hasAmount ? amountNumber : null,
    limit: CCP_116_221.individualLimit,
    citation: CCP_116_221.citation,
    sourceUrl: CCP_116_221.sourceUrl,
    statuteText: CCP_116_221.text,
  };

  return NextResponse.json({ facts, eligibility });
}
