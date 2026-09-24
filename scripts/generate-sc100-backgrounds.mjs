// One-time asset generation: renders the official SC-100 PDF to page
// background images at build time, so the runtime fill pipeline never has
// to parse the original (XFA-structured) PDF with pdf-lib — see the
// comment in lib/pdf/fill-sc100.ts for why that doesn't work reliably.
import * as mupdf from "mupdf";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const SRC = "lib/grounding/forms/sc100.pdf";
const OUT_DIR = "lib/grounding/forms/sc100-pages";
const DPI = 150;

const bytes = await readFile(SRC);
const doc = mupdf.PDFDocument.openDocument(bytes, "application/pdf");
await mkdir(OUT_DIR, { recursive: true });

const count = doc.countPages();
console.log(`Rendering ${count} pages at ${DPI} DPI grayscale...`);
for (let i = 0; i < count; i++) {
  const page = doc.loadPage(i);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(DPI / 72, DPI / 72), mupdf.ColorSpace.DeviceGray, false, true);
  const png = pixmap.asPNG();
  const path = `${OUT_DIR}/page-${i}.png`;
  await writeFile(path, png);
  console.log(`  ${path} (${png.length} bytes)`);
}
console.log("Done.");
