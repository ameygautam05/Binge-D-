import { notFound } from "next/navigation";
import { SiteNav } from "@/components/nav";
import { ProfileView } from "@/components/profile-view";
import { getFriendProfile, getSocialGraph } from "@/lib/social-db";

export default async function FriendProfilePage({ params }) {
  const friend = await getFriendProfile(params.id);
  const social = await getSocialGraph();

  if (!friend) {
    notFound();
  }

  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <ProfileView friend={friend} source={social.source} />
      </section>
    </main>
  );
}
