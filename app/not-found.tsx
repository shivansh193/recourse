import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="intake-hero">
        <div className="eyebrow">Page not found</div>
        <h1 className="intake-title">That page doesn&rsquo;t exist.</h1>
        <p className="intake-sub">
          Nothing&rsquo;s broken with your claim if you had one in progress — this is just an
          address that doesn&rsquo;t lead anywhere. Head back and pick up where you left off.
        </p>
        <div className="landing-cta-row">
          <Link href="/" className="btn btn-primary btn-lg">
            Back to Recourse
          </Link>
          <Link href="/file" className="link-quiet">
            Start a claim
          </Link>
        </div>
      </div>
    </main>
  );
}
