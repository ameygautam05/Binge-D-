import { SiteNav } from "@/components/nav";
import { SocialBrowserClient } from "@/components/social-browser-client";

export default function SocialPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <SocialBrowserClient />
      </section>
    </main>
  );
}
