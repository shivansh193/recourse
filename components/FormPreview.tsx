import type { ClaimFacts } from "@/lib/types";

// Item numbers below match the real SC-100's actual layout (verified
// directly against the form while building lib/pdf/fill-sc100.ts): 1
// plaintiff, 2 defendant, 3 amount claimed, 3a basis, 4 demand-made
// Yes/No, 5 courthouse reason. periodPassed and itemizationReceived
// aren't separate checkboxes on the real form — they're facts the
// self-verification pass checks and the basis narrative should reflect,
// not fields this preview can claim are "on the form," so they're left
// out of this panel rather than shown as if they were.
export default function FormPreview({ facts }: { facts: ClaimFacts }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label">Filled form preview</span>
        <span className="label">SC-100</span>
      </div>
      <div className="form-doc">
        <div className="form-doc-top">
          <div className="title">Plaintiff&rsquo;s Claim and ORDER to Go to Small Claims Court</div>
          <div className="code">
            Judicial Council of California
            <br />
            Form SC-100
          </div>
        </div>

        <div className="form-field">
          <div className="fl">
            1. Plaintiff (you) <span className="tag">1</span>
          </div>
          <div className="fv">{facts.plaintiff || "—"}</div>
        </div>
        <div className="form-field">
          <div className="fl">
            2. Defendant <span className="tag">2</span>
          </div>
          <div className="fv">{facts.defendant || "—"}</div>
        </div>
        <div className="form-field">
          <div className="fl">
            5. Why are you filing at this courthouse? <span className="tag">3</span>
          </div>
          <div className="fv">{facts.courthouseReason || "—"}</div>
        </div>
        <div className="form-field">
          <div className="fl">
            3a. Why does defendant owe you money? <span className="tag">4</span>
          </div>
          <div className="fv" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
            {facts.basis || "—"}
          </div>
        </div>

        <div className="form-checkbox-row">
          <div className={`form-checkbox ${facts.demandMade ? "checked" : ""}`}>
            <span className="box" />
            4. Asked defendant to pay first <span className="tag">6</span>
          </div>
        </div>

        <div className="form-amount">
          <span className="amt-label">
            3. Amount claimed <span className="tag">5</span>
          </span>
          <span className="amt">{facts.amount || "—"}</span>
        </div>
      </div>
    </div>
  );
}
