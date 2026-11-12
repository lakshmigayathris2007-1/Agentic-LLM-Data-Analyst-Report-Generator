import React from 'react';
import { FileText, Download, CheckCircle2, Sparkles, FileSpreadsheet, Layers, ShieldCheck, Database } from 'lucide-react';
import { downloadReportUrl } from '../services/api';

export default function ReportsPage({ dataset, analysis, onRunPipeline, isAnalyzing, theme }) {
  const isLight = theme === 'light';

  if (!dataset) {
    return (
      <div className={`p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'glass-panel border-slate-800 text-slate-300'
      }`}>
        <FileText className="w-12 h-12 mx-auto mb-3 text-blue-500/40 animate-pulse" />
        <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>No Dataset Selected</h3>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a 1-click sample or upload a dataset to view and download executive reports.
        </p>
      </div>
    );
  }

  const pdfFilename = analysis?.pdf_filename || `report_${dataset.id}.pdf`;
  const docxFilename = analysis?.docx_filename || `report_${dataset.id}.docx`;

  const insights = analysis?.top_insights || [];
  const recommendations = analysis?.recommendations || [];
  const kpis = analysis?.kpis || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex items-center justify-between flex-wrap gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
      }`}>
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Step 7: ReportAgent Document Compiler
          </span>
          <h2 className={`text-2xl font-black mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Executive PDF & Word DOCX Reports
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            ReportLab PDF & python-docx compiler producing corporate document deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={downloadReportUrl(pdfFilename)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all glow-blue hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </a>

          <a
            href={downloadReportUrl(docxFilename)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download DOCX Report</span>
          </a>
        </div>
      </div>

      {/* Report Structure Live Preview Box */}
      <div className={`p-8 rounded-3xl border space-y-6 shadow-xl relative overflow-hidden ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'glass-panel border-slate-800 text-white'
      }`}>
        <div className={`border-b pb-4 flex items-center justify-between flex-wrap gap-3 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-mono font-extrabold tracking-wider text-blue-500 uppercase">
              Automated Corporate Deliverable
            </span>
            <h3 className={`text-xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Executive Analytics Report — {dataset.filename}
            </h3>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            PDF & DOCX Ready
          </span>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            1. Executive Summary
          </h4>
          <p className={`text-xs leading-relaxed p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}>
            This automated executive report presents quantitative findings for dataset <b className={isLight ? 'text-slate-900' : 'text-white'}>{dataset.filename}</b>.
            Categorized under domain <b className="text-blue-500">'{analysis?.domain_category || 'General'}'</b> containing <span className="font-mono">{dataset.row_count?.toLocaleString()}</span> records across <span className="font-mono">{dataset.column_count}</span> attribute columns.
          </p>
        </div>

        {/* Section 2: Computed KPIs */}
        <div className="space-y-2">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            2. Calculated KPIs & Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(kpis).map(([k, v]) => (
              <div key={k} className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <span className={`text-[10px] uppercase font-bold block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {k.replace(/_/g, ' ')}
                </span>
                <span className={`text-base font-black font-mono mt-1 block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Insights */}
        <div className="space-y-2">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            3. Key Analytical Insights
          </h4>
          <div className="space-y-2">
            {insights.map((ins, idx) => (
              <div key={idx} className={`flex items-start gap-3 text-xs p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span className="font-sans">{ins}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recommendations */}
        <div className="space-y-2">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            4. Strategic Business Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`flex items-start gap-3 text-xs p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-sans">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
