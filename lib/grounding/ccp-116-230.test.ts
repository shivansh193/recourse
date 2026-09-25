import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateFilingFee } from "./ccp-116-230.ts";

test("charges $30 for claims at or under $1,500", () => {
  assert.equal(calculateFilingFee(1500).fee, 30);
  assert.equal(calculateFilingFee(1).fee, 30);
});

test("charges $50 for claims between $1,500 and $5,000", () => {
  assert.equal(calculateFilingFee(1500.01).fee, 50);
  assert.equal(calculateFilingFee(5000).fee, 50);
});

test("charges $75 for claims over $5,000", () => {
  assert.equal(calculateFilingFee(5000.01).fee, 75);
  assert.equal(calculateFilingFee(12500).fee, 75);
});

test("tier label matches the fee actually charged", () => {
  assert.equal(calculateFilingFee(1500).tierLabel, "$1,500 or less");
  assert.equal(calculateFilingFee(3000).tierLabel, "more than $1,500, up to $5,000");
  assert.equal(calculateFilingFee(9000).tierLabel, "more than $5,000");
});
