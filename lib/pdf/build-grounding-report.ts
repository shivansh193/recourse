import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { sanitizeForFont, wrapText } from "./text-helpers";
import type { ClaimFacts, Eligibility, ReportItem } from "@/lib/types";

// A standalone, downloadable copy of the grounding report shown on the
// workspace screen — so a legal-aid volunteer (or the filer themselves)
// can review the citation trail without opening the app. Renders exactly
// the report data the client already computed/received, rather than
// recomputing anything server-side — this is a copy of what was actually
// reviewed on screen, not a fresh (and possibly different) AI pass.

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = rgb(0.08, 0.1, 0.12);
const FAINT = rgb(0.45, 0.48, 0.45);
const ACCENT = rgb(0.12, 0.36, 0.3);
const DANGER = rgb(0.54, 0.17, 0.13);

type Cursor = { page: PDFPage; y: number };

export async function buildGroundingReportPdf(input: {
  facts: ClaimFacts;
  eligibility: Eligibility;
  filingFee: { fee: number; tierLabel: string } | null;
  reportItems: ReportItem[];
  generatedAt: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  let cursor: Cursor = { page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: PAGE_HEIGHT - MARGIN };

  function newPageIfNeeded(neededHeight: number) {
    if (cursor.y - neededHeight < MARGIN) {
      cursor = { page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: PAGE_HEIGHT - MARGIN };
    }
  }

  function drawWrapped(text: string, opts: { size: number; font: PDFFont; color: typeof INK; gap?: number }) {
    const lines = wrapText(sanitizeForFont(text, opts.font), opts.font, opts.size, CONTENT_WIDTH);
    for (const line of lines) {
      newPageIfNeeded(opts.size + 4);
      cursor.page.drawText(line, { x: MARGIN, y: cursor.y, size: opts.size, font: opts.font, color: opts.color });
      cursor.y -= opts.size * 1.4;
    }
    cursor.y -= opts.gap ?? 0;
  }

  function drawRule() {
    newPageIfNeeded(10);
    cursor.page.drawLine({
      start: { x: MARGIN, y: cursor.y },
      end: { x: PAGE_WIDTH - MARGIN, y: cursor.y },
      thickness: 0.75,
      color: FAINT,
    });
    cursor.y -= 14;
  }

  // Header
  drawWrapped("Recourse — Grounding Report", { size: 18, font: bold, color: INK, gap: 2 });
  drawWrapped(
    `Generated ${input.generatedAt} · California small claims · security deposit claim`,
    { size: 9, font: italic, color: FAINT, gap: 12 }
  );
  drawRule();

  // Claim summary
  drawWrapped("Claim summary", { size: 12, font: bold, color: INK, gap: 4 });
  const summaryRows: [string, string][] = [
    ["Plaintiff", input.facts.plaintiff || "(not entered)"],
    ["Defendant", sanitizeForFont(input.facts.defendant, font) || "(not entered)"],
    ["Amount claimed", input.facts.amount || "(not entered)"],
    ["Courthouse reason", input.facts.courthouseReason || "(not entered)"],
  ];
  for (const [label, value] of summaryRows) {
    newPageIfNeeded(14);
    cursor.page.drawText(`${label}:`, { x: MARGIN, y: cursor.y, size: 10, font: bold, color: INK });
    cursor.page.drawText(sanitizeForFont(value, font), { x: MARGIN + 130, y: cursor.y, size: 10, font, color: INK });
    cursor.y -= 15;
  }
  cursor.y -= 6;

  // Eligibility
  drawWrapped("Eligibility", { size: 12, font: bold, color: INK, gap: 4 });
  const eligColor = input.eligibility.eligible ? ACCENT : DANGER;
  const eligText = input.eligibility.eligible
    ? `Eligible — within the ${currency.format(input.eligibility.limit)} individual limit.`
    : `Not eligible at this amount — exceeds the ${currency.format(input.eligibility.limit)} individual limit.`;
  drawWrapped(eligText, { size: 10.5, font: bold, color: eligColor, gap: 2 });
  drawWrapped(
    `Source: ${input.eligibility.citation}${input.eligibility.verified ? "" : " (unverified pasted source)"}`,
    { size: 9, font: italic, color: FAINT, gap: 2 }
  );
  if (input.eligibility.statuteText) {
    drawWrapped(`"${input.eligibility.statuteText}"`, { size: 9, font: italic, color: FAINT, gap: 8 });
  } else {
    cursor.y -= 6;
  }

  if (input.filingFee) {
    drawWrapped(
      `Filing fee: ${currency.format(input.filingFee.fee)} (CCP §116.230, claims ${input.filingFee.tierLabel})`,
      { size: 10, font, color: INK, gap: 10 }
    );
  }

  drawRule();

  // Grounding report items
  drawWrapped("Fact-by-fact grounding", { size: 12, font: bold, color: INK, gap: 6 });
  for (const item of input.reportItems) {
    newPageIfNeeded(40);
    const flagged = item.supported === false;
    const tagColor = flagged ? DANGER : ACCENT;
    cursor.page.drawText(`[${item.tag}]`, { x: MARGIN, y: cursor.y, size: 9.5, font: bold, color: tagColor });
    const claimLines = wrapText(sanitizeForFont(item.claim, font), font, 10, CONTENT_WIDTH - 30);
    for (const line of claimLines) {
      newPageIfNeeded(14);
      cursor.page.drawText(line, { x: MARGIN + 30, y: cursor.y, size: 10, font, color: INK });
      cursor.y -= 13;
    }
    cursor.y -= 1;
    drawWrapped(item.source, { size: 8.5, font: italic, color: FAINT, gap: 1 });
    if (item.quote) {
      drawWrapped(`"${item.quote}"`, { size: 8.5, font: italic, color: FAINT, gap: 10 });
    } else {
      cursor.y -= 8;
    }
  }

  drawRule();
  drawWrapped(
    "This is not a lawyer and not legal advice. It's a record of what was checked and against what " +
      "source, so it can be reviewed before filing.",
    { size: 8.5, font: italic, color: FAINT }
  );

  return doc.save();
}
