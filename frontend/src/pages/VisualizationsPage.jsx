import React, { useState } from 'react';
import { Sparkles, BarChart2, Filter, Layers, LayoutGrid, Database } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';

export default function VisualizationsPage({ dataset, analysis, onRunPipeline, isAnalyzing, theme }) {
  const isLight = theme === 'light';
  const [filterType, setFilterType] = useState('all');

  if (!dataset) {
    return (
      <div className={`p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'glass-panel border-slate-800 text-slate-300'
      }`}>
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-blue-500/40 animate-pulse" />
        <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>No Dataset Selected</h3>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a 1-click sample or upload a dataset to generate interactive charts.
        </p>
      </div>
    );
  }

  const plotlySpecs = analysis?.plotly_specs || [];
  const chartTypes = ['all', ...new Set(plotlySpecs.map(s => s.type).filter(Boolean))];
  const filteredSpecs = filterType === 'all' ? plotlySpecs : plotlySpecs.filter(s => s.type === filterType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex items-center justify-between flex-wrap gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
      }`}>
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Step 5: VisualizationAgent
          </span>
          <h2 className={`text-2xl font-black mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Interactive Visualizations & Chart Studio
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Renders interactive Plotly charts (Bar, Pie, Line, Scatter, Heatmap) and generates high-resolution figures.
          </p>
        </div>

        {plotlySpecs.length === 0 ? (
          <button
            onClick={() => onRunPipeline(dataset.id)}
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all glow-blue"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Charts via VisualizationAgent</span>
          </button>
        ) : (
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <Filter className="w-3.5 h-3.5 text-blue-500 ml-2" />
            <div className="flex items-center gap-1">
              {chartTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterType === t 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Grid */}
      {plotlySpecs.length === 0 ? (
        <div className={`p-16 text-center rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-500 shadow-sm' : 'glass-panel border-slate-800 text-slate-400'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-500">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            No Charts Generated Yet
          </h3>
          <p className={`text-xs mt-1.5 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Click "Generate Charts" above to execute VisualizationAgent to create interactive Plotly visualizations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSpecs.map((spec, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className={`font-extrabold capitalize flex items-center gap-1.5 ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  {spec.type || 'Chart'} #{idx + 1}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Interactive Plotly
                </span>
              </div>
              <ChartViewer spec={spec} height={360} theme={theme} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
