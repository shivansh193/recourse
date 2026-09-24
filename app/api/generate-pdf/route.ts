import { NextResponse } from "next/server";
import { fillSc100Pdf } from "@/lib/pdf/fill-sc100";
import type { ClaimFacts } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const facts = body?.facts as ClaimFacts | undefined;

  if (!facts) {
    return NextResponse.json({ error: "Missing claim facts." }, { status: 400 });
  }

  try {
    const pdfBytes = await fillSc100Pdf(facts);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="SC-100-recourse-draft.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "Couldn't generate the PDF. Try again." }, { status: 500 });
  }
}
