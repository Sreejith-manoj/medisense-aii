import React, { useState } from 'react';
import ProjectHeader from './components/ProjectHeader';
import SymptomChat from './components/SymptomChat';
import ModelPerformance from './components/ModelPerformance';
import SimulationMode from './components/SimulationMode';
import KnowledgeExplorer from './components/KnowledgeExplorer';
import ProjectDocs from './components/ProjectDocs';
import DoctorReportModal from './components/DoctorReportModal';
import { generateDoctorReport } from './services/api';
import { Activity, BarChart3, TestTube, Database, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('ASSISTANT'); // ASSISTANT, MODEL, SIMULATION, KNOWLEDGE, DOCS
  const [reportModalData, setReportModalData] = useState(null);

  const handleOpenDoctorReport = async (initialText, extractedSymptoms, context, riskAssessment, mlPrediction, ragSynthesis) => {
    try {
      const report = await generateDoctorReport({
        initial_text: initialText,
        extracted_symptoms: extractedSymptoms,
        context,
        risk_assessment: riskAssessment,
        ml_prediction: mlPrediction || {},
        rag_synthesis: ragSynthesis
      });
      setReportModalData(report);
    } catch (err) {
      console.error(err);
      alert("Failed to generate doctor report: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <ProjectHeader />

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 no-scrollbar">
          <button
            onClick={() => setActiveTab('ASSISTANT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'ASSISTANT'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Symptom Assistant & Persona
          </button>
          <button
            onClick={() => setActiveTab('MODEL')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'MODEL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Model Performance & ML Metrics
          </button>
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'SIMULATION'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <TestTube className="w-4 h-4" /> 10-Scenario Test Evaluator
          </button>
          <button
            onClick={() => setActiveTab('KNOWLEDGE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'KNOWLEDGE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> Medical Knowledge Explorer
          </button>
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'DOCS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Project AI Architecture
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1">
        {activeTab === 'ASSISTANT' && (
          <SymptomChat
            onOpenDoctorReport={handleOpenDoctorReport}
            onOpenDemoMode={() => setActiveTab('SIMULATION')}
          />
        )}

        {activeTab === 'MODEL' && (
          <ModelPerformance />
        )}

        {activeTab === 'SIMULATION' && (
          <SimulationMode />
        )}

        {activeTab === 'KNOWLEDGE' && (
          <KnowledgeExplorer />
        )}

        {activeTab === 'DOCS' && (
          <ProjectDocs />
        )}
      </main>

      {/* Doctor Report Modal */}
      {reportModalData && (
        <DoctorReportModal
          reportData={reportModalData}
          onClose={() => setReportModalData(null)}
        />
      )}

      {/* Footnote */}
      <footer className="border-t border-slate-200 bg-white py-5 px-4 md:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>MediSense AI</strong> • Human-Centered Symptom Intelligence & Medical Information Assistant
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Educational Decision Support Prototype
          </div>
        </div>
      </footer>
    </div>
  );
}
