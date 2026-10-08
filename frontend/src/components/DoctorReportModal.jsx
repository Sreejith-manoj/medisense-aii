import React from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { downloadDoctorReportPDF } from '../services/pdfExporter';

export default function DoctorReportModal({ reportData, onClose }) {
  if (!reportData) return null;

  const handleDownloadPDF = () => {
    downloadDoctorReportPDF(reportData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative border border-slate-200 shadow-xl">
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-base">
            <FileText className="w-5 h-5" /> Doctor Consultation Summary Report
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Download className="w-4 h-4" /> Download / Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View */}
        <div className="space-y-5 bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-800">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                DOCTOR CONSULTATION SUMMARY REPORT
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI Symptom-to-Information Assistant • Decision Support System
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div><strong>Report ID:</strong> {reportData.report_id}</div>
              <div><strong>Date:</strong> {reportData.date_generated}</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              Chief Patient Complaint:
            </h4>
            <p className="text-sm bg-white p-3.5 rounded-xl border border-slate-200 text-slate-900 font-medium">
              "{reportData.chief_complaint}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Identified Clinical Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                {reportData.identified_symptom_entities?.map((sym, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200">
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Patient Context:</span>
              <ul className="space-y-1 text-slate-700">
                {Object.entries(reportData.clinical_context || {}).map(([k, v], idx) => (
                  <li key={idx}><strong>{k}:</strong> {v}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
            <div className="font-bold text-slate-900">Urgency Assessment:</div>
            <div className="text-sm font-bold text-sky-700">{reportData.urgency_classification} ({reportData.urgency_score || 0}/100 Index)</div>
            <div className="text-slate-600">Triggers: {reportData.risk_reasons?.join(', ')}</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900">Matched Health Reference Topics:</div>
            <ul className="list-disc list-inside text-slate-700 space-y-0.5">
              {reportData.reference_citations?.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Provider Notice:</strong> {reportData.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
