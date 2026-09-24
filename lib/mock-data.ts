import type { ClaimFacts, GroundingSource } from "./types";

// Used only for the landing page's "See a grounded filing first" link, so
// there's something to look at before typing your own claim. The intake
// text is included so that link can also demonstrate a real, live
// self-verification pass against it, not a canned result.
export const EXAMPLE_INTAKE_TEXT =
  "My landlord, Marlin Property Group, kept my $1,500 deposit and won't explain why. It's been 3 months " +
  "since I moved out and I've asked twice in writing, but I never got an itemized statement of deductions.";

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

export const RESEARCH_PROMPT =
  "Find the current small-claims dollar limit and the official plaintiff's-claim form for " +
  "[STATE]. Cite the statute section and the form name/number directly, with source URLs. " +
  "Return it as: (1) dollar limit + statute citation, (2) form name/number + issuing body + " +
  "URL, (3) any mandatory pre-filing steps.";
