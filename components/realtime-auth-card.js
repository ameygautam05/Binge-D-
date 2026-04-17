"use client";

import { useMemo, useState } from "react";
import { createBrowserSocialClient, sendMagicLink } from "@/lib/social-browser";

export function RealtimeAuthCard() {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setStatus("Add Supabase URL and anon key in Vercel to turn on real accounts.");
      return;
    }

    try {
      setLoading(true);
      await sendMagicLink(supabase, email);
      setStatus("Magic link sent. Open the email and your profile flow will unlock.");
      setEmail("");
    } catch (error) {
      setStatus(error.message || "Could not send the sign-in link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-banner">
      <div>
        <div className="label pixel">Live accounts</div>
        <h3 style={{ margin: "8px 0 10px", fontSize: "1.4rem" }}>Real profiles for real people</h3>
        <p className="hint">
          Sign in by email, claim a handle, then send friend requests, recommend titles, and jump into live group discussions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="stack-row">
        <input
          type="email"
          className="field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send sign-in link"}
        </button>
      </form>

      <p className="hint" style={{ margin: 0 }}>
        {status || "Once Supabase is connected, this becomes the entry point for your real deployed audience."}
      </p>
    </div>
  );
}
