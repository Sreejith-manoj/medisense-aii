import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Cpu, ShieldCheck, Database, FileText } from 'lucide-react';

export default function ExplainableDashboard({ nlpData, mlData, riskData, ragData }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!nlpData && !mlData) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between border-b border-slate-200 transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Explainable AI Analysis & Reasoning Breakdown</h3>
            <p className="text-xs text-slate-500">Inspect how NLP, ML Classifier, Safety Matrix, and RAG worked together</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            XAI Transparent Output
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. NLP Entity Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700">
                1. NLP Entity Parsing
              </div>
              <div><strong>Primary Category:</strong> {nlpData?.primary_category || 'General'}</div>
              <div><strong>Extracted Terms:</strong> {nlpData?.extracted_symptoms?.join(', ') || 'None'}</div>
              <div><strong>Body Location:</strong> {nlpData?.body_location || 'Unspecified'}</div>
              <div><strong>Quality:</strong> {nlpData?.quality || 'Unspecified'}</div>
              <div><strong>Completeness:</strong> {nlpData?.completeness_score}%</div>
            </div>

            {/* 2. ML Classifier Prediction */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-700">
                2. ML Urgency Classifier
              </div>
              <div><strong>Model:</strong> {mlData?.model_name || 'Random Forest'}</div>
              <div><strong>Predicted Urgency:</strong> <span className="font-bold text-indigo-700">{mlData?.predicted_urgency}</span></div>
              <div><strong>Educational Model Confidence:</strong> {mlData?.confidence_score}%</div>
              <div className="pt-1 border-t border-slate-200 text-slate-600">
                <strong>Attribution Explanations:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {mlData?.feature_explanations?.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Safety Screening & RAG */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
                3. Safety Triage & Vector RAG
              </div>
              <div><strong>Emergency Triage Tier:</strong> {riskData?.urgency_level}</div>
              <div><strong>Clinical Urgency Score:</strong> {riskData?.urgency_score}/100</div>
              <div><strong>Matched Reference Topic:</strong> {ragData?.primary_condition}</div>
              <div><strong>Top Similarity Score:</strong> {ragData?.top_similarity_score ? int(ragData.top_similarity_score*100) : 0}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
