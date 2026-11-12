import React from 'react';
import { Sparkles, TrendingUp, Lightbulb, CheckCircle2, Zap, BarChart3, Database, ShieldCheck, Activity } from 'lucide-react';
import DataQualityBadge from '../components/DataQualityBadge';
import AgentWorkflowTracker from '../components/AgentWorkflowTracker';

export default function DashboardPage({ dataset, profile, analysis, onRunPipeline, isAnalyzing, theme }) {
  const isLight = theme === 'light';

  if (!dataset) {
    return (
      <div className={`p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'glass-panel border-slate-800 text-slate-300'
      }`}>
        <Database className="w-12 h-12 mx-auto mb-3 text-blue-500/40 animate-pulse" />
        <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>No Dataset Loaded</h3>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a 1-click sample or upload a dataset to view its executive dashboard.
        </p>
      </div>
    );
  }

  const domain = analysis?.domain_category || 'General';
  const kpis = analysis?.kpis || {};
  const insights = analysis?.top_insights || [];
  const recommendations = analysis?.recommendations || [];
  const qualityScore = profile?.quality_score || 100.0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Multi-Agent Orchestration Stepper */}
      <AgentWorkflowTracker
        completedSteps={analysis ? ['Ingestion', 'Profiling', 'Cleaning', 'Analysis', 'Visualization', 'Insight', 'Report', 'Chat Engine'] : ['Ingestion', 'Profiling']}
        isRunning={isAnalyzing}
      />

      {/* Hero Overview Card */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden flex items-center justify-between flex-wrap gap-4 transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-blue-200 text-slate-900 shadow-sm'
          : 'glass-panel border-slate-800 text-white'
      }`}>
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Domain: {domain}
            </span>
            <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {dataset.row_count?.toLocaleString()} Rows × {dataset.column_count} Columns
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {dataset.filename}
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Autonomous Multi-Agent AI Executive Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <DataQualityBadge score={qualityScore} />
          {!analysis && (
            <button
              onClick={() => onRunPipeline(dataset.id)}
              disabled={isAnalyzing}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all glow-blue hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>Run 8-Agent AI Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* Computed KPIs Grid */}
      {Object.keys(kpis).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}>
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Domain Calculated Metrics & KPIs
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Auto-calculated by AnalysisAgent</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(kpis).slice(0, 4).map(([key, value]) => (
              <div key={key} className={`p-5 rounded-2xl border transition-all duration-300 group ${
                isLight ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400' : 'glass-panel border-slate-800 hover:border-blue-500/40'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block truncate group-hover:text-blue-500 transition-colors ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {key.replace(/_/g, ' ')}
                </span>
                <div className={`text-2xl font-black mt-1.5 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 mt-2.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Computed Domain Metric</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Findings & Strategic Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights Card */}
        <div className={`p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800'
        }`}>
          <div className={`flex items-center justify-between mb-4 border-b pb-3 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  AI Analytical Findings & Trends
                </h3>
                <p className="text-[11px] text-slate-400">Extracted by InsightAgent</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
              InsightAgent
            </span>
          </div>

          {insights.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Run the 8-agent pipeline to generate analytical insights.</p>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/60 border-slate-800 text-slate-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Card */}
        <div className={`p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800'
        }`}>
          <div className={`flex items-center justify-between mb-4 border-b pb-3 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Strategic Recommendations
                </h3>
                <p className="text-[11px] text-slate-400">Actionable executive decision plan</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
              Action Plan
            </span>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Run the 8-agent pipeline to generate strategic recommendations.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/60 border-slate-800 text-slate-200'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans">{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
