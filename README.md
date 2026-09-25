# Recourse — grounded legal filings for people without a lawyer

Built for LexHack 2026 (Access to Justice / Digital Rights track). **Live: [recourse-pearl.vercel.app](https://recourse-pearl.vercel.app)**

## The problem

Small claims court exists specifically so people don't need a lawyer — but the forms, the eligibility rules, and the statute language are still written for lawyers. Someone who's owed a security deposit and can't afford legal help is left guessing whether they even qualify, what to write, and whether they're about to waste a filing fee on a claim that gets thrown out.

Generic AI legal assistants make this worse in a specific, well-documented way: they hallucinate — wrong dollar thresholds, invented statute sections, confident answers that don't match the actual law in the actual jurisdiction. That's the exact failure mode that's gotten real lawyers sanctioned in the last two years for citing fake cases. The same risk applies to a self-represented person asking an AI "can I sue my landlord for this."

## What Recourse does

Helps someone without a lawyer file a California small claims petition for a security deposit dispute — grounded in the real statute and the real official court form, not generated from memory.

1. **Describe the problem in plain language.** "My landlord kept my $1,500 deposit and won't explain why, it's been 3 months since I moved out."
2. **Screen the claim.** Before anything else, the same extraction pass checks whether this is actually a security-deposit dispute — small claims is designed for a civil money dispute, not something with real housing or safety stakes. An active eviction, a lockout, or a safety issue gets a warning and a pointer to courts.ca.gov/selfhelp or legal aid instead of being walked into a tool that isn't built for it. Not a hard block — the screen can be wrong, so there's a "continue anyway" override.
3. **Extract structured facts.** Dollar amount, parties, dates, claim basis — pulled from the free text, shown back to the user to confirm before anything else happens. A name is corrected against the source text if the model retypes it with a character subtly altered (this happens — see [How grounding actually works](#how-grounding-actually-works)), rather than trusted as-is.
4. **Check eligibility against the real statute, computed in code.** California's $12,500 individual small-claims limit (CCP §116.221) and the filing fee tiers (CCP §116.230) are checked with plain arithmetic against verbatim statute text pulled from leginfo.legislature.ca.gov — never asked of the model as a fact to recall.
5. **Draft the petition into the real form** — California Judicial Council form SC-100 (Plaintiff's Claim and ORDER to Go to Small Claims Court), populated with the user's facts, not a from-scratch document that looks official but isn't.
6. **Self-verify before showing the user anything.** A second pass re-checks every drafted fact against what the user actually said, before the user sees it — catching the tool's own mistakes rather than assuming the first pass was right. This is the real technical core: not "does the AI sound confident," but "is every claim in this document traceable to a real source."
7. **Output**: a filled SC-100 PDF, plus a grounding report (also downloadable on its own, so a legal-aid volunteer can review the citation trail without opening the app) showing exactly which statute sections and form instructions were used for each part of the filing.

Beyond California's own CCP §116.221 limit, a user can also paste research about another state's small-claims rules (with a prompt this app generates for them to run in an external AI) and have it override the eligibility check — clearly marked as an unverified, pasted source, distinct from the built-in California statute.

## Why this scope

- **Small claims, not eviction or a protective order** — small claims is statutorily designed for self-represented litigants (California caps attorney involvement in small claims specifically), so the harm-if-imperfect ceiling is a civil money dispute, not someone's housing or safety. The pre-screening step above exists to actually enforce this boundary, not just assume users self-select correctly.
- **One petition type, one state, fully grounded** — beats covering many jurisdictions shallowly. California specifically because its self-help court resources (courts.ca.gov/selfhelp) and Judicial Council forms are well-structured and genuinely public.
- **Security deposit disputes specifically** — the single most common small claims filing type by self-represented litigants, per California court self-help data, and it has a clean, checkable numeric eligibility rule (the dollar threshold) that's ideal for demonstrating "grounded not hallucinated."

## How grounding actually works

Worth being precise about this, since it's the whole point of the project:

- **The statute text is real, but it's a checked-in constant, not a live fetch.** `lib/grounding/*.ts` holds verbatim excerpts of CCP §116.221, CCP §116.230, and Civ. Code §1950.5(h)(1), each with the source URL and retrieval date, pulled directly from leginfo.legislature.ca.gov during development. Eligibility and the filing fee are computed against this text with plain code — the model is never asked "what's the dollar limit," only asked to extract facts from the user's own words. This is grounded in the sense that matters (the number is the real number, sourced and dated, not a model's guess), but it isn't re-fetched from the live statute on every request; a future revision would add a build-time refresh step.
- **Self-verification is a second, independent model pass — and it's been hardened against its own failure mode.** Early testing surfaced a real case of a verdict ("supported: true") paired with a written justification that argued the opposite. The fix: the response schema now asks the model for its evidence *before* asking for the verdict (structured output generates sequentially, so asking for the conclusion first let the model justify whatever it had already committed to), plus a narrow deterministic check that overrides a `true` verdict if its own note still contradicts it. Neither adds an extra model call.
- **A name is corrected against the source, not trusted as retyped.** The extraction model has, in testing, retyped a name with a single character altered (an accented letter swapped for a similar one). `lib/text-match.ts` checks the extracted name against the actual intake text and substitutes the real substring when a close match exists, rather than trusting the model's copy.
- **The real SC-100 PDF is genuinely hard to fill programmatically**, and it's worth documenting why: the official form from courts.ca.gov is Adobe LiveCycle/XFA-structured and digitally certified, which `pdf-lib` cannot reliably parse — a bare load-then-save round trip on it silently drops all page content (verified directly with `pdfjs-dist`). The workaround: render the real form's pages to images once (`scripts/generate-sc100-backgrounds.mjs`), then build a fresh PDF with those images as page backgrounds and the user's facts drawn on top at coordinates read directly off the form's own text layer. The output is a normal, valid PDF showing the actual, current (Rev. January 1, 2026) Judicial Council form — not a recreation of it.
- **The Gemini free-tier quota is a real constraint, not just a footnote.** 20 requests/day on the primary model (`gemini-3.8-flash`), with a same-day fallback to `gemini-3.5-flash-lite` on overload or quota errors. Every AI-backed API route also has a basic per-IP rate limit and a server-side input length cap.

## Architecture

- **Next.js 16 / React 19 / TypeScript**, App Router, deployed on Vercel.
- **No database.** Nothing is persisted server-side — everything lives in client state for the duration of a session. Deliberate, not a shortcut: no accounts means no signup friction for someone who needs this tool during a stressful moment, and a hackathon-timeline build has no business standing up its own auth/session security surface.
- **Grounding data**: `lib/grounding/` — the actual statute text (CCP §116.221, CCP §116.230, Civ. Code §1950.5(h)(1)) and the real SC-100 form + its page images, not a general-purpose retrieval pipeline. The scope is one form and a handful of statute sections, not an open-ended legal corpus.
- **LLM**: Gemini (`lib/gemini.ts`), used for exactly three things: fact extraction + claim screening from the user's free text, the self-verification pass, and parsing a user-pasted out-of-state research snippet. Eligibility, the filing fee, and name-correction are deliberately *not* LLM calls — plain code, where plain code is possible.
- **PDF generation**: `pdf-lib`, building fresh documents with the real form's rendered pages as backgrounds (`lib/pdf/fill-sc100.ts`) and a separate standalone grounding-report PDF (`lib/pdf/build-grounding-report.ts`).

## Explicit scope boundary

**Built:**
- California only, security deposit small claims only.
- Plain-language intake → claim screening → fact extraction → eligibility + filing-fee check → form population → self-verification → downloadable filled PDF + downloadable grounding report.
- An opt-in, clearly-unverified path to override eligibility with another state's pasted rules.

**Explicitly out of scope, not attempted:**
- Other petition types (eviction response, fee waivers, restraining orders) or other states' actual forms.
- E-filing / court submission integration.
- Attorney/legal-aid review workflow.
- Multi-language support.
- Accounts, persistence, or anything requiring a database.

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # add your own Gemini key, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whatever port you pass to `next dev`).

### Environment variables

```
GEMINI_API_KEY=your-gemini-key-here
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). It's the only environment variable this app needs.

### Other scripts

```bash
npm run test                    # unit tests (node --test, no extra dependencies)
npm run lint                    # eslint
npm run gen:sc100-backgrounds   # regenerate the SC-100 page images from lib/grounding/forms/sc100.pdf
```

## Testing

`npm test` runs a small, deliberately scoped suite — the pure, deterministic functions where real bugs were actually found and fixed during development: the name-correction logic, the filing-fee tier calculation, the PDF text-encoding/wrapping helpers, and the self-verification contradiction guard. It does not attempt to test the AI-dependent extraction/verification calls themselves — mocking Gemini to "test" whether grounding works would defeat the point of grounding.
