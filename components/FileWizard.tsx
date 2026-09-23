"use client";

import { useState } from "react";
import IntakeStep from "./IntakeStep";
import WorkspaceStep from "./WorkspaceStep";
import { EMPTY_FACTS, type ClaimFacts } from "@/lib/types";
import { EXAMPLE_FACTS } from "@/lib/mock-data";

export default function FileWizard({ startAtWorkspace }: { startAtWorkspace: boolean }) {
  const [step, setStep] = useState<"intake" | "workspace">(startAtWorkspace ? "workspace" : "intake");
  const [claimText, setClaimText] = useState("");
  const [facts, setFacts] = useState<ClaimFacts>(startAtWorkspace ? EXAMPLE_FACTS : EMPTY_FACTS);

  function handleSubmit() {
    // Placeholder shape until real fact extraction (Gemini) replaces it —
    // keeps the user's own words in the basis field, fills the rest with
    // the example so the workspace demonstrates the intended output.
    setFacts({ ...EXAMPLE_FACTS, basis: claimText });
    setStep("workspace");
  }

  function handleBack() {
    setStep("intake");
  }

  if (step === "intake") {
    return <IntakeStep value={claimText} onChange={setClaimText} onSubmit={handleSubmit} />;
  }
  return <WorkspaceStep facts={facts} setFacts={setFacts} onBack={handleBack} />;
}
