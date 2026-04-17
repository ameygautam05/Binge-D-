"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileView } from "@/components/profile-view";
import { ZERO_SOCIAL_STORAGE_KEY, buildZeroSetupSeed, mergeZeroSetupState } from "@/lib/zero-setup-social";

export function ProfileBrowserClient({ slug }) {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    const base = buildZeroSetupSeed();
    try {
      const raw = window.localStorage.getItem(ZERO_SOCIAL_STORAGE_KEY);
      const merged = mergeZeroSetupState(base, raw ? JSON.parse(raw) : null);
      setFriend(merged.profiles.find((profile) => profile.slug === slug) || null);
    } catch {
      setFriend(base.profiles.find((profile) => profile.slug === slug) || null);
    }
  }, [slug]);

  if (!friend) {
    return (
      <div className="glass page-panel pixel-frame">
        <div className="eyebrow">missing profile</div>
        <h1 className="section-title display" style={{ margin: "16px 0" }}>that profile is off-grid</h1>
        <p className="section-copy">This zero-setup build only includes the seeded demo profiles plus your browser-saved one.</p>
        <div className="cta-row" style={{ marginTop: "20px" }}>
          <Link href="/social" className="button">Back to social</Link>
        </div>
      </div>
    );
  }

  return <ProfileView friend={friend} source="zero-setup" />;
}
