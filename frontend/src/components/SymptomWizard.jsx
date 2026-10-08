import React from 'react';
import { HelpCircle, Info, CheckCircle2 } from 'lucide-react';

export default function SymptomWizard({ questions, userAnswers, onOptionSelect, onSubmit, onReset, loading }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Adaptive Context Questionnaire
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Dynamic Information Gathering
          </h3>
        </div>
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              <span className="text-sky-700 font-extrabold mr-2">Q{idx + 1}.</span>
              {q.question}
            </label>

            {/* Explicit Clinical Rationale: "Why am I asking this?" */}
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Why am I asking this?</strong> {q.reason || "This clinical factor helps narrow down potential reference topics and assess urgency risk."}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {q.options.map((opt, optIdx) => {
                const isSelected = userAnswers[q.id] === opt;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => onOptionSelect(q.id, opt)}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold border-sky-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-sky-500 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
          Cancel & Start Over
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition"
        >
          Run ML Classification & Vector RAG ➔
        </button>
      </div>
    </div>
  );
}
