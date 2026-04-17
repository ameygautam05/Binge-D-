import { SiteNav } from "@/components/nav";
import { RealtimeProfileClient } from "@/components/realtime-profile-client";

export default function FriendProfilePage({ params }) {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <RealtimeProfileClient slug={params.id} />
      </section>
    </main>
  );
}
