import type { Eligibility, ReportItem } from "./types";

export const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// The one real, grounded line in the report so far: eligibility is computed
// in code against the retrieved statute text, not asserted by the model.
// The rest of the report (items 1/2/4 and the self-verification line) are
// still the placeholder shape shown in WorkspaceStep until extraction
// covers plaintiff/defendant provenance and a self-verification pass exists.
export function buildEligibilityReportItem(eligibility: Eligibility): ReportItem {
  const amountText =
    eligibility.amountNumber !== null ? currency.format(eligibility.amountNumber) : "the claimed amount";

  return {
    tag: "5",
    claim: eligibility.eligible
      ? `${amountText} claim confirmed within the individual small-claims limit.`
      : `${amountText} claim exceeds the individual small-claims limit of ${currency.format(eligibility.limit)}.`,
    source: `Source: ${eligibility.citation} — individual limit ${currency.format(eligibility.limit)}`,
    quote: `"${eligibility.statuteText}"`,
  };
}
