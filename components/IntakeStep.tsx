"use client";

import type { ScreeningResult } from "@/lib/types";

const MAX_LEN = 2000;

export default function IntakeStep({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  screeningWarning,
  onContinueAnyway,
  onDismissWarning,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  screeningWarning: ScreeningResult | null;
  onContinueAnyway: () => void;
  onDismissWarning: () => void;
}) {
  return (
    <main>
      <div className="intake-hero">
        <div className="eyebrow">Self-help filing assistant — security deposit claims</div>
        <h1 className="intake-title">
          Tell us what happened. We check it against the real law before anything else does.
        </h1>
        <p className="intake-sub">
          You don&rsquo;t need a lawyer for small claims court — California built it that way on
          purpose. Describe your situation in your own words, and we&rsquo;ll confirm every fact,
          every dollar amount, and every eligibility rule against the{" "}
          <strong>actual statute and the actual court form</strong> before you see a draft.
        </p>
      </div>

      <div className="intake-form">
        <div className="intake-form-head">
          <span className="label">Describe your situation</span>
          <span className="charcount">
            {value.length} / {MAX_LEN}
          </span>
        </div>
        <textarea
          className="pad"
          maxLength={MAX_LEN}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="My landlord kept my $1,500 deposit and won't explain why. It's been 3 months since I moved out and I've asked twice in writing."
        />
        <div className="intake-form-foot">
          <span className="privacy-note">
            Nothing is filed or submitted anywhere until you download it yourself.
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              type="button"
              disabled={value.trim().length === 0 || loading}
              onClick={onSubmit}
            >
              {loading ? "Checking against the statute…" : "Check my case →"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="demo-note" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {screeningWarning && (
        <div
          className="trust-strip"
          style={
            screeningWarning.higherStakesFlag
              ? { background: "var(--danger-soft)", borderColor: "var(--danger)" }
              : { background: "var(--seal-soft)", borderColor: "var(--seal-line)" }
          }
        >
          <span
            className="icon"
            style={
              screeningWarning.higherStakesFlag
                ? { borderColor: "var(--danger)", color: "var(--danger)" }
                : { borderColor: "var(--seal)", color: "var(--seal)" }
            }
          >
            !
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {screeningWarning.higherStakesFlag
                ? "This may need more than a small claims form."
                : "This doesn't look like a security deposit dispute."}
            </p>
            <p>{screeningWarning.note} This tool only checks security deposit claims against the real statute — for anything else, the grounding it does won&rsquo;t apply.</p>
            {screeningWarning.higherStakesFlag && (
              <p style={{ marginTop: 6 }}>
                If this involves an active eviction, being locked out, or your safety, consider{" "}
                <a href="https://courts.ca.gov/selfhelp" target="_blank" rel="noreferrer">
                  courts.ca.gov/selfhelp
                </a>{" "}
                or a local legal aid organization instead — they can help with situations this tool
                isn&rsquo;t built for.
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={onDismissWarning}
                style={{ width: "auto", fontSize: 13, padding: "8px 14px" }}
              >
                Edit my description
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={onContinueAnyway}
                style={{ width: "auto", fontSize: 13, padding: "8px 14px" }}
              >
                This is a deposit dispute — continue anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="steps">
        <div className="step">
          <span className="num">01</span>
          <div className="step-label">Extract the facts</div>
          <div className="step-detail">Amount, parties, dates, pulled from your words — shown back to you to confirm.</div>
        </div>
        <div className="step">
          <span className="num">02</span>
          <div className="step-label">Check eligibility</div>
          <div className="step-detail">Computed in code against the actual CCP §116.221 text — not asked of the AI.</div>
        </div>
        <div className="step">
          <span className="num">03</span>
          <div className="step-label">Draft the real form</div>
          <div className="step-detail">Populates the actual SC-100, not a document that just looks official.</div>
        </div>
        <div className="step">
          <span className="num">04</span>
          <div className="step-label">Self-verify</div>
          <div className="step-detail">A second pass checks every claim against your words and the statute.</div>
        </div>
        <div className="step">
          <span className="num">05</span>
          <div className="step-label">You download it</div>
          <div className="step-detail">Filled PDF plus a report showing the source for every line.</div>
        </div>
      </div>

      <div className="trust-strip">
        <span className="icon">i</span>
        <p>
          This isn&rsquo;t a lawyer and isn&rsquo;t legal advice. It&rsquo;s a way to check your
          facts against the real rule before you spend a filing fee.
        </p>
      </div>
    </main>
  );
}
