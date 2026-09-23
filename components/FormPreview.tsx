import type { ClaimFacts } from "@/lib/types";

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
            4a. Reason claim is filed at this courthouse <span className="tag">3</span>
          </div>
          <div className="fv">{facts.courthouseReason || "—"}</div>
        </div>
        <div className="form-field">
          <div className="fl">
            5. Why does defendant owe you money? <span className="tag">4</span>
          </div>
          <div className="fv" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
            {facts.basis || "—"}
          </div>
        </div>

        <div className="form-checkbox-row">
          <div className={`form-checkbox ${facts.demandMade ? "checked" : ""}`}>
            <span className="box" />
            Demand made
          </div>
          <div className={`form-checkbox ${facts.periodPassed ? "checked" : ""}`}>
            <span className="box" />
            21-day period passed
          </div>
          <div className={`form-checkbox ${facts.itemizationReceived ? "checked" : ""}`}>
            <span className="box" />
            Itemization received
          </div>
        </div>

        <div className="form-amount">
          <span className="amt-label">
            Amount claimed <span className="tag">5</span>
          </span>
          <span className="amt">{facts.amount || "—"}</span>
        </div>
      </div>
    </div>
  );
}
