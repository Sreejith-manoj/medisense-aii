import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, PhoneCall } from 'lucide-react';

export default function RiskAlertBanner({ risk }) {
  if (!risk) return null;

  const isEmergency = risk.urgency_level === 'EMERGENCY';
  const isModerate = risk.urgency_level === 'MODERATE';

  if (isEmergency) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 border-2 border-rose-300 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-900 border border-rose-300">
                {risk.badge_text}
              </span>
              <h2 className="text-xl font-bold text-rose-950 mt-1">
                {risk.alert_title}
              </h2>
            </div>
          </div>
          <a
            href="tel:911"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition"
          >
            <PhoneCall className="w-4 h-4" /> Call Emergency Services (911 / 112)
          </a>
        </div>

        <p className="text-rose-900 text-sm leading-relaxed font-medium">
          {risk.alert_message}
        </p>

        {risk.reasons && risk.reasons.length > 0 && (
          <div className="bg-white/80 rounded-xl p-3.5 border border-rose-200">
            <div className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">
              Detected Emergency Red Flags:
            </div>
            <ul className="list-disc list-inside text-xs text-rose-800 space-y-1">
              {risk.reasons.map((reason, idx) => (
                <li key={idx} className="font-semibold">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-rose-100/70 rounded-xl p-3 text-xs text-rose-900 font-medium border border-rose-200">
          <strong>Recommended Action:</strong> {risk.recommended_action}
        </div>
      </div>
    );
  }

  if (isModerate) {
    return (
      <div className="rounded-2xl bg-amber-50 p-5 border border-amber-300 shadow-sm space-y-3">
        <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
              {risk.badge_text}
            </span>
            <h3 className="text-lg font-bold text-amber-950 mt-0.5">{risk.alert_title}</h3>
          </div>
        </div>
        <p className="text-amber-900 text-sm leading-relaxed">
          {risk.alert_message}
        </p>
        <div className="bg-white/80 rounded-xl p-3 text-xs text-amber-900 border border-amber-200">
          <strong>Next Steps:</strong> {risk.recommended_action}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-600 text-white">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
            {risk.badge_text}
          </span>
          <p className="text-xs text-emerald-900 mt-1">{risk.alert_message}</p>
        </div>
      </div>
    </div>
  );
}
