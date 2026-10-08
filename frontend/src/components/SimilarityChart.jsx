import React from 'react';
import { BarChart3, Database, Check } from 'lucide-react';

export default function SimilarityChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Vector Similarity Search Analytics</h3>
        </div>
        <span className="text-xs font-medium text-slate-500">TF-IDF & Cosine Metric</span>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const scorePercent = Math.min(Math.max(item.score, 5), 100);

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{item.title}</span>
                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {scorePercent}% Match Confidence
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-teal-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Category: {item.category}</span>
                <span>Source: {item.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
