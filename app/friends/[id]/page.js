import { SiteNav } from "@/components/nav";
import { ProfileBrowserClient } from "@/components/profile-browser-client";

export default function FriendProfilePage({ params }) {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <ProfileBrowserClient slug={params.id} />
      </section>
    </main>
  );
}
