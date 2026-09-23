export type ClaimFacts = {
  plaintiff: string;
  defendant: string;
  courthouseReason: string;
  basis: string;
  amount: string;
  demandMade: boolean;
  periodPassed: boolean;
  itemizationReceived: boolean;
};

export type GroundingSource = {
  id: string;
  name: string;
  meta: string;
  verified: boolean;
};

export type ReportItem = {
  tag: string;
  claim: string;
  source: string;
  quote?: string;
};

export type Eligibility = {
  eligible: boolean;
  amountNumber: number | null;
  limit: number;
  citation: string;
  sourceUrl: string;
  statuteText: string;
};

export const EMPTY_FACTS: ClaimFacts = {
  plaintiff: "",
  defendant: "",
  courthouseReason: "",
  basis: "",
  amount: "",
  demandMade: false,
  periodPassed: false,
  itemizationReceived: false,
};
