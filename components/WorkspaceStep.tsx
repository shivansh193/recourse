"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClaimFacts, Eligibility, GroundingSource, ReportItem, VerificationResult } from "@/lib/types";
import { CCP_116_221 } from "@/lib/grounding/ccp-116-221";
import { buildEligibilityReportItem, buildSummaryReportItem, buildVerificationReportItems, currency } from "@/lib/report";
import ConfigPanel from "./ConfigPanel";
import FormPreview from "./FormPreview";
import GroundingReport from "./GroundingReport";

export default function WorkspaceStep({
  facts,
  setFacts,
  intakeText,
  onBack,
}: {
  facts: ClaimFacts;
  setFacts: (facts: ClaimFacts) => void;
  intakeText: string;
  onBack: () => void;
}) {
  const [customSources, setCustomSources] = useState<(GroundingSource & { active: boolean })[]>([]);
  const [verification, setVerification] = useState<VerificationResult[] | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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
  // against the retrieved CCP §116.221 text.
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

  // Guards against an earlier, slower request (e.g. the initial
  // verification-on-arrival call) resolving after a later one — like a
  // manual "Recheck" — and clobbering its result with stale data.
  const requestIdRef = useRef(0);

  const runVerification = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeText, facts }),
      });
      const data = await res.json();
      if (requestId !== requestIdRef.current) return; // superseded by a newer request
      if (!res.ok) throw new Error(data?.error || "Self-verification failed.");
      setVerification(data.results as VerificationResult[]);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setVerifyError(err instanceof Error ? err.message : "Self-verification failed.");
    } finally {
      if (requestId === requestIdRef.current) setVerifying(false);
    }
  }, [intakeText, facts]);

  useEffect(() => {
    // Only re-run automatically on arrival; edits use the explicit button below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportItems: ReportItem[] = useMemo(() => {
    const eligibilityItem = buildEligibilityReportItem(eligibility);
    if (!verification) return [eligibilityItem];
    const verificationItems = buildVerificationReportItems(verification);
    const summaryItem = buildSummaryReportItem(verification);
    return [...verificationItems, eligibilityItem, summaryItem].sort((a, b) => {
      const order = ["2", "4", "5", "6", "7", "8"];
      const ai = order.indexOf(a.tag);
      const bi = order.indexOf(b.tag);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [eligibility, verification]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SC-100-recourse-draft.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Surfaced via the disabled/label state below is enough for now —
      // a toast/error banner is future polish.
    } finally {
      setDownloading(false);
    }
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
            <button className="btn btn-primary" type="button" onClick={handleDownload} disabled={downloading}>
              {downloading ? "Preparing PDF…" : "Download SC-100 (PDF)"}
            </button>
          </div>
        </div>
      </div>

      <div className="demo-note">
        Fact extraction, eligibility, and self-verification are live. Plaintiff name and
        courthouse reason aren&rsquo;t auto-filled — neither is inferable from your story, so
        they&rsquo;re left for you to enter.
        {verifyError && (
          <>
            {" "}
            <span style={{ color: "var(--danger)" }}>{verifyError}</span>
          </>
        )}
      </div>

      <div className="workspace-layout">
        <ConfigPanel
          facts={facts}
          onFactsChange={setFacts}
          customSources={customSources}
          onAddSource={addSource}
          onRemoveSource={removeSource}
          onToggleSource={toggleSource}
          onRecheck={runVerification}
        />
        <div>
          <FormPreview facts={facts} />
          <GroundingReport items={reportItems} loading={verifying} />
        </div>
      </div>
    </main>
  );
}
