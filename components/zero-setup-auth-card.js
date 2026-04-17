"use client";

import { useEffect, useState } from "react";
import { ZERO_SOCIAL_STORAGE_KEY, buildZeroSetupSeed, mergeZeroSetupState } from "@/lib/zero-setup-social";

export function ZeroSetupAuthCard() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("Pick a name and your browser becomes your profile. No keys, no setup, no dashboard hopping.");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(ZERO_SOCIAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const merged = mergeZeroSetupState(buildZeroSetupSeed(), parsed);
      setName(merged.viewer.name === "You" ? "" : merged.viewer.name);
      setHandle(merged.viewer.handle === "@you" ? "" : merged.viewer.handle);
    } catch {
      return;
    }
  }, []);

  function saveProfile(event) {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(ZERO_SOCIAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const next = {
        ...parsed,
        viewer: {
          ...(parsed.viewer || {}),
          name: name || "You",
          handle: handle || "@you",
          avatar: (name || "YU").slice(0, 2).toUpperCase(),
          tagline: "Your browser-saved profile for zero-setup binge-d mode."
        }
      };
      window.localStorage.setItem(ZERO_SOCIAL_STORAGE_KEY, JSON.stringify(next));
      setStatus("Profile saved in this browser. Push to GitHub, deploy to Vercel, and it works as-is.");
    } catch {
      setStatus("Could not save locally in this browser.");
    }
  }

  return (
    <div className="auth-banner">
      <div>
        <div className="label pixel">Zero setup mode</div>
        <h3 style={{ margin: "8px 0 10px", fontSize: "1.4rem" }}>Works on Vercel with no keys</h3>
        <p className="hint">
          This version is intentionally self-contained. Shared seed content is built in, and your own profile/actions are stored in-browser.
        </p>
      </div>

      <form onSubmit={saveProfile} className="stack-row">
        <input
          type="text"
          className="field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your display name"
        />
        <input
          type="text"
          className="field"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@yourhandle"
        />
        <button className="button" type="submit">
          Save browser profile
        </button>
      </form>

      <p className="hint" style={{ margin: 0 }}>{status}</p>
    </div>
  );
}
