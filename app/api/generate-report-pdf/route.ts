import { NextResponse } from "next/server";
import { buildGroundingReportPdf } from "@/lib/pdf/build-grounding-report";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { ClaimFacts, Eligibility, ReportItem } from "@/lib/types";

export async function POST(request: Request) {
  const limited = rateLimit(`generate-report-pdf:${clientKey(request)}`, 30, 5 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests — wait a moment and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const facts = body?.facts as ClaimFacts | undefined;
  const eligibility = body?.eligibility as Eligibility | undefined;
  const reportItems = body?.reportItems as ReportItem[] | undefined;
  const filingFee = body?.filingFee as { fee: number; tierLabel: string } | null | undefined;

  if (!facts || !eligibility || !reportItems) {
    return NextResponse.json({ error: "Missing report data." }, { status: 400 });
  }

  try {
    const pdfBytes = await buildGroundingReportPdf({
      facts,
      eligibility,
      filingFee: filingFee ?? null,
      reportItems,
      generatedAt: new Date().toISOString().slice(0, 10),
    });
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="recourse-grounding-report.pdf"',
      },
    });
  } catch (err) {
    console.error("Grounding report PDF generation failed:", err);
    return NextResponse.json({ error: "Couldn't generate the report. Try again." }, { status: 500 });
  }
}
