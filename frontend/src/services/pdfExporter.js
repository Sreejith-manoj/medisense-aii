/**
 * PDF Exporter Service
 * Triggers clean PDF print & file download for doctor consultation summary reports.
 */

export function downloadDoctorReportPDF(reportData) {
  if (!reportData) return;

  // Create an off-screen print frame with formatted document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to download/print the PDF report.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Doctor Consultation Report - ${reportData.report_id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        .ref-box { text-align: right; font-size: 12px; color: #475569; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0284c7; letter-spacing: 0.5px; margin-bottom: 6px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; }
        .grid { display: flex; gap: 15px; margin-bottom: 20px; }
        .col { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }
        .tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; font-weight: bold; }
        .disclaimer { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 12px; border-radius: 8px; font-size: 11px; margin-top: 30px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">DOCTOR CONSULTATION SUMMARY REPORT</h1>
          <div class="subtitle">AI Symptom-to-Information Assistant • Decision-Support Summary</div>
        </div>
        <div class="ref-box">
          <div><strong>Report Ref:</strong> ${reportData.report_id}</div>
          <div><strong>Date:</strong> ${reportData.date_generated}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Chief Patient Complaint (Initial Input):</div>
        <div class="box">"${reportData.chief_complaint}"</div>
      </div>

      <div class="grid">
        <div class="col">
          <div class="section-title">Identified Clinical Entities:</div>
          <div>
            ${(reportData.identified_symptom_entities || []).map(e => `<span class="tag">${e}</span>`).join('')}
          </div>
        </div>
        <div class="col">
          <div class="section-title">Patient Refined Context:</div>
          <ul style="margin: 0; padding-left: 15px;">
            ${Object.entries(reportData.clinical_context || {}).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Clinical Urgency Classification:</div>
        <div class="box">
          <strong>Urgency Tier:</strong> ${reportData.urgency_classification} (${reportData.urgency_score || 0}/100 Index)<br>
          <strong>Detected Factors:</strong> ${(reportData.risk_reasons || []).join(', ')}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Matched Health Knowledge Base Topics:</div>
        <div class="box">
          <ul style="margin: 0; padding-left: 15px;">
            ${(reportData.reference_citations || []).map(ref => `<li>${ref}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="disclaimer">
        <strong>Notice to Healthcare Provider:</strong> ${reportData.disclaimer}
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
