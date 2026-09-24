"use client";

import { useState } from "react";
import IntakeStep from "./IntakeStep";
import WorkspaceStep from "./WorkspaceStep";
import { EMPTY_FACTS, type ClaimFacts, type ScreeningResult } from "@/lib/types";
import { EXAMPLE_FACTS, EXAMPLE_INTAKE_TEXT } from "@/lib/mock-data";

export default function FileWizard({ startAtWorkspace }: { startAtWorkspace: boolean }) {
  const [step, setStep] = useState<"intake" | "workspace">(startAtWorkspace ? "workspace" : "intake");
  const [claimText, setClaimText] = useState(startAtWorkspace ? EXAMPLE_INTAKE_TEXT : "");
  const [facts, setFacts] = useState<ClaimFacts>(startAtWorkspace ? EXAMPLE_FACTS : EMPTY_FACTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screeningWarning, setScreeningWarning] = useState<ScreeningResult | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setScreeningWarning(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: claimText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong checking your case.");
      }
      const screening = data.screening as ScreeningResult;
      setFacts(data.facts as ClaimFacts);
      if (!screening.isSecurityDepositClaim) {
        // Small claims is designed for a civil money dispute, not something
        // with housing or safety stakes — don't walk someone with an active
        // eviction or a safety issue into a tool that isn't built for it.
        // The screen can be wrong, so this warns rather than hard-blocks.
        setScreeningWarning(screening);
      } else {
        setStep("workspace");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong checking your case.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("intake");
  }

  function handleContinueAnyway() {
    setScreeningWarning(null);
    setStep("workspace");
  }

  if (step === "intake") {
    return (
      <IntakeStep
        value={claimText}
        onChange={setClaimText}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        screeningWarning={screeningWarning}
        onContinueAnyway={handleContinueAnyway}
        onDismissWarning={() => setScreeningWarning(null)}
      />
    );
  }
  return <WorkspaceStep facts={facts} setFacts={setFacts} intakeText={claimText} onBack={handleBack} />;
}
