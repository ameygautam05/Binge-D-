import { SiteNav } from "@/components/nav";
import { AuthCallbackClient } from "@/components/auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "56px 0" }}>
        <AuthCallbackClient />
      </section>
    </main>
  );
}
