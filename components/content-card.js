export function ContentCard({ item, compact = false }) {
  const rating = Number(item.rating || item.friendRating || 0);
  const platforms = item.platforms || [];

  return (
    <article className={`glass ${compact ? "small-card" : "card"} pixel-frame`}>
      <div className={compact ? "mini-row" : "result-head"}>
        <div className="score">★ {rating ? rating.toFixed(1) : "n/a"}</div>
        <div className="inline-badge">{item.type || "Title"}</div>
        <div className="inline-badge">{item.language || "Unknown"}</div>
      </div>
      <h3 style={{ margin: "12px 0 8px", fontSize: compact ? "1.15rem" : "1.45rem" }}>{item.title}</h3>
      <p className="hint">{item.blurb || "No extra note for this title yet."}</p>
      <div className="inline-badges">
        {platforms.map((platform) => (
          <span key={platform} className="inline-badge">
            {platform}
          </span>
        ))}
        {item.year ? <span className="inline-badge">{item.year}</span> : null}
        {item.imdbId ? <span className="inline-badge">{item.imdbId}</span> : null}
      </div>
    </article>
  );
}
