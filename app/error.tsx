"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main>
      <div className="intake-hero">
        <div className="eyebrow" style={{ color: "var(--danger)" }}>
          Something went wrong
        </div>
        <h1 className="intake-title">That didn&rsquo;t work — nothing was lost.</h1>
        <p className="intake-sub">
          This is a bug in the app, not a problem with your claim or anything you entered.
          Nothing is filed or saved automatically, so there&rsquo;s nothing to undo. Try again, or
          head back and start over.
        </p>
        <div className="landing-cta-row">
          <button className="btn btn-primary btn-lg" type="button" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="link-quiet">
            Back to Recourse
          </Link>
        </div>
      </div>
    </main>
  );
}
