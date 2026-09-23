import type { ReportItem } from "@/lib/types";

export default function GroundingReport({ items }: { items: ReportItem[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label">Grounding report</span>
        <span className="label">{items.length} claims checked</span>
      </div>
      <ul className="report-list">
        {items.map((item, i) => (
          <li className="report-item" key={i}>
            <span className="tag">{item.tag}</span>
            <div className="report-body">
              <div className="report-claim">{item.claim}</div>
              <div className="report-source">{item.source}</div>
              {item.quote && <div className="report-quote">{item.quote}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
