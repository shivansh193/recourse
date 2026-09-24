"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClaimFacts, Eligibility, GroundingSource, ReportItem, VerificationResult } from "@/lib/types";
import { CCP_116_221 } from "@/lib/grounding/ccp-116-221";
import { calculateFilingFee } from "@/lib/grounding/ccp-116-230";
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
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  function addSource(source: GroundingSource) {
    setCustomSources((prev) => [...prev, { ...source, active: true }]);
  }
  function removeSource(id: string) {
    setCustomSources((prev) => prev.filter((s) => s.id !== id));
  }
  function toggleSource(id: string) {
    setCustomSources((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  // Eligibility is derived live from the editable amount field. By default
  // it's checked against the retrieved CCP §116.221 text. If the user has
  // an active pasted jurisdiction source with a parsed dollar limit, that
  // takes over instead — clearly marked unverified, since it wasn't
  // retrieved from an authoritative source the way CCP §116.221 was.
  const activeCustomLimit = useMemo(() => {
    const withLimit = customSources.filter((s) => s.active && s.parsed?.limit != null);
    return withLimit.length > 0 ? withLimit[withLimit.length - 1] : null;
  }, [customSources]);

  const eligibility: Eligibility = useMemo(() => {
    const amountNumber = Number(facts.amount.replace(/[^0-9.]/g, ""));
    const hasAmount = Number.isFinite(amountNumber) && amountNumber > 0;

    if (activeCustomLimit?.parsed?.limit != null) {
      const limit = activeCustomLimit.parsed.limit;
      return {
        eligible: hasAmount && amountNumber <= limit,
        amountNumber: hasAmount ? amountNumber : null,
        limit,
        citation: activeCustomLimit.parsed.citation || activeCustomLimit.name,
        sourceUrl: "",
        statuteText: "",
        verified: false,
      };
    }

    return {
      eligible: hasAmount && amountNumber <= CCP_116_221.individualLimit,
      amountNumber: hasAmount ? amountNumber : null,
      limit: CCP_116_221.individualLimit,
      citation: CCP_116_221.citation,
      sourceUrl: CCP_116_221.sourceUrl,
      statuteText: CCP_116_221.text,
      verified: true,
    };
  }, [facts.amount, activeCustomLimit]);

  const filingFee = useMemo(() => {
    if (eligibility.amountNumber === null) return null;
    return calculateFilingFee(eligibility.amountNumber);
  }, [eligibility.amountNumber]);

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
    if (eligibility.amountNumber !== null && !eligibility.eligible) {
      const proceed = window.confirm(
        `This claim exceeds the ${currency.format(eligibility.limit)} individual small-claims limit. ` +
          `The court may reject it at this amount. Download the draft anyway?`
      );
      if (!proceed) return;
    }

    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "PDF generation failed. Try again.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SC-100-recourse-draft.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "PDF generation failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadReport() {
    setDownloadingReport(true);
    setReportError(null);
    try {
      const res = await fetch("/api/generate-report-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts, eligibility, filingFee, reportItems }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Report generation failed. Try again.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recourse-grounding-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Report generation failed. Try again.");
    } finally {
      setDownloadingReport(false);
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
            {!eligibility.verified && " (unverified source)"}
          </span>
          {filingFee && (
            <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              Filing fee: {currency.format(filingFee.fee)} (CCP §116.230, claims {filingFee.tierLabel})
            </span>
          )}
          <div className="result-actions">
            <button className="btn btn-ghost" type="button" onClick={onBack}>
              ← Edit my story
            </button>
            <button className="btn btn-primary" type="button" onClick={handleDownload} disabled={downloading}>
              {downloading ? "Preparing PDF…" : "Download SC-100 (PDF)"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleDownloadReport}
              disabled={downloadingReport}
              title="A standalone copy of the grounding report below, for review without opening the app"
            >
              {downloadingReport ? "Preparing…" : "Download grounding report"}
            </button>
            {verification === null && !verifying && (
              <span style={{ fontSize: 11, color: "var(--ink-faint)", maxWidth: 220, textAlign: "right" }}>
                Self-verification hasn&rsquo;t completed — review the grounding report before filing.
              </span>
            )}
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
        {downloadError && (
          <>
            {" "}
            <span style={{ color: "var(--danger)" }}>{downloadError}</span>
          </>
        )}
        {reportError && (
          <>
            {" "}
            <span style={{ color: "var(--danger)" }}>{reportError}</span>
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
