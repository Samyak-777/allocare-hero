import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/PageLayout";
import { MumbaiHeatmap, type HeatNeed } from "@/components/MumbaiHeatmap";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Coordinator Dashboard — AlloCare" },
      { name: "description", content: "Live urgency heatmap, ranked need feed, and AI-matched volunteers." },
    ],
  }),
  component: DashboardPage,
});

const ZONES = [
  { name: "Dharavi", lat: 19.0419, lng: 72.8520 },
  { name: "Kurla", lat: 19.0707, lng: 72.8826 },
  { name: "Govandi", lat: 19.0568, lng: 72.9239 },
  { name: "Bandra East", lat: 19.0596, lng: 72.8403 },
  { name: "Andheri East", lat: 19.1197, lng: 72.8755 },
  { name: "Worli", lat: 19.0144, lng: 72.8133 },
  { name: "Chembur", lat: 19.0625, lng: 72.8956 },
  { name: "Malad", lat: 19.1864, lng: 72.8356 },
];

type Match = { volunteer_id: string; full_name: string; score: number; distance_km: number; explanation: string };

function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [needs, setNeeds] = useState<HeatNeed[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matching, setMatching] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [ingestText, setIngestText] = useState("");
  const [ingestZone, setIngestZone] = useState(ZONES[0].name);
  const [ingestBusy, setIngestBusy] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchNeeds = async () => {
    const { data } = await supabase
      .from("need_reports")
      .select("id, zone, lat, lng, urgency_score, urgency_label, issue_type, affected_count, summary, status, required_skills, severity_score, created_at, location_text")
      .in("status", ["open", "assigned", "in_progress"])
      .order("urgency_score", { ascending: false })
      .limit(100);
    setNeeds((data ?? []) as any);
  };

  useEffect(() => {
    fetchNeeds();
    const ch = supabase
      .channel("needs-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "need_reports" }, () => fetchNeeds())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const selected = useMemo(() => needs.find((n) => n.id === selectedId) ?? null, [needs, selectedId]);

  const runMatch = async (needId: string) => {
    setMatching(true);
    setMatches([]);
    try {
      const { data, error } = await supabase.functions.invoke("match-volunteers", { body: { needId, persist: false } });
      if (error) throw error;
      setMatches(data?.matches ?? []);
    } finally {
      setMatching(false);
    }
  };

  useEffect(() => {
    if (selectedId) runMatch(selectedId);
  }, [selectedId]);

  const submitIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestError(null);
    setIngestBusy(true);
    try {
      const z = ZONES.find((x) => x.name === ingestZone)!;
      const { data, error } = await supabase.functions.invoke("ingest-need", {
        body: { rawText: ingestText, zone: z.name, lat: z.lat, lng: z.lng, locationText: z.name },
      });
      if (error) throw error;
      setIngestText("");
      setShowIngest(false);
      await fetchNeeds();
      if (data?.need?.id) setSelectedId(data.need.id);
    } catch (err) {
      setIngestError(err instanceof Error ? err.message : "Failed to ingest");
    } finally {
      setIngestBusy(false);
    }
  };

  const counts = useMemo(() => ({
    critical: needs.filter((n) => n.urgency_label === "CRITICAL").length,
    high: needs.filter((n) => n.urgency_label === "HIGH").length,
    open: needs.length,
  }), [needs]);

  if (!session) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Sign in required</h1>
          <p className="mt-2 text-slate-600">The coordinator dashboard requires an account.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow">
            Sign in
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coordinator Dashboard</h1>
            <p className="text-sm text-slate-500">Live Mumbai urgency feed · {counts.open} open · {counts.critical} critical · {counts.high} high</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowIngest((v) => !v)}
              className="rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md"
            >
              + Add Report (Gemini)
            </button>
            <Link to="/volunteer" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#1A56DB]">
              Volunteer view
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Ingest panel */}
        {showIngest && (
          <form onSubmit={submitIngest} className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
            <div className="text-sm font-semibold text-slate-900">New field report</div>
            <p className="text-xs text-slate-600">Gemini will extract urgency, skills, and severity automatically.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_200px]">
              <textarea
                required
                value={ingestText}
                onChange={(e) => setIngestText(e.target.value)}
                rows={3}
                placeholder="e.g. 47 families without food rations after ration shop closed for 5 days in Dharavi"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={ingestZone}
                onChange={(e) => setIngestZone(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {ZONES.map((z) => <option key={z.name}>{z.name}</option>)}
              </select>
            </div>
            {ingestError && <div className="mt-2 text-sm text-[#E02424]">{ingestError}</div>}
            <div className="mt-3 flex gap-2">
              <button disabled={ingestBusy} type="submit" className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {ingestBusy ? "Scoring with Gemini..." : "Ingest & Score"}
              </button>
              <button type="button" onClick={() => setShowIngest(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Three-pane layout */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr_340px]">
          {/* Left: feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Need feed · ranked</div>
            <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {needs.map((n) => {
                const c = n.urgency_label === "CRITICAL" ? "#E02424" : n.urgency_label === "HIGH" ? "#F97316" : n.urgency_label === "MEDIUM" ? "#E3A008" : "#0E9F6E";
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${selectedId === n.id ? "border-[#1A56DB] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: c }}>
                        {n.urgency_label} · {n.urgency_score}
                      </span>
                      <span className="text-[11px] text-slate-500">{n.zone}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{n.summary ?? n.issue_type}</div>
                    {n.affected_count != null && <div className="mt-1 text-xs text-slate-500">~{n.affected_count} affected</div>}
                  </button>
                );
              })}
              {needs.length === 0 && <div className="py-10 text-center text-sm text-slate-500">No open needs</div>}
            </div>
          </div>

          {/* Center: heatmap */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Mumbai urgency heatmap</div>
              <div className="text-[11px] text-slate-500">Click a cluster for matches</div>
            </div>
            <div className="h-[640px]">
              <MumbaiHeatmap needs={needs} onSelect={(n) => setSelectedId(n.id)} selectedId={selectedId} />
            </div>
          </div>

          {/* Right: details + matches */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Details & matches</div>
            {!selected && <div className="mt-6 text-sm text-slate-500">Select a need to see AI-matched volunteers.</div>}
            {selected && (
              <div className="mt-3 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-semibold text-slate-900">{selected.summary}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-700">{selected.zone}</span>
                    <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-700">{selected.issue_type}</span>
                    <span className="rounded bg-white px-2 py-0.5 font-semibold text-[#1A56DB]">Urgency {selected.urgency_score}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Top-3 matches</div>
                  {matching && <div className="mt-3 text-sm text-slate-500">Computing matches…</div>}
                  {!matching && matches.length === 0 && (
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                      No volunteers with location set yet. Sign up volunteers and add home_lat/lng to their profile to see matches.
                    </div>
                  )}
                  <div className="mt-3 space-y-2">
                    {matches.map((m, i) => (
                      <div key={m.volunteer_id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">#{i + 1} · {m.full_name}</div>
                          <div className="text-xs font-bold text-[#0E9F6E]">{(m.score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600">{m.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  Formula: <span className="font-mono">skill_overlap × proximity × availability</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
