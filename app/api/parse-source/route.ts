import { NextResponse } from "next/server";
import { parseJurisdictionSource } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Paste the research text first." }, { status: 400 });
  }

  try {
    const parsed = await parseJurisdictionSource(text);
    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("Jurisdiction source parsing failed:", err);
    return NextResponse.json({ error: "Couldn't read that source. Try again." }, { status: 502 });
  }
}
