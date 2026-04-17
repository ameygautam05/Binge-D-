import Link from "next/link";

export function FeedCard({ entry }) {
  const platforms = entry.content.platforms || [];
  const rating = Number(entry.content.rating || 0);

  return (
    <article className="glass feed-card pixel-frame">
      <div className="feed-head">
        <div className="avatar">{entry.friend.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <strong>{entry.friend.name}</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                {entry.friend.handle}
              </p>
            </div>
            <span className="muted pixel">{entry.timestamp}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <p className="feed-copy" style={{ marginBottom: "10px" }}>
          {entry.friend.name.split(" ")[0]} {entry.action} <strong>{entry.content.title}</strong>
          {entry.recommendedForYou ? " and nudged it into your lane." : "."}
        </p>
        <p className="review-copy">{entry.review}</p>
      </div>

      <div className="inline-badges">
        {platforms.map((platform) => (
          <span className="inline-badge" key={platform}>
            {platform}
          </span>
        ))}
        {entry.content.imdbId ? <span className="inline-badge">{entry.content.imdbId}</span> : null}
      </div>

      <div className="mini-row" style={{ marginTop: "16px", justifyContent: "space-between" }}>
        <span className="score">★ {rating ? rating.toFixed(1) : "n/a"}</span>
        <Link href={`/friends/${entry.friend.slug || entry.friend.id}`} className="ghost-button">
          Open profile
        </Link>
      </div>
    </article>
  );
}
