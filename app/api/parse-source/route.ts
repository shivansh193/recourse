import { NextResponse } from "next/server";
import { parseJurisdictionSource } from "@/lib/gemini";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`parse-source:${clientKey(request)}`, 10, 5 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests — wait a moment and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 4000) : "";

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
