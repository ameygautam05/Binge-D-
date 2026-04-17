import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { SiteNav } from "@/components/nav";
import { getSocialGraph } from "@/lib/social-db";

export default async function SocialPage() {
  const social = await getSocialGraph();

  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <div className="content-grid">
          <section className="glass page-panel pixel-frame">
            <div className="mini-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="eyebrow">friend-powered discovery</div>
                <h1 className="section-title display" style={{ marginTop: "16px" }}>
                  your social watch
                  <br />
                  <span style={{ color: "var(--pink)" }}>orbit is active</span>
                </h1>
                <p className="section-copy" style={{ marginTop: "16px" }}>
                  See what your friends are currently watching, what they have finished, and the exact notes they left on
                  movies, series, documentaries, podcasts, and standup specials.
                </p>
                <p className="hint" style={{ marginTop: "12px" }}>
                  {social.source === "supabase"
                    ? "Live social graph is connected to Supabase."
                    : "Fallback social graph is showing until Supabase keys are added."}
                </p>
              </div>
              <Link href="/discover" className="button">
                Run a new prediction
              </Link>
            </div>
          </section>

          <section className="split">
            <div className="glass page-panel pixel-frame">
              <div className="label pixel">What friends are watching</div>
              <div className="friend-stack" style={{ marginTop: "16px" }}>
                {social.friends.map((friend) => (
                  <Link href={`/friends/${friend.slug}`} key={friend.id} className="glass friend-card">
                    <div className="friend-head">
                      <div className="avatar">{friend.avatar}</div>
                      <div>
                        <strong>{friend.name}</strong>
                        <p className="muted" style={{ margin: "4px 0 0" }}>
                          now watching {(friend.currentlyWatching || []).map((item) => item.title).join(" + ") || "something new"}
                        </p>
                      </div>
                    </div>
                    <div className="inline-badges">
                      {(friend.taste || []).map((taste) => (
                        <span key={taste} className="inline-badge">
                          {taste}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass page-panel pixel-frame">
              <div className="label pixel">Specially for you</div>
              <div className="friend-stack" style={{ marginTop: "16px" }}>
                {social.recommendationsForViewer.map((entry) => (
                  <div className="glass friend-card" key={entry.id}>
                    <div className="friend-head">
                      <div className="avatar">{entry.fromProfile.avatar}</div>
                      <div>
                        <strong>{entry.fromProfile.name}</strong>
                        <p className="muted" style={{ margin: "4px 0 0" }}>
                          directly suggested this for your queue
                        </p>
                      </div>
                    </div>
                    <div className="inline-badges">
                      <span className="inline-badge">{entry.title.title}</span>
                      {entry.title.imdbId ? <span className="inline-badge">{entry.title.imdbId}</span> : null}
                    </div>
                    <p className="hint" style={{ marginTop: "12px" }}>{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass page-panel pixel-frame">
            <div className="label pixel">Friends-only reviews</div>
            <div className="feed-stack" style={{ marginTop: "16px" }}>
              {social.feed.map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
