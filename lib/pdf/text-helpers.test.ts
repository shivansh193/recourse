import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { sanitizeForFont, fitText, wrapText } from "./text-helpers.ts";

async function helveticaFont() {
  const doc = await PDFDocument.create();
  return doc.embedFont(StandardFonts.Helvetica);
}

test("sanitizeForFont leaves normal and accented text untouched", async () => {
  const font = await helveticaFont();
  assert.equal(sanitizeForFont("Jordan A. Reyes", font), "Jordan A. Reyes");
  assert.equal(sanitizeForFont("Zörg Müller & Søn", font), "Zörg Müller & Søn");
});

test("sanitizeForFont replaces unencodable characters instead of throwing", async () => {
  // The actual bug: CJK + emoji crashed PDF generation entirely (500 error)
  // because Helvetica/WinAnsi can't encode them and pdf-lib throws
  // synchronously on measurement.
  const font = await helveticaFont();
  const result = sanitizeForFont("房东 Landlord 💰", font);
  assert.doesNotThrow(() => font.widthOfTextAtSize(result, 10));
  assert.ok(result.includes("Landlord"), "keeps the encodable part of the string");
  assert.ok(result.includes("?"), "replaces the unencodable characters rather than dropping the whole field");
});

test("fitText returns text unchanged when it already fits", async () => {
  const font = await helveticaFont();
  assert.equal(fitText("Short", font, 10, 500), "Short");
});

test("fitText truncates with an ellipsis instead of overflowing", async () => {
  const font = await helveticaFont();
  const long = "Test Defendant LLC with a Very Long Company Name Incorporated";
  const result = fitText(long, font, 10, 275);
  assert.ok(font.widthOfTextAtSize(result, 10) <= 275, "fits within the given width");
  assert.ok(result.endsWith("…"), "ends with an ellipsis");
  assert.notEqual(result, long, "was actually truncated");
});

test("wrapText splits long text across multiple lines within maxLines", async () => {
  const font = await helveticaFont();
  const text = "This is a moderately long sentence that should wrap across more than one line of text.";
  const lines = wrapText(text, font, 9.5, 150, 6);
  assert.ok(lines.length > 1, "wraps to more than one line");
  assert.ok(lines.length <= 6, "respects the maxLines cap");
  for (const line of lines) {
    assert.ok(font.widthOfTextAtSize(line, 9.5) <= 150, `line fits within maxWidth: "${line}"`);
  }
});
