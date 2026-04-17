"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSocialClient } from "@/lib/social-browser";

export function AuthCallbackClient() {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [status, setStatus] = useState("Finishing your sign-in...");

  useEffect(() => {
    async function hydrate() {
      if (!supabase) {
        setStatus("Supabase is not configured on this deployment yet.");
        return;
      }

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session) {
          setStatus("You are signed in. Redirecting to the social portal...");
          window.setTimeout(() => {
            window.location.href = "/social";
          }, 1200);
          return;
        }

        setStatus("The session has not landed yet. If your magic link just opened, give it a second and refresh.");
      } catch (error) {
        setStatus(error.message || "Auth callback did not complete cleanly.");
      }
    }

    hydrate();
  }, [supabase]);

  return (
    <div className="glass page-panel pixel-frame">
      <div className="eyebrow">auth return</div>
      <h1 className="section-title display" style={{ margin: "16px 0" }}>
        almost inside
      </h1>
      <p className="section-copy">{status}</p>
      <div className="cta-row" style={{ marginTop: "20px" }}>
        <Link href="/social" className="button">Open social</Link>
      </div>
    </div>
  );
}
