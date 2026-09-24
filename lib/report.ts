import type { Eligibility, ReportItem, VerificationField, VerificationResult } from "./types";

export const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// The eligibility line: computed in code against the retrieved statute
// text, not asserted by the model.
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

const FIELD_TAG: Record<VerificationField, string> = {
  defendant: "2",
  basis: "4",
  demandMade: "6",
  periodPassed: "7",
  itemizationReceived: "8",
};

const FIELD_LABEL: Record<VerificationField, string> = {
  defendant: "Defendant name",
  basis: "Basis for claim",
  demandMade: "“Asked for it back” claim",
  periodPassed: "21-day period claim",
  itemizationReceived: "Itemization claim",
};

// Turns the self-verification pass's per-field results into report items —
// each traced to the specific part of the intake text (or its absence)
// that the model pointed to, not a static description of what should be
// true in general.
export function buildVerificationReportItems(results: VerificationResult[]): ReportItem[] {
  return results.map((r) => ({
    tag: FIELD_TAG[r.field],
    claim: r.supported
      ? `${FIELD_LABEL[r.field]}: supported by your intake text.`
      : `${FIELD_LABEL[r.field]}: not clearly supported by your intake text — review before filing.`,
    source: "Checked against: your intake text",
    quote: r.note,
    supported: r.supported,
  }));
}

export function buildSummaryReportItem(results: VerificationResult[]): ReportItem {
  const allSupported = results.every((r) => r.supported);
  return {
    tag: allSupported ? "✓" : "!",
    claim: allSupported
      ? "Self-verification pass: every drafted claim is supported by your intake text."
      : "Self-verification pass: at least one drafted claim was not clearly supported — flagged above.",
    source: `Checked against: your intake text (${results.length} facts)`,
    supported: allSupported,
  };
}
