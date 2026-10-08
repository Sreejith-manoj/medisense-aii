import React from 'react';
import { Stethoscope, ShieldCheck, Activity } from 'lucide-react';

export default function ProjectHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3.5 md:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/20">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Symptom-to-Information Assistant
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                NLP & RAG Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Intelligent Health Information & Clinical Urgency Decision Support
            </p>
          </div>
        </div>

        {/* System Status Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Validated Medical Knowledge Base</span>
        </div>
      </div>
    </header>
  );
}
