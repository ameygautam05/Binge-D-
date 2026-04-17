import Link from "next/link";
import { ContentCard } from "@/components/content-card";

export function ProfileView({ friend, source = "fallback" }) {
  return (
    <div className="content-grid">
      <section className="glass page-panel pixel-frame">
        <div className="feed-head">
          <div className="avatar" style={{ width: 72, height: 72, fontSize: "1.5rem" }}>
            {friend.avatar}
          </div>
          <div>
            <h1 className="section-title display" style={{ fontSize: "clamp(2.4rem, 8vw, 4.5rem)" }}>
              {friend.name}
            </h1>
            <p className="muted" style={{ margin: "6px 0" }}>
              {friend.handle} • {friend.city}
            </p>
            <p className="section-copy" style={{ maxWidth: 640 }}>
              {friend.tagline}
            </p>
            <p className="hint" style={{ marginTop: "10px" }}>
              {source === "zero-setup"
                ? "This profile is running in zero-setup mode with built-in data and browser-saved updates."
                : source === "supabase"
                  ? "This profile is loading from the live social database."
                  : "This profile is showing fallback social data until Supabase is connected."}
            </p>
          </div>
        </div>

        <div className="inline-badges" style={{ marginTop: "18px" }}>
          {(friend.taste || []).map((taste) => (
            <span className="inline-badge" key={taste}>
              {taste}
            </span>
          ))}
        </div>
      </section>

      <section className="split">
        <div className="glass page-panel pixel-frame">
          <div className="label pixel">Now streaming</div>
          <h2 style={{ margin: "10px 0 16px" }}>What they are currently into</h2>
          <div className="content-stack">
            {(friend.currentlyWatching || []).map((item) => (
              <ContentCard item={item} compact key={item.id} />
            ))}
          </div>
        </div>

        <div className="glass page-panel pixel-frame">
          <div className="label pixel">For you</div>
          <h2 style={{ margin: "10px 0 16px" }}>Specially recommended by {friend.name.split(" ")[0]}</h2>
          <div className="content-stack">
            {(friend.recommendationsForYou || []).map((item) => (
              <ContentCard item={item} compact key={item.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="glass page-panel pixel-frame">
        <div className="mini-row" style={{ justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div className="label pixel">Completed log</div>
            <h2 style={{ margin: "8px 0 0" }}>What they have finished and rated</h2>
          </div>
          <Link href="/social" className="ghost-button">
            Back to feed
          </Link>
        </div>
        <div className="feature-grid">
          {(friend.watched || []).map((item) => (
            <ContentCard item={item} key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
