import { SiteNav } from "@/components/nav";
import { QuizClient } from "@/components/quiz-client";

export default function DiscoverPage() {
  return (
    <main className="page-shell">
      <SiteNav />
      <section className="container" style={{ padding: "36px 0 56px" }}>
        <QuizClient />
      </section>
    </main>
  );
}
