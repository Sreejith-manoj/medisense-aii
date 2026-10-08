import React from 'react';
import { Activity, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UrgencyGauge({ score = 20, level = 'LOW' }) {
  const isEmergency = level === 'EMERGENCY';
  const isModerate = level === 'MODERATE';

  let gaugeColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let levelText = 'Low Urgency (Routine Self-Care)';

  if (isEmergency) {
    gaugeColor = 'bg-rose-600';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
    levelText = 'HIGH URGENCY - EMERGENCY RED FLAG';
  } else if (isModerate) {
    gaugeColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    levelText = 'Moderate Urgency (Doctor Consultation)';
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Clinical Urgency Index
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badgeBg}`}>
          {levelText}
        </span>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>0 (Routine)</span>
          <span className="text-slate-900 font-bold text-sm">{score} / 100</span>
          <span>100 (Emergency)</span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${gaugeColor}`}
            style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
