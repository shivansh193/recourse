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

export type ParsedJurisdiction = {
  limit: number | null;
  citation: string;
  formName: string;
};

export type GroundingSource = {
  id: string;
  name: string;
  meta: string;
  verified: boolean;
  parsed?: ParsedJurisdiction;
};

export type ReportItem = {
  tag: string;
  claim: string;
  source: string;
  quote?: string;
  supported?: boolean;
};

export type Eligibility = {
  eligible: boolean;
  amountNumber: number | null;
  limit: number;
  citation: string;
  sourceUrl: string;
  statuteText: string;
  verified: boolean;
};

export type ScreeningResult = {
  isSecurityDepositClaim: boolean;
  higherStakesFlag: boolean;
  note: string;
};

export type VerificationField = "defendant" | "basis" | "demandMade" | "periodPassed" | "itemizationReceived";

export type VerificationResult = {
  field: VerificationField;
  supported: boolean;
  note: string;
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
