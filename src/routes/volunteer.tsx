import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/volunteer")({
  head: () => ({ meta: [{ title: "Volunteer Feed — AlloCare" }] }),
  component: VolunteerPage,
});

type Need = {
  id: string;
  zone: string;
  summary: string | null;
  affected_count: number | null;
  urgency_score: number;
  urgency_label: string;
  issue_type: string;
  required_skills: string[];
  lat: number;
  lng: number;
};

type Profile = {
  id: string;
  full_name: string;
  skills: string[] | null;
  home_lat: number | null;
  home_lng: number | null;
  available: boolean | null;
  hours_contributed: number;
  tasks_completed: number;
  streak_days: number;
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function VolunteerPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [scorecard, setScorecard] = useState<{ need: Need } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => {
      setProfile(data as any);
      if (!data?.home_lat) setShowProfile(true);
    });
    supabase.from("need_reports")
      .select("id, zone, summary, affected_count, urgency_score, urgency_label, issue_type, required_skills, lat, lng")
      .eq("status", "open")
      .order("urgency_score", { ascending: false })
      .limit(50)
      .then(({ data }) => setNeeds((data ?? []) as any));
  }, [session]);

  if (!session) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to volunteer</h1>
          <Link to="/auth" className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow">Sign in</Link>
        </div>
      </PageLayout>
    );
  }

  const ranked = needs
    .map((n) => {
      const overlap = profile?.skills?.length
        ? n.required_skills.filter((r) => profile.skills!.some((s) => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase()))).length / Math.max(1, n.required_skills.length)
        : 0.4;
      const dist = profile?.home_lat && profile.home_lng ? haversine(profile.home_lat, profile.home_lng, n.lat, n.lng) : null;
      const proximity = dist != null ? 1 / (1 + dist) : 0.3;
      const personal = (overlap * 0.5 + proximity * 0.5) * (n.urgency_score / 100 + 0.3);
      return { ...n, overlap, dist, personal };
    })
    .sort((a, b) => b.personal - a.personal);

  const accept = async (need: Need) => {
    await supabase.from("assignments").upsert({
      need_id: need.id,
      volunteer_id: session.user.id,
      status: "accepted",
      accepted_at: new Date().toISOString(),
      explanation: "Self-accepted from volunteer feed",
      match_score: 0.7,
    }, { onConflict: "need_id,volunteer_id" });
    setScorecard({ need });
    if (profile) {
      const next = {
        hours_contributed: (profile.hours_contributed ?? 0) + 1,
        tasks_completed: (profile.tasks_completed ?? 0) + 1,
        streak_days: (profile.streak_days ?? 0) + 1,
      };
      await supabase.from("profiles").update(next).eq("id", session.user.id);
      setProfile({ ...profile, ...next });
    }
  };

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const skills = (fd.get("skills") as string).split(",").map((s) => s.trim()).filter(Boolean);
    const home_lat = parseFloat(fd.get("home_lat") as string);
    const home_lng = parseFloat(fd.get("home_lng") as string);
    const max_distance_km = parseInt(fd.get("max_distance_km") as string, 10);
    await supabase.from("profiles").update({ skills, home_lat, home_lng, max_distance_km, available: true }).eq("id", session.user.id);
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data as any);
    setShowProfile(false);
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hi {profile?.full_name?.split(" ")[0] ?? "Volunteer"}</h1>
            <p className="text-sm text-slate-500">Tasks ranked by your skills, distance, and urgency.</p>
          </div>
          <button onClick={() => setShowProfile(true)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            My profile
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Hours", profile?.hours_contributed ?? 0, "#1A56DB"],
            ["Tasks", profile?.tasks_completed ?? 0, "#0E9F6E"],
            ["Streak", `${profile?.streak_days ?? 0}d`, "#E3A008"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-extrabold" style={{ color: c as string }}>{v}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
            </div>
          ))}
        </div>

        {/* Profile setup */}
        {showProfile && (
          <form onSubmit={saveProfile} className="mt-5 space-y-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 text-sm">
            <div className="font-semibold text-slate-900">Tell us about yourself for better matching</div>
            <input name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="Skills (comma separated): food distribution, medical first aid, teaching" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" />
            <div className="grid grid-cols-3 gap-2">
              <input name="home_lat" type="number" step="0.0001" defaultValue={profile?.home_lat ?? 19.07} placeholder="home_lat" className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
              <input name="home_lng" type="number" step="0.0001" defaultValue={profile?.home_lng ?? 72.88} placeholder="home_lng" className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
              <input name="max_distance_km" type="number" defaultValue={10} placeholder="max km" className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
            </div>
            <button type="submit" className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white">Save</button>
          </form>
        )}

        {/* Tasks */}
        <div className="mt-6 space-y-3">
          {ranked.map((n) => {
            const c = n.urgency_label === "CRITICAL" ? "#E02424" : n.urgency_label === "HIGH" ? "#F97316" : n.urgency_label === "MEDIUM" ? "#E3A008" : "#0E9F6E";
            return (
              <article key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: c }}>{n.urgency_label}</span>
                  <span className="text-[11px] text-slate-500">{n.zone}{n.dist != null && ` · ${n.dist.toFixed(1)} km`}</span>
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">{n.summary ?? n.issue_type}</div>
                {n.affected_count != null && <div className="text-xs text-slate-600">Your effort helps ~{n.affected_count} people.</div>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {n.required_skills.map((s) => <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{s}</span>)}
                </div>
                <button onClick={() => accept(n)} className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md">
                  Accept Task
                </button>
              </article>
            );
          })}
          {ranked.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No open tasks right now.</div>}
        </div>

        {/* Scorecard */}
        {scorecard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6" onClick={() => setScorecard(null)}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#0E9F6E] to-[#1A56DB] text-3xl text-white shadow-lg">🏅</div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Task accepted!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your effort will help {scorecard.need.affected_count ?? "a community"} {scorecard.need.affected_count ? "people" : ""} in {scorecard.need.zone}.
              </p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                Streak: <b>{profile?.streak_days ?? 0} days</b> · Tasks: <b>{profile?.tasks_completed ?? 0}</b>
              </div>
              <button onClick={() => setScorecard(null)} className="mt-5 w-full rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white">Continue</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
