import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHeader } from "@/components/PageLayout";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — AlloCare" },
      { name: "description", content: "The team behind AlloCare for Google Solution Challenge 2026." },
      { property: "og:title", content: "Team — AlloCare" },
      { property: "og:description", content: "Built for Google Solution Challenge 2026." },
    ],
  }),
  component: TeamPage,
});

const PHASES = [
  { phase: "Phase 1", goal: "Top 100 · Working Prototype", color: "#1A56DB" },
  { phase: "Phase 2", goal: "Top 10 · GCP Credits + Mentorship", color: "#0E9F6E" },
  { phase: "Phase 3", goal: "Finale · Grand Winner · ₹10,00,000", color: "#E3A008" },
];

function TeamPage() {
  return (
    <PageLayout>
      <PageHeader
        eyebrow="The Team"
        title="Built for Google Solution Challenge 2026."
        intro="A multidisciplinary team focused on making humanitarian data actionable. Hack2Skill × GDG on Campus × Google."
      />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Challenge Roadmap</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PHASES.map((p) => (
            <div key={p.phase} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.phase}</div>
              <div className="mt-3 text-base font-semibold text-slate-900">{p.goal}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold text-slate-900">Submission Details</h2>
        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          {[
            ["Category", "Social Impact / AI"],
            ["Track", "Smart Resource Allocation"],
            ["Pilot City", "Mumbai (Dharavi, Kurla, Govandi, Bandra E)"],
            ["Partner NGOs", "Apnalaya · SNEHA · Pratham"],
            ["Status", "Working prototype on Lovable Cloud"],
            ["Stack", "TanStack Start · React · Gemini · Postgres + RLS"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{k}</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{v}</div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
