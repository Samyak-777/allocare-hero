import { useState } from "react";

export function UrgencyExplainer({ score, label }: { score: number; label: string }) {
  const [open, setOpen] = useState(false);
  const [flagged, setFlagged] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900">
          Urgency {score} · {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[10px] font-medium text-[#1A56DB] hover:underline"
          >
            {open ? "Hide formula" : "How is this scored?"}
          </button>
          <button
            type="button"
            onClick={() => setFlagged(true)}
            disabled={flagged}
            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:border-[#E02424] hover:text-[#E02424] disabled:opacity-60"
          >
            🚩 {flagged ? "Flagged" : "Flag score"}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
          <code className="block rounded bg-white px-2 py-1 font-mono text-[11px] text-slate-800">
            score = (severity × log(frequency + 1)) ÷ max(1, days)
          </code>
          <p className="text-[11px] text-slate-600">
            Then normalized × 10 and capped at 100. Bands: ≥86 CRITICAL, ≥61 HIGH, ≥31 MEDIUM, else LOW.
          </p>
        </div>
      )}
    </div>
  );
}
