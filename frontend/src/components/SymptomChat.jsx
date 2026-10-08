import React, { useState } from 'react';
import { Send, RefreshCw, BookOpen, AlertCircle, HeartPulse, Download, FileCheck, ExternalLink, Sparkles } from 'lucide-react';
import AvatarAssistant from './AvatarAssistant';
import SymptomWizard from './SymptomWizard';
import PipelineVisualizer from './PipelineVisualizer';
import ExplainableDashboard from './ExplainableDashboard';
import RiskAlertBanner from './RiskAlertBanner';
import SimilarityChart from './SimilarityChart';
import UrgencyGauge from './UrgencyGauge';
import { analyzeSymptoms, synthesizeRAG, generateDoctorReport } from '../services/api';
import { downloadDoctorReportPDF } from '../services/pdfExporter';

const EXAMPLE_QUERIES = [
  { label: "Migraine & Photophobia", text: "I have a throbbing headache on one side of my head that started yesterday. Light hurts my eyes and I feel slightly nauseous." },
  { label: "Chest Pressure & Arm Pain (Emergency Red Flag)", text: "I have sudden severe chest pain and squeezing pressure radiating to my left arm and cold sweating." },
  { label: "Sore Throat & Fever", text: "I have a scratchy sore throat, low fever around 100°F, runny nose, and body aches for 2 days." },
  { label: "Stomach Cramps & Nausea", text: "I'm having abdominal cramps, nausea, and watery diarrhea since last night." }
];

