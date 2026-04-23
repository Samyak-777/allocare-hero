import { Link } from "@tanstack/react-router";

const SDGS = [
  { num: 1, label: "No Poverty", color: "#E5243B" },
  { num: 10, label: "Reduced Inequalities", color: "#DD1367" },
  { num: 17, label: "Partnerships for the Goals", color: "#19486A" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#1A56DB] to-[#0E9F6E] text-white text-sm shadow">A</span>
            AlloCare
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            From paper survey to matched volunteer in 60 seconds. AI-powered allocation built for
            NGOs serving underserved communities.
          </p>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
            <div className="font-semibold text-slate-900">Why AlloCare is different</div>
            <p className="mt-1 leading-relaxed">
              First platform to close the full loop — paper survey → digital → urgency → matched volunteer.
              Idealist (no urgency scoring), KoBoToolbox (no matching), POINT App (no AI routing).
            </p>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><Link to="/features" className="hover:text-[#1A56DB]">Features</Link></li>
            <li><Link to="/how-it-works" className="hover:text-[#1A56DB]">How It Works</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#1A56DB]">Dashboard</Link></li>
            <li><Link to="/volunteer" className="hover:text-[#1A56DB]">Volunteer App</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">About</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><Link to="/problem" className="hover:text-[#1A56DB]">Problem</Link></li>
            <li><Link to="/research" className="hover:text-[#1A56DB]">Research</Link></li>
            <li><Link to="/tech" className="hover:text-[#1A56DB]">Tech Stack</Link></li>
          </ul>
        </div>
      </div>

      {/* SDG badges */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            UN Sustainable Development Goals
          </div>
          <div className="flex flex-wrap gap-2">
            {SDGS.map((s) => (
              <div key={s.num} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-md text-[11px] font-bold text-white" style={{ background: s.color }}>
                  {s.num}
                </span>
                <span className="text-xs font-medium text-slate-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AlloCare · Built for Google Solution Challenge
      </div>
    </footer>
  );
}
