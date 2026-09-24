import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="landing-hero">
        <div className="eyebrow">Access to justice · Security deposit claims</div>
        <h1 className="landing-title">
          Small claims court was built so you wouldn&rsquo;t need a lawyer. The forms weren&rsquo;t.
        </h1>
        <p className="landing-sub">
          If your landlord kept your deposit, you&rsquo;re allowed to ask for it back yourself
          — no attorney required, that&rsquo;s how California set up small claims court. What&rsquo;s
          hard is knowing whether you qualify, what to write, and whether you&rsquo;re about to
          spend a filing fee on a claim that gets thrown out. Recourse checks your facts against
          the real statute and fills out the real court form, and shows you exactly where every
          line came from.
        </p>
        <div className="landing-cta-row">
          <Link href="/file" className="btn btn-primary btn-lg">
            Start my claim →
          </Link>
          <Link href="/file?example=1" className="link-quiet">
            See a grounded filing first
          </Link>
        </div>
      </div>

      <div className="pillars">
        <div className="pillar">
          <div className="pillar-label">01 — Grounded, not remembered</div>
          <h3>Reads the actual statute</h3>
          <p>
            The $12,500 small-claims limit comes from the actual text of CCP §116.221, checked in
            code against what you claim — not asked of the AI, which is exactly where a generic
            assistant gets confidently wrong about the law.
          </p>
        </div>
        <div className="pillar">
          <div className="pillar-label">02 — Real, not a lookalike</div>
          <h3>Fills the real SC-100</h3>
          <p>
            You get California&rsquo;s actual Judicial Council form, populated with your facts —
            the same document the clerk expects, not a document that just resembles one.
          </p>
        </div>
        <div className="pillar">
          <div className="pillar-label">03 — Checked, not trusted blindly</div>
          <h3>Self-verifies before you see it</h3>
          <p>
            A second pass re-checks every fact on the draft against what you actually said and
            against the retrieved statute — catching our own mistakes before they reach you.
          </p>
        </div>
      </div>

      <div className="demo-peek">
        <div className="side">
          <div className="side-label">What you said</div>
          <div className="demo-line">
            &ldquo;My landlord kept my $1,500 deposit and won&rsquo;t explain why. It&rsquo;s been
            3 months since I moved out.&rdquo;
          </div>
        </div>
        <div className="side">
          <div className="side-label">What ends up on the form — traced</div>
          <div className="demo-line">
            <span className="tag">5</span> Amount claimed: $1,500.00
          </div>
          <div className="demo-line" style={{ borderBottom: "none", marginBottom: 0 }}>
            <span className="tag">4</span> Basis: 21-day return deadline, Civ. Code §1950.5(h)(1)
          </div>
        </div>
      </div>

      <div className="landing-footer-cta">
        <h2>You don&rsquo;t need to know the law to check it.</h2>
        <p>Describe what happened in plain language — takes about two minutes.</p>
        <Link href="/file" className="btn btn-primary btn-lg">
          Start my claim →
        </Link>
      </div>

      <footer className="strip">
        <span>Recourse — built for LexHack 2026</span>
        <span>California · Security deposit claims</span>
      </footer>
    </main>
  );
}
