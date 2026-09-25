// Conservative, low-false-positive safety net: even with evidence-first
// schema ordering (see VERIFY_RESPONSE_SCHEMA in gemini.ts), catch the
// specific pattern that caused a real observed bug — a `true` verdict
// whose own note explicitly says the evidence is absent or contradictory.
// Deliberately narrow (only fires on fairly unambiguous phrasing) since the
// goal is catching a structural inconsistency, not second-guessing every
// negation the model writes — a note legitimately contains a lot of "not"s
// when explaining why a *false* verdict is correct.
const SELF_CONTRADICTION_PATTERNS = [
  /\bdoes(?:n't| not) (?:state|mention|say|support|confirm)\b/i,
  /\b(?:not|isn't|is not) (?:clearly )?(?:stated|mentioned|supported|confirmed)\b/i,
  /\bno mention of\b/i,
  /\bcontradicts?\b/i,
  /\bcannot (?:be )?(?:verify|verified|confirm|confirmed)\b/i,
  /\bmissing from the (?:text|intake)\b/i,
];

export function hasSelfContradiction(note: string): boolean {
  return SELF_CONTRADICTION_PATTERNS.some((pattern) => pattern.test(note));
}
