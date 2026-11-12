import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DataQualityBadge({ score = 100 }) {
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let badgeLabel = 'Excellent Health';
  let Icon = CheckCircle;

  if (score < 60) {
    colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    badgeLabel = 'Needs Cleaning';
    Icon = AlertTriangle;
  } else if (score < 85) {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    badgeLabel = 'Moderate Health';
    Icon = ShieldCheck;
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClass}`}>
      <Icon className="w-6 h-6 shrink-0" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black">{score.toFixed(1)}%</span>
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/60 border border-current">
            {badgeLabel}
          </span>
        </div>
        <p className="text-[11px] opacity-80 mt-0.5">Automated Data Profile & Quality Assessment</p>
      </div>
    </div>
  );
}
