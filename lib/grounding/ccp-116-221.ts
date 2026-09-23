// Verbatim excerpt of California Code of Civil Procedure §116.221, the
// statute that sets the small-claims dollar limit for an individual
// plaintiff. Retrieved 2026-09-24 from leginfo.legislature.ca.gov — the
// limit changes by legislation (most recently SB 71, effective 2024-01-01,
// which raised it from $10,000 to $12,500), so this is checked against the
// live source rather than recalled from a model's training data.
export const CCP_116_221 = {
  id: "ccp-116-221",
  citation: "CCP §116.221",
  sourceUrl:
    "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=116.221.&nodeTreePath=4.1.5.2&lawCode=CCP",
  individualLimit: 12500,
  effectiveDate: "2024-01-01",
  amendedBy: "Stats. 2023, Ch. 861, Sec. 6 (SB 71)",
  text:
    "In addition to the jurisdiction conferred by Section 116.220, the small claims court has " +
    "jurisdiction in an action brought by a natural person, if the amount of the demand does not " +
    "exceed twelve thousand five hundred dollars ($12,500), except as provided in subdivision (c) " +
    "of Section 116.220 and in subdivision (a) of Section 116.231.",
  retrievedAt: "2026-09-24",
} as const;
