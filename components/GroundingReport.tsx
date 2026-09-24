import type { ReportItem } from "@/lib/types";

export default function GroundingReport({ items, loading }: { items: ReportItem[]; loading?: boolean }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label">Grounding report</span>
        <span className="label">{loading ? "Checking…" : `${items.length} claims checked`}</span>
      </div>
      <ul className="report-list">
        {items.map((item, i) => {
          const flagged = item.supported === false;
          return (
            <li
              className="report-item"
              key={i}
              style={flagged ? { background: "var(--danger-soft)" } : undefined}
            >
              <span className="tag" style={flagged ? { color: "var(--danger)", borderColor: "var(--danger)" } : undefined}>
                {item.tag}
              </span>
              <div className="report-body">
                <div className="report-claim">{item.claim}</div>
                <div className="report-source">{item.source}</div>
                {item.quote && <div className="report-quote">{item.quote}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
