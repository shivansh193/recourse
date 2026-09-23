import Link from "next/link";

export default function TopBar() {
  return (
    <div className="topbar">
      <Link href="/" className="wordmark">
        <span className="mark">R</span> Recourse
      </Link>
      <span className="jurisdiction-tag">California · Small claims</span>
    </div>
  );
}
