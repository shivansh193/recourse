"use client";

import { useState } from "react";
import IntakeStep from "./IntakeStep";
import WorkspaceStep from "./WorkspaceStep";
import { EMPTY_FACTS, type ClaimFacts } from "@/lib/types";
import { EXAMPLE_FACTS, EXAMPLE_INTAKE_TEXT } from "@/lib/mock-data";

export default function FileWizard({ startAtWorkspace }: { startAtWorkspace: boolean }) {
  const [step, setStep] = useState<"intake" | "workspace">(startAtWorkspace ? "workspace" : "intake");
  const [claimText, setClaimText] = useState(startAtWorkspace ? EXAMPLE_INTAKE_TEXT : "");
  const [facts, setFacts] = useState<ClaimFacts>(startAtWorkspace ? EXAMPLE_FACTS : EMPTY_FACTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
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
      setFacts(data.facts as ClaimFacts);
      setStep("workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong checking your case.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("intake");
  }

  if (step === "intake") {
    return (
      <IntakeStep
        value={claimText}
        onChange={setClaimText}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    );
  }
  return <WorkspaceStep facts={facts} setFacts={setFacts} intakeText={claimText} onBack={handleBack} />;
}
