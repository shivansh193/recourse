// Verbatim fee tiers from California Code of Civil Procedure §116.230,
// retrieved 2026-09-24 from leginfo.legislature.ca.gov. Fees are for a
// filer with 12 or fewer small claims filed statewide in the prior 12
// months — the standard case for a first-time filer, which is what this
// tool assumes rather than tracking filing history. A filer who has filed
// more than 12 pays a flat $100 instead; noted, not computed here.
export const CCP_116_230 = {
  id: "ccp-116-230",
  citation: "CCP §116.230",
  sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=116.230.&lawCode=CCP",
  frequentFilerFee: 100,
  tiers: [
    { maxAmount: 1500, fee: 30 },
    { maxAmount: 5000, fee: 50 },
    { maxAmount: Infinity, fee: 75 },
  ],
  retrievedAt: "2026-09-24",
} as const;

export function calculateFilingFee(amount: number): { fee: number; tierLabel: string } {
  const tier = CCP_116_230.tiers.find((t) => amount <= t.maxAmount) ?? CCP_116_230.tiers[CCP_116_230.tiers.length - 1];
  const tierLabel =
    tier.maxAmount === 1500
      ? "$1,500 or less"
      : tier.maxAmount === 5000
        ? "more than $1,500, up to $5,000"
        : "more than $5,000";
  return { fee: tier.fee, tierLabel };
}
