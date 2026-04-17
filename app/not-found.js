import Link from "next/link";
import { SiteNav } from "@/components/nav";

export default function NotFoundPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "56px 0" }}>
        <div className="glass page-panel pixel-frame">
          <div className="eyebrow">404 signal loss</div>
          <h1 className="section-title display" style={{ margin: "16px 0" }}>
            this profile dipped
            <br />
            off the grid
          </h1>
          <p className="section-copy">The page you were looking for is not in this version of the binge-d universe.</p>
          <div className="cta-row" style={{ marginTop: "20px" }}>
            <Link href="/" className="button">
              Go home
            </Link>
            <Link href="/social" className="ghost-button">
              Open social feed
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
