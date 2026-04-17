import { SiteNav } from "@/components/nav";
import { RealtimeSocialApp } from "@/components/realtime-social-app";

export default function SocialPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <RealtimeSocialApp />
      </section>
    </main>
  );
}
