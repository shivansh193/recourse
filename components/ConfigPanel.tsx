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
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  function field(key: keyof ClaimFacts, value: string) {
    onFactsChange({ ...facts, [key]: value });
  }

  function boolField(key: "demandMade" | "periodPassed" | "itemizationReceived", value: boolean) {
    onFactsChange({ ...facts, [key]: value });
  }

  async function handleAddSource() {
    const text = pasted.trim();
    if (!text) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch("/api/parse-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't read that source.");
      const parsed = data.parsed as { limit: number | null; citation: string; formName: string };

      const name = parsed.formName || parsed.citation || text.slice(0, 48) + (text.length > 48 ? "…" : "");
      const meta =
        parsed.limit !== null
          ? `Limit $${parsed.limit.toLocaleString()}${parsed.citation ? ` — ${parsed.citation}` : ""} — unverified`
          : "No dollar limit found in pasted text — unverified";

      onAddSource({ id: `custom-${Date.now()}`, name, meta, verified: false, parsed });
      setPasted("");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Couldn't read that source.");
    } finally {
      setParsing(false);
    }
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
          <div className="field-row">
            <div className="fr-label">
              <span className="tag">3</span> Courthouse reason (item 5 on the form)
            </div>
            <input
              type="text"
              placeholder="e.g. Defendant's business is in this county"
              value={facts.courthouseReason}
              onChange={(e) => field("courthouseReason", e.target.value)}
            />
          </div>
          <div className="field-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <input
                type="checkbox"
                checked={facts.demandMade}
                onChange={(e) => boolField("demandMade", e.target.checked)}
              />
              <span className="tag">6</span> Asked defendant to pay first (item 4)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <input
                type="checkbox"
                checked={facts.periodPassed}
                onChange={(e) => boolField("periodPassed", e.target.checked)}
              />
              <span className="tag">7</span> More than 21 days since move-out
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <input
                type="checkbox"
                checked={facts.itemizationReceived}
                onChange={(e) => boolField("itemizationReceived", e.target.checked)}
              />
              <span className="tag">8</span> Received an itemized statement
            </label>
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
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={handleAddSource}
                disabled={!pasted.trim() || parsing}
              >
                {parsing ? "Reading source…" : "Add as source"}
              </button>
              {parseError && (
                <p style={{ color: "var(--danger)", marginTop: 8, marginBottom: 0 }}>{parseError}</p>
              )}
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
}
