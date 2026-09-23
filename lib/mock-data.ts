import type { ClaimFacts, GroundingSource, ReportItem } from "./types";

// Placeholder output shown until the real extraction + verification pipeline
// (fact extraction, live CCP §116.221 lookup, self-verification pass) is wired
// up. Same example used in the approved UI mockup, kept consistent so the
// workspace screen demonstrates the intended shape of a real result.
export const EXAMPLE_FACTS: ClaimFacts = {
  plaintiff: "Jordan A. Reyes",
  defendant: "Marlin Property Group, LLC",
  courthouseReason: "Defendant's business is in this county",
  basis:
    "Landlord failed to return security deposit within 21 days of move-out and gave no itemized statement.",
  amount: "$1,500.00",
  demandMade: true,
  periodPassed: true,
  itemizationReceived: false,
};

export const BUILT_IN_SOURCES: GroundingSource[] = [
  { id: "ccp-116-221", name: "CCP §116.221", meta: "leginfo.legislature.ca.gov", verified: true },
  { id: "sc-100", name: "SC-100 + instructions", meta: "courts.ca.gov/selfhelp", verified: true },
  { id: "civ-1950-5", name: "Civ. Code §1950.5(g)", meta: "leginfo.legislature.ca.gov", verified: true },
];

export const EXAMPLE_REPORT: ReportItem[] = [
  {
    tag: "1",
    claim: "Plaintiff name matches what you entered.",
    source: "Source: your intake text, sentence 1",
  },
  {
    tag: "2",
    claim: "Defendant identified as your former landlord's registered business name.",
    source: "Source: your intake text + county business lookup",
  },
  {
    tag: "4",
    claim: "21-day return deadline applied to this claim.",
    source: "Source: Civ. Code §1950.5(g)(1)",
    quote:
      '"...the landlord shall furnish the tenant a copy of an itemized statement... within 21 calendar days..."',
  },
  {
    tag: "5",
    claim: "$1,500 claim confirmed within the individual small-claims limit.",
    source: "Source: CCP §116.221 — individual limit $12,500",
    quote:
      '"...the small claims court has jurisdiction in... claim[s]... [that do] not exceed twelve thousand five hundred dollars..."',
  },
  {
    tag: "✓",
    claim: "Self-verification pass: no claim above was unsupported by intake text or retrieved source.",
    source: "Checked against: original intake + 2 statute sections",
  },
];

export const RESEARCH_PROMPT =
  "Find the current small-claims dollar limit and the official plaintiff's-claim form for " +
  "[STATE]. Cite the statute section and the form name/number directly, with source URLs. " +
  "Return it as: (1) dollar limit + statute citation, (2) form name/number + issuing body + " +
  "URL, (3) any mandatory pre-filing steps.";
