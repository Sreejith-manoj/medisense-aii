import React from 'react';
import { ArrowRight, CheckCircle2, Circle, Clock, MessageSquare, Database, ShieldAlert, Cpu, Layers } from 'lucide-react';

export default function PipelineFlowchart({ stages }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">NLP & RAG System Processing Pipeline</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          5-Stage Automated Workflow
        </span>
      </div>

      {/* Flowchart Nodes Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'completed';
          const isPending = stage.status === 'pending';

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{stage.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{stage.detail}</p>
              </div>

              {idx < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full border border-slate-200 shadow-xs">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
