import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Activity } from 'lucide-react';
import { fetchSimulationTests } from '../services/api';

export default function SimulationMode() {
  const [suiteData, setSuiteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runSuite();
  }, []);

  const runSuite = async () => {
    setLoading(true);
    try {
      const data = await fetchSimulationTests();
      setSuiteData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Evaluator Test Simulation & Validation Mode
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              10 Pre-Packaged Clinical Test Scenarios
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Allows project evaluators to test predefined clinical symptom scenarios through the complete pipeline (NLP ➔ ML Classifier ➔ Safety Check ➔ Vector RAG ➔ Evidence Ranking).
            </p>
          </div>
          <button
            onClick={runSuite}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Re-Run All 10 Tests
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Executing 10-Scenario Test Pipeline...</div>
      ) : suiteData ? (
        <div className="space-y-6">
          {/* Validation Score Banner */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">Simulation Validation Results</h3>
                <p className="text-xs text-emerald-800 font-medium">Passed {suiteData.passed_tests} of {suiteData.total_tests} test cases ({suiteData.pass_rate_pct}% Pass Rate)</p>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-800">{suiteData.pass_rate_pct}%</div>
          </div>

          {/* Scenarios Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3">Test ID</th>
                    <th className="p-3">Scenario Name</th>
                    <th className="p-3">Input Description</th>
                    <th className="p-3">Extracted Entities</th>
                    <th className="p-3">Urgency (ML / Safety)</th>
                    <th className="p-3">Top RAG Topic</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {suiteData.test_cases.map((tc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{tc.test_id}</td>
                      <td className="p-3 font-bold text-sky-700">{tc.test_name}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">"{tc.input_text}"</td>
                      <td className="p-3 text-slate-500">{tc.extracted_entities.join(', ') || 'General'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          tc.final_urgency === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : (tc.final_urgency === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800')
                        }`}>
                          {tc.final_urgency}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 truncate">{tc.top_retrieved_topic} ({tc.top_similarity}%)</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          {tc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
