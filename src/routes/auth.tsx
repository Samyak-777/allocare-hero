import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/PageLayout";
import { MumbaiHeatmap, type HeatNeed } from "@/components/MumbaiHeatmap";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — AlloCare" },
      { name: "description", content: "Sign in or create an AlloCare account to coordinate or volunteer." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      if (data.session) throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

const PREVIEW_NEEDS: HeatNeed[] = [
  { id: "p1", zone: "Dharavi", lat: 19.041, lng: 72.852, urgency_score: 92, urgency_label: "CRITICAL", issue_type: "food", affected_count: 47, summary: "Food shortage" },
  { id: "p2", zone: "Govandi", lat: 19.057, lng: 72.924, urgency_score: 78, urgency_label: "HIGH", issue_type: "water", affected_count: 30, summary: "Water cut" },
  { id: "p3", zone: "Kurla", lat: 19.071, lng: 72.879, urgency_score: 64, urgency_label: "HIGH", issue_type: "health", affected_count: 22, summary: "Fever cluster" },
  { id: "p4", zone: "Worli", lat: 19.014, lng: 72.813, urgency_score: 42, urgency_label: "MEDIUM", issue_type: "housing", affected_count: 12, summary: "Shelter request" },
  { id: "p5", zone: "Andheri", lat: 19.119, lng: 72.846, urgency_score: 24, urgency_label: "LOW", issue_type: "education", affected_count: 8, summary: "After-school" },
];

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) nav({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto grid min-h-[80vh] max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_minmax(380px,420px)] lg:py-16">
        {/* Left: live preview */}
        <div className="hidden flex-col justify-center lg:flex">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1A56DB]">
            Live Mumbai demo · pre-loaded
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900" style={{ letterSpacing: "-0.02em" }}>
            From paper survey to <span className="bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E] bg-clip-text text-transparent">matched volunteer</span> in 60 seconds.
          </h2>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            AlloCare reads handwritten field reports, scores urgency with Gemini, and routes the closest skilled volunteer — automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Cloud Vision OCR", "Gemini AI", "Google Maps", "Supabase Realtime"].map((t) => (
              <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-6 h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MumbaiHeatmap needs={PREVIEW_NEEDS} />
          </div>
          <p className="mt-3 text-xs text-slate-500">Sign in to see live data update in real time.</p>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {mode === "signin" ? "Sign in to AlloCare" : "Create your AlloCare account"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "signin" ? "Coordinate needs and matched volunteers." : "Default role is volunteer — coordinators are upgraded by an admin."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Priya Sharma"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="you@ngo.org"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#E02424]">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="mt-5 w-full text-center text-sm text-slate-600 hover:text-[#1A56DB]"
            >
              {mode === "signin" ? "No account? Create one →" : "Already have an account? Sign in →"}
            </button>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-500">
              Pre-loaded with Mumbai demo data — see it live after sign-in.{" "}
              <Link to="/" className="font-semibold text-[#1A56DB] hover:underline">Back home</Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
