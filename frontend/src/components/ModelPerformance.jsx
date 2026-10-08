import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Database, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { fetchModelPerformance } from '../services/api';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const data = await fetchModelPerformance();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500 text-sm">Loading ML Model Metrics...</div>;
  if (!metrics) return null;

  const lr = metrics.models?.logistic_regression;
  const rf = metrics.models?.random_forest;
  const classes = metrics.dataset_info?.classes || ['LOW', 'MODERATE', 'HIGH', 'EMERGENCY'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Scikit-Learn Machine Learning Evaluation Engine
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              Machine Learning Model Performance & Metrics
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Empirical evaluation metrics trained on a synthetic clinical dataset (80/20 train/test split, 12 feature columns). Compares Logistic Regression against Random Forest Classifier.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-700">
            {metrics.dataset_info?.total_samples} Training Scenarios
          </div>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Dataset</div>
          <div className="text-xl font-extrabold text-slate-900">{metrics.dataset_info?.total_samples} Scenarios</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Train / Test Split</div>
          <div className="text-xl font-extrabold text-indigo-600">{metrics.dataset_info?.train_samples} / {metrics.dataset_info?.test_samples}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Feature Vector</div>
          <div className="text-xl font-extrabold text-slate-900">{metrics.dataset_info?.features_count} Features</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Selected Model</div>
          <div className="text-xl font-extrabold text-emerald-600">Random Forest</div>
        </div>
      </div>

      {/* Algorithm Comparison Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Empirical Model Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <th className="p-3">Algorithm</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision (Weighted)</th>
                <th className="p-3">Recall (Weighted)</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="bg-emerald-50/40 font-bold">
                <td className="p-3 text-slate-900">{rf?.name}</td>
                <td className="p-3 text-emerald-700 font-extrabold">{int(rf?.accuracy * 100)}%</td>
                <td className="p-3">{rf?.precision}</td>
                <td className="p-3">{rf?.recall}</td>
                <td className="p-3 text-emerald-700 font-extrabold">{rf?.f1_score}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">SELECTED</span></td>
              </tr>
              <tr>
                <td className="p-3 text-slate-700">{lr?.name}</td>
                <td className="p-3 text-indigo-700 font-bold">{int(lr?.accuracy * 100)}%</td>
                <td className="p-3">{lr?.precision}</td>
                <td className="p-3">{lr?.recall}</td>
                <td className="p-3">{lr?.f1_score}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">COMPARISON</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Table */}
      {rf?.confusion_matrix && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Random Forest Confusion Matrix (Test Set)
          </h3>
          <p className="text-xs text-slate-500">Rows represent actual ground truth classes; columns represent model predicted classes.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <th className="p-2.5 border border-slate-200">Actual \ Predicted</th>
                  {classes.map((cls, i) => (
                    <th key={i} className="p-2.5 border border-slate-200">{cls}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium">
                {rf.confusion_matrix.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold bg-slate-50 text-slate-800 border border-slate-200">{classes[rIdx]}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className={`p-2.5 border border-slate-200 font-bold ${rIdx === cIdx ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-xs text-amber-900 space-y-1">
        <strong>Educational ML Model Limitations:</strong> {metrics.limitation_disclaimer}
      </div>
    </div>
  );
}
