"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { createBrowserSocialClient } from "@/lib/social-browser";

export function RealtimeProfileClient({ slug }) {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [profile, setProfile] = useState(null);
  const [watches, setWatches] = useState([]);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        return;
      }

      const { data: nextProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!nextProfile) {
        setProfile(null);
        return;
      }

      const { data: nextWatches } = await supabase
        .from("watch_entries")
        .select("*, title:title_id(*)")
        .eq("profile_id", nextProfile.id)
        .order("updated_at", { ascending: false });

      setProfile(nextProfile);
      setWatches(nextWatches || []);
    }

    load();
  }, [slug, supabase]);

  if (!supabase) {
    return (
      <div className="glass page-panel pixel-frame">
        <p className="hint">Connect Supabase env keys to load real public profiles here.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass page-panel pixel-frame">
        <div className="eyebrow">profile portal</div>
        <h1 className="section-title display" style={{ margin: "16px 0" }}>that profile is not live yet</h1>
        <div className="cta-row">
          <Link href="/social" className="button">Back to social</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-grid">
      <section className="glass page-panel pixel-frame">
        <div className="feed-head">
          <div className="avatar" style={{ width: 72, height: 72, fontSize: "1.5rem" }}>
            {profile.avatar_text || profile.handle.slice(1, 3).toUpperCase()}
          </div>
          <div>
            <h1 className="section-title display" style={{ fontSize: "clamp(2.4rem, 8vw, 4.5rem)" }}>
              {profile.display_name}
            </h1>
            <p className="muted" style={{ margin: "6px 0" }}>
              {profile.handle} {profile.city ? `• ${profile.city}` : ""}
            </p>
            <p className="section-copy" style={{ maxWidth: 640 }}>{profile.tagline || "No tagline yet."}</p>
          </div>
        </div>
        <div className="inline-badges" style={{ marginTop: "18px" }}>
          {(profile.taste_tags || []).map((taste) => (
            <span className="inline-badge" key={taste}>{taste}</span>
          ))}
        </div>
      </section>

      <section className="glass page-panel pixel-frame">
        <div className="mini-row" style={{ justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div className="label pixel">Recent activity</div>
            <h2 style={{ margin: "8px 0 0" }}>What they are watching, finishing, and rating</h2>
          </div>
          <Link href="/social" className="ghost-button">Back to social</Link>
        </div>
        <div className="feature-grid">
          {watches.length ? watches.map((entry) => (
            <ContentCard
              key={entry.id}
              item={{
                ...entry.title,
                title: entry.title.title,
                type: entry.title.title_type,
                language: entry.title.language_hint,
                rating: entry.rating || entry.title.rating || 0,
                blurb: entry.review_text || entry.title.blurb,
                platforms: entry.title.platforms || [],
                imdbId: entry.title.imdb_id
              }}
            />
          )) : <p className="hint">No public watch activity yet.</p>}
        </div>
      </section>
    </div>
  );
}
