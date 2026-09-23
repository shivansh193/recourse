"use client";

import { useState } from "react";
import type { ClaimFacts, GroundingSource } from "@/lib/types";
import { EXAMPLE_REPORT } from "@/lib/mock-data";
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
  function recheck() {
    // Placeholder: wires up to the real eligibility + self-verification
    // pipeline once fact extraction and the CCP §116.221 lookup are built.
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
          <span className="status-pill">
            <span className="dot" />
            Eligible — within the $12,500 individual limit
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
        Preview data — fact extraction and self-verification aren&rsquo;t wired up yet. The fields
        below are editable so you can see the intended shape of a real result.
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
          <GroundingReport items={EXAMPLE_REPORT} />
        </div>
      </div>
    </main>
  );
}
