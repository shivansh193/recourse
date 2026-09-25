import { test } from "node:test";
import assert from "node:assert/strict";
import { findVerbatimSpan } from "./text-match.ts";

test("returns the exact source casing when the candidate matches verbatim", () => {
  const source = "My landlord Sunset Villas kept my deposit.";
  assert.equal(findVerbatimSpan("Sunset Villas", source), "Sunset Villas");
});

test("matches case-insensitively but returns the source's own casing", () => {
  const source = "My landlord sunset villas kept my deposit.";
  assert.equal(findVerbatimSpan("Sunset Villas", source), "sunset villas");
});

test("corrects a single-character substitution to the real source text", () => {
  // The actual bug this function was built to fix: Gemini retyped
  // "Müller" as "Múller" (ü swapped for ú).
  const source = "My landlord Zörg Müller & Søn kept my deposit.";
  assert.equal(findVerbatimSpan("Zörg Múller & Søn", source), "Zörg Müller & Søn");
});

test("leaves the candidate unchanged when no close match exists", () => {
  const source = "My landlord kept my deposit.";
  assert.equal(findVerbatimSpan("Totally Different Company LLC", source), "Totally Different Company LLC");
});

test("leaves very short candidates unchanged (avoids over-eager fuzzy matching)", () => {
  const source = "My landlord kept my deposit.";
  assert.equal(findVerbatimSpan("X", source), "X");
});

test("leaves an empty candidate unchanged", () => {
  assert.equal(findVerbatimSpan("", "some source text"), "");
});
