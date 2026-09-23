"use client";

import { useState } from "react";
import type { ClaimFacts, GroundingSource } from "@/lib/types";
import { BUILT_IN_SOURCES, RESEARCH_PROMPT } from "@/lib/mock-data";

export default function ConfigPanel({
  facts,
  onFactsChange,
  customSources,
  onAddSource,
  onRemoveSource,
  onToggleSource,
  onRecheck,
}: {
  facts: ClaimFacts;
  onFactsChange: (facts: ClaimFacts) => void;
  customSources: (GroundingSource & { active: boolean })[];
  onAddSource: (source: GroundingSource) => void;
  onRemoveSource: (id: string) => void;
  onToggleSource: (id: string) => void;
  onRecheck: () => void;
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [pasted, setPasted] = useState("");

  function field(key: keyof ClaimFacts, value: string) {
    onFactsChange({ ...facts, [key]: value });
  }

  function handleAddSource() {
    if (!pasted.trim()) return;
    onAddSource({
      id: `custom-${Date.now()}`,
      name: pasted.trim().slice(0, 48) + (pasted.trim().length > 48 ? "…" : ""),
      meta: "Pasted from external AI — not verified by Recourse",
      verified: false,
    });
    setPasted("");
  }

  return (
    <aside className="config-panel">
      <div className="config-card">
        <div className="config-card-head">
          <span className="label">Claim details</span>
        </div>
        <div className="config-card-body">
          <div className="field-row">
            <div className="fr-label">
              <span className="tag">1</span> Plaintiff (you)
            </div>
            <input
              type="text"
              value={facts.plaintiff}
              onChange={(e) => field("plaintiff", e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="fr-label">
              <span className="tag">2</span> Defendant
            </div>
            <input
              type="text"
              value={facts.defendant}
              onChange={(e) => field("defendant", e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="fr-label">
              <span className="tag">5</span> Amount claimed
            </div>
            <input type="text" value={facts.amount} onChange={(e) => field("amount", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="fr-label">
              <span className="tag">4</span> Basis for claim
            </div>
            <textarea value={facts.basis} onChange={(e) => field("basis", e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" type="button" onClick={onRecheck} style={{ marginTop: 4 }}>
            Recheck against sources
          </button>
        </div>
      </div>

      <div className="config-card">
        <div className="config-card-head">
          <span className="label">Grounding sources</span>
          <span className="src-meta">{BUILT_IN_SOURCES.length + customSources.length} total</span>
        </div>
        <div className="config-card-body">
          {BUILT_IN_SOURCES.map((s) => (
            <div className="source-row" key={s.id}>
              <div style={{ flex: 1 }}>
                <div className="src-name">{s.name}</div>
                <div className="src-meta">{s.meta}</div>
              </div>
              <span className="badge badge-verified">Built-in</span>
            </div>
          ))}

          {customSources.map((s) => (
            <div className="source-row" key={s.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="src-name">{s.name}</div>
                <div className="src-meta">{s.meta}</div>
              </div>
              <span className="badge badge-unverified">Unverified</span>
              <label className="switch" title={s.active ? "Active" : "Inactive"}>
                <input type="checkbox" checked={s.active} onChange={() => onToggleSource(s.id)} />
                <span className="slider" />
              </label>
              <button
                className="btn-ghost"
                type="button"
                aria-label={`Remove ${s.name}`}
                onClick={() => onRemoveSource(s.id)}
                style={{ border: "none", background: "none", color: "var(--ink-faint)", cursor: "pointer", padding: 2, fontSize: 14 }}
              >
                ×
              </button>
            </div>
          ))}

          <details className="add-jurisdiction" style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <summary>Add jurisdiction knowledge</summary>
            <div className="add-jurisdiction-body">
              <p>
                Filing outside California? Generate a research prompt, run it in Claude or
                ChatGPT, then paste the answer back here as a source. It&rsquo;s flagged as
                unverified and cited separately from the built-in California sources.
              </p>
              <button
                className="btn btn-outline btn-sm"
                type="button"
                onClick={() => setPromptOpen((v) => !v)}
                style={{ marginBottom: promptOpen ? 10 : 0 }}
              >
                {promptOpen ? "Hide research prompt" : "Generate research prompt"}
              </button>
              {promptOpen && <div className="prompt-box">{RESEARCH_PROMPT}</div>}

              <div className="field-row" style={{ marginTop: 10, marginBottom: 8 }}>
                <textarea
                  placeholder="Paste the AI's response here…"
                  style={{ minHeight: 72 }}
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={handleAddSource} disabled={!pasted.trim()}>
                Add as source
              </button>
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
}
