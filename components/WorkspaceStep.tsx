"use client";

import { useMemo, useState } from "react";
import type { ClaimFacts, Eligibility, GroundingSource } from "@/lib/types";
import { EXAMPLE_REPORT } from "@/lib/mock-data";
import { CCP_116_221 } from "@/lib/grounding/ccp-116-221";
import { buildEligibilityReportItem, currency } from "@/lib/report";
import ConfigPanel from "./ConfigPanel";
import FormPreview from "./FormPreview";
import GroundingReport from "./GroundingReport";

export default function WorkspaceStep({
  facts,
  setFacts,
  onBack,
}: {
  facts: ClaimFacts;
  setFacts: (facts: ClaimFacts) => void;
  onBack: () => void;
}) {
  const [customSources, setCustomSources] = useState<(GroundingSource & { active: boolean })[]>([]);

  function addSource(source: GroundingSource) {
    setCustomSources((prev) => [...prev, { ...source, active: true }]);
  }
  function removeSource(id: string) {
    setCustomSources((prev) => prev.filter((s) => s.id !== id));
  }
  function toggleSource(id: string) {
    setCustomSources((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  // Eligibility is derived live from the editable amount field, checked
  // against the retrieved CCP §116.221 text — recomputes as soon as the
  // claim details are edited, so "Recheck against sources" is redundant
  // for this one fact (kept as a no-op affordance for the still-unwired
  // self-verification pass over the rest of the claim).
  const eligibility: Eligibility = useMemo(() => {
    const amountNumber = Number(facts.amount.replace(/[^0-9.]/g, ""));
    const hasAmount = Number.isFinite(amountNumber) && amountNumber > 0;
    return {
      eligible: hasAmount && amountNumber <= CCP_116_221.individualLimit,
      amountNumber: hasAmount ? amountNumber : null,
      limit: CCP_116_221.individualLimit,
      citation: CCP_116_221.citation,
      sourceUrl: CCP_116_221.sourceUrl,
      statuteText: CCP_116_221.text,
    };
  }, [facts.amount]);

  const reportItems = useMemo(() => {
    const eligibilityItem = buildEligibilityReportItem(eligibility);
    return EXAMPLE_REPORT.map((item) => (item.tag === "5" ? eligibilityItem : item));
  }, [eligibility]);

  function recheck() {
    // Placeholder: wires up to a real self-verification pass over the rest
    // of the claim (plaintiff/defendant/basis provenance) once that's built.
    // Eligibility above is already live — see the comment on `eligibility`.
  }

  return (
    <main>
      <div className="result-head">
        <div>
          <h1 className="result-title">Your filing, checked line by line</h1>
          <p className="result-sub">
            Every fact below is traced to something you said or to the retrieved statute and form
            text — not generated from memory.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <span className={`status-pill ${eligibility.eligible ? "" : "status-ineligible"}`}>
            <span className="dot" />
            {eligibility.amountNumber === null
              ? "Enter an amount to check eligibility"
              : eligibility.eligible
                ? `Eligible — within the ${currency.format(eligibility.limit)} individual limit`
                : `Exceeds the ${currency.format(eligibility.limit)} individual limit`}
          </span>
          <div className="result-actions">
            <button className="btn btn-ghost" type="button" onClick={onBack}>
              ← Edit my story
            </button>
            <button className="btn btn-primary" type="button" disabled>
              Download SC-100 (PDF)
            </button>
          </div>
        </div>
      </div>

      <div className="demo-note">
        Fact extraction and eligibility are live, grounded against {CCP_116_221.citation}. Plaintiff
        name, courthouse reason, and self-verification of the rest of the claim aren&rsquo;t wired
        up yet — those fields stay editable in the meantime.
      </div>

      <div className="workspace-layout">
        <ConfigPanel
          facts={facts}
          onFactsChange={setFacts}
          customSources={customSources}
          onAddSource={addSource}
          onRemoveSource={removeSource}
          onToggleSource={toggleSource}
          onRecheck={recheck}
        />
        <div>
          <FormPreview facts={facts} />
          <GroundingReport items={reportItems} />
        </div>
      </div>
    </main>
  );
}
