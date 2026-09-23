# Recourse — grounded legal filings for people without a lawyer

Built for LexHack 2026 (Access to Justice / Digital Rights track).

## The problem

Small claims court exists specifically so people don't need a lawyer — but the forms, the eligibility rules, and the statute language are still written for lawyers. Someone who's owed a security deposit and can't afford legal help is left guessing whether they even qualify, what to write, and whether they're about to waste a filing fee on a claim that gets thrown out.

Generic AI legal assistants make this worse in a specific, well-documented way: they hallucinate — wrong dollar thresholds, invented statute sections, confident answers that don't match the actual law in the actual jurisdiction. That's the exact failure mode that's gotten real lawyers sanctioned in the last two years for citing fake cases. The same risk applies to a self-represented person asking an AI "can I sue my landlord for this."

## What Recourse does

Helps someone without a lawyer file a California small claims petition for a security deposit dispute — grounded in the real statute and the real official court form, not generated from memory.

1. **Describe the problem in plain language.** "My landlord kept my $1,500 deposit and won't explain why, it's been 3 months since I moved out."
2. **Extract structured facts.** Dollar amount, parties, dates, claim basis — pulled from the free text, shown back to the user to confirm before anything else happens.
3. **Check eligibility against the real statute**, not a hardcoded number. California's small claims dollar limit is retrieved from the actual Code of Civil Procedure text (§116.221 et seq.) at build/query time, not memorized — thresholds change, and this is exactly the kind of fact an LLM gets confidently wrong.
4. **Draft the petition into the real form** — California Judicial Council form SC-100 (Plaintiff's Claim and ORDER to Go to Small Claims Court), populated with the user's facts, not a from-scratch document that looks official but isn't.
5. **Self-verify before showing the user anything.** A second pass re-checks every fact on the drafted form against what the user actually said, and re-checks the eligibility claim against the retrieved statute text — catching the tool's own mistakes before they reach someone who's relying on this instead of a lawyer. This is the real technical core: not "does the AI sound confident," but "is every claim in this document traceable to a real source."
6. **Output**: a filled SC-100 PDF, plus a grounding report showing exactly which statute sections and form instructions were used for each part of the filing, so the user (or a legal aid volunteer reviewing it) can verify it themselves.

## Why this scope

- **Small claims, not eviction or a protective order** — small claims is statutorily designed for self-represented litigants (California caps attorney involvement in small claims specifically), so the harm-if-imperfect ceiling is a civil money dispute, not someone's housing or safety. That matters for a hackathon-timeline build.
- **One petition type, one state, fully grounded** — beats covering many jurisdictions shallowly. California specifically because its self-help court resources (courts.ca.gov/selfhelp) and Judicial Council forms are well-structured and genuinely public.
- **Security deposit disputes specifically** — the single most common small claims filing type by self-represented litigants, per California court self-help data, and it has a clean, checkable numeric eligibility rule (the dollar threshold) that's ideal for demonstrating "grounded not hallucinated."

## Architecture

- **Next.js 16 / React 19 / TypeScript**, App Router — same stack as prior work this cycle, known-good and fast to stand up.
- **Postgres via Prisma, hosted on Neon** — for saved petitions/accounts if time allows; not load-bearing for the core demo.
- **Grounding corpus**: the actual text of CCP §116.110 et seq. (small claims provisions) and the SC-100 form + its official instructions, fetched from courts.ca.gov and leginfo.legislature.ca.gov, stored as a small curated retrieval corpus — deliberately not a general-purpose RAG pipeline, since the scope is one form and one statute section, not an open-ended legal corpus.
- **LLM**: Gemini (same provider pattern as prior work), used for: (a) fact extraction from free text, (b) the self-verification pass (entailment-style check: does the drafted claim/fact actually follow from what the user said and what the statute says).
- **PDF form-filling**: `pdf-lib` (Node) to populate SC-100's actual AcroForm fields programmatically, so the output is a real, correctly-formatted court form, not a lookalike.

## Explicit MVP boundary

**In scope for the hackathon build:**
- California only, security deposit small claims only.
- Plain-language intake → fact extraction → eligibility check → form population → self-verification → downloadable filled PDF + grounding report.

**Explicitly deferred, not attempted this cycle:**
- Other petition types (eviction response, fee waivers, restraining orders) or other states.
- E-filing / court submission integration.
- Attorney/legal-aid review workflow.
- Multi-language support.

## Plan (deadline: Sep 28, 2:30am IST)

- **Day 1 (Sep 24)** — this scope, repo setup, source and validate the real grounding data (SC-100 form fields, actual current CCP small claims dollar threshold), build fact-extraction + eligibility-check pipeline.
- **Day 2 (Sep 25)** — PDF form-filling, self-verification pass, core UI.
- **Day 3 (Sep 26)** — polish, edge-case testing (ineligible claims, ambiguous facts, missing info), deploy.
- **Day 4 (Sep 27–28)** — demo video, Devpost write-up, final pass.
