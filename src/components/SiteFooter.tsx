import { Link } from "@tanstack/react-router";

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
          <p className="mt-4 text-xs text-slate-500">
            {"\n"}
          </p>
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
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AlloCare · SDG 1 · SDG 10 · SDG 17
      </div>
    </footer>
  );
}
