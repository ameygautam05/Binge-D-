import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { SiteNav } from "@/components/nav";
import { PosterCollage } from "@/components/poster-collage";
import { RealtimeAuthCard } from "@/components/realtime-auth-card";
import { catalog } from "@/data/catalog";

export default async function HomePage() {
  const heroTitles = catalog.slice(0, 7);
  const highlightedFeed = catalog.slice(0, 2).map((item, index) => ({
    id: item.id,
    friend: {
      avatar: index === 0 ? "AS" : "IR",
      name: index === 0 ? "Aarya Sen" : "Ishaan Rao"
    },
    action: index === 0 ? "recommended" : "finished",
    content: item,
    review: index === 0 ? "This one deserves a proper friend-chat thread right after the credits." : "High-energy watch. Perfect for group arguments and late-night rec spam."
  }));

  return (
    <main className="page-shell">
      <SiteNav />

      <section className="hero">
        <div className="container hero-grid">
          <div className="glass hero-panel pixel-frame">
            <div className="hero-kicker">
              <div className="eyebrow">social predictor portal</div>
              <div className="chip pixel">India watch guide</div>
            </div>
            <h1 className="hero-title display">
              binge-d is your
              <br />
              <span>neon watch brain</span>
            </h1>
            <p className="hero-copy">
              One place to predict what to watch next, track what your friends are into, drop private review energy,
              and find where every mood-shift lives across Netflix, Prime Video, Hotstar, YouTube, SonyLIV, Sun NXT,
              and HBO.
            </p>
            <div className="cta-row" style={{ marginTop: "24px" }}>
              <Link href="/discover" className="button">
                Start the top-7 predictor
              </Link>
              <Link href="/social" className="ghost-button">
                Open friend feed
              </Link>
            </div>
            <div className="platform-row">
              <span className="platform-badge platform-netflix">Netflix</span>
              <span className="platform-badge platform-prime">Prime Video</span>
              <span className="platform-badge platform-hotstar">Hotstar</span>
              <span className="platform-badge platform-youtube">YouTube</span>
              <span className="platform-badge platform-sony">SonyLIV</span>
              <span className="platform-badge platform-sun">Sun NXT</span>
              <span className="platform-badge platform-hbo">HBO</span>
            </div>
          </div>

          <div className="glass insight-panel pixel-frame">
            <div className="label pixel">Tonight's poster storm</div>
            <h2 style={{ margin: "10px 0 18px", fontSize: "1.9rem" }}>Top-board collage preview</h2>
            <PosterCollage items={heroTitles} />
            <p className="hint" style={{ marginTop: "16px" }}>
              Real-time mode is designed for actual deployed users: profiles, friend requests, recommendations, groups, and live discussion.
            </p>
            <div className="stat-grid">
              <div className="stat-tile">
                <p className="stat-value display">7</p>
                <p className="stat-label">smart recs per prediction run</p>
              </div>
              <div className="stat-tile">
                <p className="stat-value display">24/7</p>
                <p className="stat-label">live social activity once deployed</p>
              </div>
              <div className="stat-tile">
                <p className="stat-value display">22</p>
                <p className="stat-label">starter titles across formats</p>
              </div>
              <div className="stat-tile">
                <p className="stat-value display">∞</p>
                <p className="stat-label">friend requests, groups, and chat threads</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container dashboard-grid">
        <aside className="glass sidebar pixel-frame">
            <div className="label pixel">Portal map</div>
          <div className="nav-list" style={{ marginTop: "14px" }}>
            <Link href="/discover" className="nav-pill active">
              <span>Predict your next obsession</span>
              <span>07</span>
            </Link>
            <Link href="/social" className="nav-pill">
              <span>What friends are watching</span>
              <span>RT</span>
            </Link>
            <Link href="/friends/aarya" className="nav-pill">
              <span>Friend profile deep dive</span>
              <span>01</span>
            </Link>
          </div>

          <div style={{ marginTop: "24px" }}>
              <div className="label pixel">Crew preview</div>
              <div className="friend-stack" style={{ marginTop: "12px" }}>
              {[
                { id: "handle-search", name: "Handle search", handle: "@friend-id", tagline: "Add friends by ID and build your own graph.", avatar: "ID" },
                { id: "groups", name: "Private groups", handle: "#watch-club", tagline: "Spin up group discussions for a movie or series.", avatar: "GP" },
                { id: "realtime", name: "Live discussion", handle: "@realtime", tagline: "Messages and recs refresh as people post.", avatar: "RT" }
              ].map((friend) => (
                <div key={friend.id} className="glass friend-card">
                  <div className="friend-head">
                    <div className="avatar">{friend.avatar}</div>
                    <div>
                      <strong>{friend.name}</strong>
                      <p className="muted" style={{ margin: "4px 0 0" }}>
                        {friend.handle}
                      </p>
                    </div>
                  </div>
                  <p className="friend-copy" style={{ marginTop: "10px" }}>
                    {friend.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="content-grid">
          <RealtimeAuthCard />

          <section className="feature-grid">
            <div className="glass feature-card pixel-frame">
              <div className="label pixel">How it hits</div>
              <h2 style={{ margin: "10px 0 8px" }}>Predictor with sane questions</h2>
              <p className="hint">
                The quiz now asks about mood, format, language, last liked title, friend influence, and rating tolerance
                instead of vague inside-joke prompts.
              </p>
            </div>

            <div className="glass feature-card pixel-frame">
              <div className="label pixel">Social graph</div>
              <h2 style={{ margin: "10px 0 8px" }}>Actual social layer</h2>
              <p className="hint">
                Real accounts can add profiles, send friend requests by handle, remove friends, recommend titles, create groups, and discuss specific watches in live threads.
              </p>
            </div>
          </section>

          <section className="glass page-panel pixel-frame">
            <div className="mini-row" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div className="label pixel">Friend feed</div>
                <h2 style={{ margin: "10px 0 0" }}>What your people are pushing into your queue</h2>
              </div>
              <Link href="/social" className="ghost-button">
                See all activity
              </Link>
            </div>

            <div className="feed-stack">
              {highlightedFeed.map((entry) => (
                <div key={entry.id} className="glass feed-card">
                  <div className="feed-head">
                    <div className="avatar">{entry.friend.avatar}</div>
                    <div>
                      <strong>{entry.friend.name}</strong>
                      <p className="muted" style={{ margin: "4px 0 0" }}>
                        {entry.action} {entry.content.title}
                      </p>
                    </div>
                  </div>
                  <p className="review-copy" style={{ marginTop: "12px" }}>
                    {entry.review}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid-three">
            {catalog.slice(0, 3).map((item) => (
              <ContentCard item={item} key={item.id} />
            ))}
          </section>
        </div>
      </section>

      <footer className="container footer">
        <p className="muted">Deploy-ready for a real Vercel app backed by Supabase Auth, Postgres, and Realtime.</p>
      </footer>
    </main>
  );
}
