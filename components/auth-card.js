"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthCard() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setStatus("Demo mode is live. Add Supabase env keys to turn on real email magic-link auth and confirmations.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        throw error;
      }

      setStatus("Check your inbox. The confirmation link is on the way.");
      setEmail("");
    } catch (error) {
      setStatus(error.message || "That login ping did not land. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-banner">
      <div>
        <div className="label pixel">Launch crew</div>
        <h3 style={{ margin: "8px 0 10px", fontSize: "1.4rem" }}>Email login for your test crowd</h3>
        <p className="hint">
          The UI is wired for Supabase magic-link auth so you can collect real users during your Vercel test week.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="stack-row">
        <input
          type="email"
          className="field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@binge-d.club"
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send login link"}
        </button>
      </form>

      <p className="hint" style={{ margin: 0 }}>
        {status || "Email confirmations switch on automatically once `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set."}
      </p>
    </div>
  );
}
