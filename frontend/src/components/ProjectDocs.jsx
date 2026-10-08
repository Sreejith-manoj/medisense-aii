import React from 'react';
import { BookOpen, Cpu, ShieldCheck, Database, Brain, Layers, CheckCircle2 } from 'lucide-react';

export default function ProjectDocs() {
  const aiComponents = [
    { title: "1. Natural Language Processing (NLP)", desc: "Parses free-text symptom descriptions into canonical clinical entities, body locations, duration, onset, and quality slots.", icon: Brain },
    { title: "2. Machine Learning Urgency Classification", desc: "Trained Scikit-Learn Random Forest Classifier that predicts urgency level (LOW, MODERATE, HIGH, EMERGENCY) with empirical validation metrics.", icon: Cpu },
    { title: "3. Vector RAG Retrieval & Similarity Search", desc: "TF-IDF + Cosine Vector Similarity indexing for top-K medical document retrieval across 10 validated healthcare categories.", icon: Database },
    { title: "4. Explainable AI (XAI) & Feature Attribution", desc: "Provides transparent feature contribution percentages explaining why the model predicted the specific urgency class.", icon: Layers },
    { title: "5. Adaptive Questioning Engine", desc: "Dynamically selects follow-up questions based on missing clinical slots, with explicit 'Why am I asking this?' rationale.", icon: CheckCircle2 },
    { title: "6. Emergency Safety Triage Matrix", desc: "Rule-based red-flag screening detecting severe cardiovascular, stroke, respiratory, and neurological warning signs.", icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          MediSense AI Project Specification & Architecture
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
          Project Problem Statement & Solution Overview
        </h2>
        <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
          <p>
            <strong>Problem Statement:</strong> Access to understandable, evidence-grounded health information is frequently hindered by complex medical jargon, unstructured web searches returning conflicting advice, and long clinical consultation queues.
          </p>
          <p>
            <strong>Proposed Solution:</strong> MediSense AI is a human-centered decision support system that converts natural-language symptom descriptions into structured clinical entities, asks adaptive follow-up questions, classifies urgency using a trained Scikit-Learn ML model, retrieves grounded medical passages using Vector RAG, and provides transparent explainable reasoning.
          </p>
        </div>
      </div>

      {/* AI Components Used Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600" /> AI/ML Components Used in MediSense AI
        </h3>
        <p className="text-xs text-slate-500">Evaluator overview of core artificial intelligence techniques integrated into this project:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {aiComponents.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{comp.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{comp.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
