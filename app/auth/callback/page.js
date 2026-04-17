import Link from "next/link";
import { SiteNav } from "@/components/nav";

export default function AuthCallbackPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "56px 0" }}>
        <div className="glass page-panel pixel-frame">
          <div className="eyebrow">auth return</div>
          <h1 className="section-title display" style={{ margin: "16px 0" }}>
            inbox tap received
          </h1>
          <p className="section-copy">
            If Supabase is configured on your deployment, the magic-link session will hydrate here. This placeholder page
            is ready for that callback during your test run.
          </p>
          <div className="cta-row" style={{ marginTop: "20px" }}>
            <Link href="/" className="button">
              Back to binge-d
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
