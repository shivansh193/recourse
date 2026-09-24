import { PDFDocument, StandardFonts, rgb, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ClaimFacts } from "@/lib/types";
import { sanitizeForFont, fitText, wrapText } from "./text-helpers";

// The official SC-100 PDF (lib/grounding/forms/sc100.pdf) is an Adobe
// LiveCycle / XFA-structured, digitally-certified form. pdf-lib cannot
// reliably parse it: its AcroForm and even some page content objects sit
// inside object streams that pdf-lib's recovery logic drops silently on
// load, so a load-then-save round trip on that file comes back with blank
// pages (verified directly with pdfjs-dist during development — 0 text
// items survive the round trip). Rendering it to page images with mupdf
// (scripts/generate-sc100-backgrounds.mjs, a one-time build step) and then
// building a *fresh* pdf-lib document with those images as page
// backgrounds sidesteps the parser entirely, so the output is a normal,
// valid PDF that any viewer can open — the visible form is the real,
// current (Rev. January 1, 2026) Judicial Council SC-100, not a lookalike.
//
// Coordinates below were read directly off the real form's text layer via
// pdfjs-dist (not eyeballed), so each value lands on its actual line.

const PAGE_COUNT = 6;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const BG_DIR = path.join(process.cwd(), "lib/grounding/forms/sc100-pages");

const INK = rgb(0.06, 0.1, 0.5);

export async function fillSc100Pdf(facts: ClaimFacts): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const pages: PDFPage[] = [];
  for (let i = 0; i < PAGE_COUNT; i++) {
    const pngBytes = await readFile(path.join(BG_DIR, `page-${i}.png`));
    const img = await doc.embedPng(pngBytes);
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawImage(img, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
    pages.push(page);
  }

  const page2 = pages[1]; // form "Page 2 of 6" — plaintiff, defendant, amount, basis
  const page3 = pages[2]; // form "Page 3 of 6" — item 4 demand-made Yes/No

  const plaintiff = sanitizeForFont(facts.plaintiff, font);
  const defendant = sanitizeForFont(facts.defendant, font);
  const amount = sanitizeForFont(facts.amount, font);
  const basis = sanitizeForFont(facts.basis, font);
  const courthouseReason = sanitizeForFont(facts.courthouseReason, font);

  const captionName = plaintiff || "";
  if (captionName) {
    const fitted = fitText(captionName, font, 9, 240);
    page2.drawText(fitted, { x: 145, y: 747, size: 9, font, color: INK });
    page3.drawText(fitted, { x: 145, y: 747, size: 9, font, color: INK });
  }

  if (plaintiff) {
    page2.drawText(fitText(plaintiff, font, 10, 275), { x: 98, y: 677, size: 10, font, color: INK });
  }
  if (defendant) {
    page2.drawText(fitText(defendant, font, 10, 275), { x: 98, y: 392, size: 10, font, color: INK });
  }
  if (amount) {
    const amountValue = fitText(amount.replace(/^\$/, ""), font, 10, 85);
    page2.drawText(amountValue, { x: 310, y: 197, size: 10, font, color: INK });
  }
  if (basis) {
    const lines = wrapText(basis, font, 9.5, 520, 6);
    lines.forEach((line, i) => {
      page2.drawText(line, { x: 68, y: 163 - i * 18, size: 9.5, font, color: INK });
    });
  }

  // Item 4: "Have you asked the defendant to pay you before suing?"
  // demandMade === true -> Yes box; explicitly false -> No box. Left blank
  // (neither box marked) when unknown, rather than guessing.
  if (facts.demandMade === true) {
    page3.drawText("X", { x: 65, y: 489, size: 9, font, color: INK });
  } else if (facts.demandMade === false) {
    page3.drawText("X", { x: 119, y: 489, size: 9, font, color: INK });
  }

  // Item 5 is a set of lettered checkboxes (a-d) for specific venue rules,
  // plus "e. Other (specify): ___". We don't determine which specific rule
  // applies — that's a legal judgment call, not something to guess — so a
  // free-text courthouse reason goes on the "e. Other" line, with e marked.
  if (courthouseReason) {
    page3.drawText("X", { x: 84, y: 220, size: 9, font, color: INK });
    page3.drawText(fitText(courthouseReason, font, 9.5, 415), { x: 170, y: 220, size: 9.5, font, color: INK });
  }

  return doc.save();
}
