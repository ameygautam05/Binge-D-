"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FeedCard } from "@/components/feed-card";
import { ZERO_SOCIAL_STORAGE_KEY, buildZeroSetupSeed, makeViewerFeedEntry, mergeZeroSetupState } from "@/lib/zero-setup-social";
import { catalog } from "@/data/catalog";

function readState() {
  const base = buildZeroSetupSeed();

  if (typeof window === "undefined") {
    return base;
  }

  try {
    const raw = window.localStorage.getItem(ZERO_SOCIAL_STORAGE_KEY);
    return mergeZeroSetupState(base, raw ? JSON.parse(raw) : null);
  } catch {
    return base;
  }
}

function writeState(state) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    viewer: state.viewer,
    feed: state.feed.filter((entry) => entry.friend.slug === "you")
  };

  window.localStorage.setItem(ZERO_SOCIAL_STORAGE_KEY, JSON.stringify(payload));
}

export function SocialBrowserClient() {
  const [social, setSocial] = useState(buildZeroSetupSeed());
  const [contentId, setContentId] = useState(catalog[0]?.id || "");
  const [status, setStatus] = useState("completed");
  const [rating, setRating] = useState("4.5");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    setSocial(readState());
  }, []);

  const pickedContent = useMemo(() => catalog.find((item) => item.id === contentId), [contentId]);

  function addEntry(event) {
    event.preventDefault();
    const entry = makeViewerFeedEntry({
      contentId,
      status,
      rating: Number(rating || 0),
      reviewText,
      viewer: social.viewer
    });

    if (!entry) {
      return;
    }

    const content = catalog.find((item) => item.id === contentId);
    const nextViewer = {
      ...social.viewer,
      currentlyWatching:
        status === "watching"
          ? [content, ...(social.viewer.currentlyWatching || []).filter((item) => item.id !== content.id)]
          : (social.viewer.currentlyWatching || []).filter((item) => item.id !== content.id),
      watched:
        status === "completed"
          ? [{ ...content, friendRating: Number(rating || 0), friendReview: reviewText }, ...(social.viewer.watched || []).filter((item) => item.id !== content.id)]
          : social.viewer.watched || []
    };

    const next = {
      ...social,
      viewer: nextViewer,
      profiles: [nextViewer, ...social.friends],
      feed: [entry, ...social.feed]
    };

    setSocial(next);
    writeState(next);
    setReviewText("");
  }

  return (
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
              Zero-setup mode ships with shared demo friends, and your own watch logs save in the current browser automatically.
            </p>
            <p className="hint" style={{ marginTop: "12px" }}>
              This deploy needs no keys. Browser-saved actions are personal to each visitor unless you later add a real backend.
            </p>
          </div>
          <Link href="/discover" className="button">
            Run a new prediction
          </Link>
        </div>
      </section>

      <section className="glass page-panel pixel-frame">
        <div className="label pixel">Drop your own update</div>
        <form className="split" onSubmit={addEntry} style={{ marginTop: "16px" }}>
          <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <select className="select" value={contentId} onChange={(event) => setContentId(event.target.value)}>
              {catalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="completed">Finished it</option>
              <option value="watching">Watching now</option>
            </select>
            <input
              className="field"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              placeholder="Your rating, example 4.5"
            />
          </div>
          <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <textarea
              className="textarea"
              rows={5}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder={`Say something about ${pickedContent?.title || "this title"}`}
            />
            <button className="button" type="submit">
              Save in this browser
            </button>
          </div>
        </form>
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
                    <span key={taste} className="inline-badge">{taste}</span>
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
                    <p className="muted" style={{ margin: "4px 0 0" }}>directly suggested this for your queue</p>
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
  );
}
