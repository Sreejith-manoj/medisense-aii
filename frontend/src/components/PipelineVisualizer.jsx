import React from 'react';
import { Layers, CheckCircle2, Clock, Play } from 'lucide-react';

export default function PipelineVisualizer({ stages }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            MediSense AI End-to-End Execution Pipeline
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">8 Automated Pipeline Stages</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {stages.map((st, idx) => {
          const isDone = st.status === 'completed';
          const isActive = st.status === 'active';

          let bgStyle = 'bg-slate-50 border-slate-200 text-slate-500';
          if (isDone) bgStyle = 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold';
          else if (isActive) bgStyle = 'bg-sky-50 border-sky-300 text-sky-900 ring-2 ring-sky-500/20';

          return (
            <div key={idx} className={`p-2.5 rounded-xl border text-left transition-all ${bgStyle}`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                <span>{st.id}</span>
                {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : (isActive ? <Play className="w-3 h-3 text-sky-600 animate-pulse" /> : <Clock className="w-3 h-3 text-slate-300" />)}
              </div>
              <div className="text-[11px] font-bold leading-tight truncate">{st.name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{st.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
