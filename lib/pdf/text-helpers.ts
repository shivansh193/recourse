import type { PDFFont } from "pdf-lib";

// Helvetica only supports WinAnsi encoding (covers ASCII plus most
// Western-European accented letters — à ü ñ ø etc. all work fine). CJK
// characters and emoji don't, and pdf-lib throws synchronously the moment
// you measure or draw one, which was crashing PDF generation entirely for
// any name containing them (found in testing). Replacing just the
// unencodable characters, rather than rejecting the whole field, keeps as
// much of the user's actual text as possible on a real, working PDF.
export function sanitizeForFont(text: string, font: PDFFont): string {
  try {
    font.widthOfTextAtSize(text, 10);
    return text;
  } catch {
    let out = "";
    for (const ch of text) {
      try {
        font.widthOfTextAtSize(ch, 10);
        out += ch;
      } catch {
        out += "?";
      }
    }
    return out;
  }
}

// Truncates a single line with an ellipsis so it never overruns past a
// fixed width (e.g. into a label sitting to its right on a form).
export function fitText(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const ellipsis = "…";
  let result = text;
  while (result.length > 0 && font.widthOfTextAtSize(result + ellipsis, size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + ellipsis;
}

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number, maxLines = Infinity): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}
