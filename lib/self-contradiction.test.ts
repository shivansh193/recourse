import { test } from "node:test";
import assert from "node:assert/strict";
import { hasSelfContradiction } from "./self-contradiction.ts";

test("flags a note that says evidence is missing", () => {
  assert.equal(hasSelfContradiction("The text does not mention an itemized statement."), true);
});

test("flags a note that says something isn't stated", () => {
  assert.equal(hasSelfContradiction("This isn't clearly stated in the intake text."), true);
});

test("flags a note that says it contradicts the text", () => {
  assert.equal(hasSelfContradiction("This contradicts what the tenant actually said."), true);
});

test("does not flag an ordinary supporting note", () => {
  assert.equal(hasSelfContradiction("The text explicitly states \"I've asked twice in writing\"."), false);
});

test("does not flag a note describing a legitimately false fact", () => {
  // Negation describing what happened (not the evidence itself being
  // absent) is normal and shouldn't be flagged.
  assert.equal(
    hasSelfContradiction("The tenant states the landlord did not provide an itemized statement."),
    false
  );
});