export default function SymptomChat({ onOpenDoctorReport, onOpenDemoMode }) {
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('IDLE'); // IDLE, FOLLOW_UP, RESULT
  const [avatarState, setAvatarState] = useState('IDLE');
  const [avatarMessage, setAvatarMessage] = useState('Hello! Describe how you feel in your own words, and I will parse your symptoms and retrieve grounded medical evidence.');

  const [analysisData, setAnalysisData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [ragResult, setRagResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleInitialSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoading(true);
    setAvatarState('THINKING');
    setAvatarMessage('Analyzing natural language symptoms and mapping clinical entities...');
    setErrorMsg(null);

    try {
      const nlpData = await analyzeSymptoms(symptomInput.trim());
      setAnalysisData(nlpData);

      if (nlpData.adaptive_questions && nlpData.adaptive_questions.length > 0 && !nlpData.parsed_entities.is_complete) {
        setStage('FOLLOW_UP');
        setAvatarState('ASKING');
        setAvatarMessage(`I extracted ${nlpData.parsed_entities.extracted_symptoms.length} symptom terms. I need a little more clinical context to refine vector retrieval.`);
      } else {
        await executeRAGSynthesis(symptomInput.trim(), {});
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error connecting to assistant backend.');
      setAvatarState('WARNING');
      setAvatarMessage('An error occurred connecting to the backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    setLoading(true);
    setAvatarState('PROCESSING');
    setAvatarMessage('Running Scikit-Learn ML classifier, screening emergency red flags, and indexing Vector RAG passages...');
    setErrorMsg(null);

    try {
      await executeRAGSynthesis(symptomInput.trim(), userAnswers);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete RAG synthesis.');
      setAvatarState('WARNING');
    } finally {
      setLoading(false);
    }
  };

  const executeRAGSynthesis = async (initialText, contextAnswers) => {
    const result = await synthesizeRAG(initialText, contextAnswers);
    setRagResult(result);
    setStage('RESULT');

    if (result.risk_assessment.urgency_level === 'EMERGENCY') {
      setAvatarState('WARNING');
      setAvatarMessage('ATTENTION: Emergency red flags detected! Please seek immediate emergency medical evaluation.');
    } else {
      setAvatarState('RESPONDING');
      setAvatarMessage(`Analysis complete! Matched ${result.retrieved_passages.length} evidence passages with ${result.ml_prediction.confidence_score}% ML confidence.`);
    }
  };

  const handleReset = () => {
    setSymptomInput('');
    setStage('IDLE');
    setAnalysisData(null);
    setUserAnswers({});
    setRagResult(null);
    setErrorMsg(null);
    setAvatarState('IDLE');
    setAvatarMessage('Hello! Describe how you feel in your own words, and I will parse your symptoms and retrieve grounded medical evidence.');
  };

  const handleOptionSelect = (qId, optionVal) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionVal
    }));
  };

  const handleDirectPdfDownload = async () => {
    try {
      const report = await generateDoctorReport({
        initial_text: symptomInput,
        extracted_symptoms: analysisData?.parsed_entities?.extracted_symptoms || [],
        context: userAnswers,
        risk_assessment: ragResult.risk_assessment,
        ml_prediction: ragResult.ml_prediction,
        rag_synthesis: ragResult.rag_synthesis
      });
      downloadDoctorReportPDF(report);
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Human-Like Assistant Avatar Header */}
      <AvatarAssistant state={avatarState} message={avatarMessage} />

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 8-Stage Animated Pipeline Indicator */}
      <PipelineVisualizer
        stages={
          ragResult?.pipeline_stages ||
          analysisData?.pipeline_stages || [
            { id: "01", name: "User Input", status: stage === 'IDLE' ? 'pending' : 'completed', detail: "Awaiting description" },
            { id: "02", name: "NLP Processing", status: stage !== 'IDLE' ? 'completed' : 'pending', detail: "Extract entity terms" },
            { id: "03", name: "Context Understanding", status: stage === 'FOLLOW_UP' ? 'active' : (stage === 'RESULT' ? 'completed' : 'pending'), detail: "Slot verification" },
            { id: "04", name: "Adaptive Questions", status: stage === 'FOLLOW_UP' ? 'active' : (stage === 'RESULT' ? 'completed' : 'pending'), detail: "Gather clinical details" },
            { id: "05", name: "ML Classification", status: stage === 'RESULT' ? 'completed' : 'pending', detail: "RF Model triage" },
            { id: "06", name: "Safety Check", status: stage === 'RESULT' ? 'completed' : 'pending', detail: "Screen red flags" },
            { id: "07", name: "Vector Search", status: stage === 'RESULT' ? 'completed' : 'pending', detail: "Top-K retrieval" },
            { id: "08", name: "Explainable Response", status: stage === 'RESULT' ? 'completed' : 'pending', detail: "Response synthesis" }
          ]
        }
      />

      {/* STAGE 1: Input Form */}
      {stage === 'IDLE' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <label className="block text-sm font-bold text-slate-900">
              Describe your symptoms in everyday language:
            </label>
            <div className="space-y-3">
              <textarea
                value={symptomInput}
                onChange={(e) => {
                  setSymptomInput(e.target.value);
                  if (avatarState === 'IDLE') setAvatarState('LISTENING');
                }}
                placeholder="Example: 'I've had a throbbing headache on the right side for two days, and bright light makes it worse...'"
                rows={4}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 rounded-xl p-4 text-slate-900 text-sm resize-none transition outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Be as clear as possible regarding duration, pain location, and intensity.
                </span>
                <button
                  type="submit"
                  disabled={loading || !symptomInput.trim()}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md shadow-sky-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing NLP...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Analyze Symptoms
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Or Select a Sample Symptom Scenario to Test:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMPLE_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSymptomInput(item.text);
                    setAvatarState('LISTENING');
                  }}
                  className="text-left bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-1 group"
                >
                  <div className="font-bold text-sky-700 text-xs flex items-center justify-between">
                    <span>{item.label}</span>
                    <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="line-clamp-2 text-slate-600 text-xs leading-relaxed">{item.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: Adaptive Question Engine */}
      {stage === 'FOLLOW_UP' && analysisData && (
        <SymptomWizard
          questions={analysisData.adaptive_questions}
          userAnswers={userAnswers}
          onOptionSelect={handleOptionSelect}
          onSubmit={handleFollowUpSubmit}
          onReset={handleReset}
          loading={loading}
        />
      )}

      {/* STAGE 3: Grounded Synthesis & Analytics Results */}
      {stage === 'RESULT' && ragResult && (
        <div className="space-y-6">
          {/* Risk Alert Banner */}
          <RiskAlertBanner risk={ragResult.risk_assessment} />

          {/* Visual Urgency Gauge & Similarity Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UrgencyGauge
                score={ragResult.risk_assessment.urgency_score}
                level={ragResult.risk_assessment.urgency_level}
              />
            </div>
            <div className="lg:col-span-2">
              <SimilarityChart data={ragResult.chart_similarity_data} />
            </div>
          </div>

          {/* Explainable AI Dashboard */}
          <ExplainableDashboard
            nlpData={ragResult.parsed_entities}
            mlData={ragResult.ml_prediction}
            riskData={ragResult.risk_assessment}
            ragData={ragResult.rag_synthesis}
          />

          {/* Human-Centered Structured Results Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Grounded Evidence Presentation
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  Synthesized Health Information
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDirectPdfDownload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <Download className="w-4 h-4 text-sky-400" /> Download PDF Report
                </button>
                <button
                  onClick={() => onOpenDoctorReport(symptomInput, analysisData?.parsed_entities?.extracted_symptoms || [], userAnswers, ragResult.risk_assessment, ragResult.ml_prediction, ragResult.rag_synthesis)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <FileCheck className="w-4 h-4" /> View Doctor Report Modal
                </button>
              </div>
            </div>

            {/* Structured Human-Centered View */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider">What I Understood:</h4>
                <p className="text-xs text-slate-700">
                  You described symptoms consistent with <strong>{analysisData?.parsed_entities?.extracted_symptoms?.join(', ') || 'general symptoms'}</strong>. Body location: <em>{analysisData?.parsed_entities?.body_location}</em>.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Relevant Educational Information:
                </div>
                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {ragResult.rag_synthesis.grounded_text}
                </div>
              </div>

              {/* Self-Care */}
              {ragResult.rag_synthesis.home_self_care && ragResult.rag_synthesis.home_self_care.length > 0 && (
                <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-emerald-600" /> What You Can Discuss With a Healthcare Professional:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-emerald-950 font-medium">
                    {ragResult.rag_synthesis.home_self_care.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Validated Medical Reference Sources:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ragResult.rag_synthesis.sources.map((src, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-700">{src.citation_tag}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          {src.relevance_score} Similarity
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{src.title}</div>
                      <div className="text-xs text-slate-500 font-normal">{src.evidence_excerpt}</div>
                      <div className="text-slate-500 text-xs flex items-center justify-between border-t border-slate-200 pt-2">
                        <span>Source: {src.source_name}</span>
                        <a href={src.url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline flex items-center gap-1 font-semibold">
                          Reference Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Non-Diagnostic Disclaimer:</strong> MediSense AI provides health educational information based on RAG retrieval and is NOT a medical diagnosis. Consult a qualified doctor for healthcare decisions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
