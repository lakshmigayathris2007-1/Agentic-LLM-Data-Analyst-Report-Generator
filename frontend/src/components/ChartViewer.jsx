import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Maximize2, X, Download } from 'lucide-react';

export default function ChartViewer({ spec, height = 340 }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!spec) return null;

  const baseLayout = {
    autosize: true,
    height: isFullscreen ? 550 : height,
    margin: { l: 50, r: 30, t: 45, b: 50 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#94a3b8', family: 'Inter, sans-serif' },
    title: { text: spec.title || '', font: { color: '#f8fafc', size: 15, weight: 700 } },
    xaxis: { gridcolor: '#1e293b', zerolinecolor: '#334155', ...(spec.layout?.xaxis || {}) },
    yaxis: { gridcolor: '#1e293b', zerolinecolor: '#334155', ...(spec.layout?.yaxis || {}) },
    ...(spec.layout || {})
  };

  return (
    <>
      <div className="w-full glass-panel rounded-2xl p-4 relative group hover:border-blue-500/40 transition-all duration-300">
        {/* Floating Action Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <Plot
          data={spec.data || []}
          layout={baseLayout}
          config={{ 
            responsive: true, 
            displayModeBar: true, 
            displaylogo: false, 
            modeBarButtonsToRemove: ['lasso2d', 'select2d'] 
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-5xl glass-panel rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {spec.type || 'Plotly'} Interactive Chart
                </span>
                <h3 className="text-lg font-black text-white mt-1">{spec.title || 'Chart Details'}</h3>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Plot
              data={spec.data || []}
              layout={baseLayout}
              config={{ responsive: true, displayModeBar: true, displaylogo: false }}
              style={{ width: '100%', height: '550px' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
