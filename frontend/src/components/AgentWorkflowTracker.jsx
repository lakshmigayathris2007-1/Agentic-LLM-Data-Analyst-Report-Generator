import React from 'react';
import { CheckCircle2, Loader2, Circle, Sparkles, Cpu } from 'lucide-react';

export default function AgentWorkflowTracker({ completedSteps = [], isRunning = false }) {
  const agents = [
    { name: 'IngestionAgent', stepKey: 'Ingestion', label: '1. Ingestion', desc: 'Format & Storage' },
    { name: 'ProfilingAgent', stepKey: 'Profiling', label: '2. Profiling', desc: 'Types & Quality Score' },
    { name: 'CleaningAgent', stepKey: 'Cleaning', label: '3. Cleaning', desc: 'Missing & Outliers' },
    { name: 'AnalysisAgent', stepKey: 'Analysis', label: '4. Analysis', desc: 'Domain & KPIs' },
    { name: 'VisualizationAgent', stepKey: 'Visualization', label: '5. Visualization', desc: 'Plotly & Matplotlib' },
    { name: 'InsightAgent', stepKey: 'Insight', label: '6. Insight', desc: 'LLM Executive Findings' },
    { name: 'ReportAgent', stepKey: 'Report', label: '7. Report', desc: 'PDF & Word Compiler' },
    { name: 'ChatAgent', stepKey: 'Chat', label: '8. Chat Engine', desc: 'NL Pandas Execution' },
  ];

  const totalSteps = agents.length;
  const completedCount = agents.filter(a => completedSteps.includes(a.stepKey) || completedSteps.includes(a.name)).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">LangGraph Autonomous Agent Pipeline</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                8 Nodes
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-agent orchestrator with stateful execution & rule fallback</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-300">{completedCount} of {totalSteps} Complete</span>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {isRunning ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/30 glow-blue animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Agents Executing...</span>
            </div>
          ) : completedCount === totalSteps ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline Complete</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 relative z-10">
        {agents.map((agent, index) => {
          const isDone = completedSteps.includes(agent.stepKey) || completedSteps.includes(agent.name);
          const isCurrent = isRunning && !isDone && (index === 0 || completedSteps.includes(agents[index - 1]?.stepKey));

          return (
            <div
              key={agent.name}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 relative group ${
                isDone
                  ? 'bg-blue-950/20 border-blue-500/30 text-white hover:border-blue-500/60'
                  : isCurrent
                  ? 'bg-blue-600/15 border-blue-400 text-blue-300 glow-blue animate-pulse'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-tight uppercase text-slate-400 group-hover:text-blue-400 transition-colors">
                  {agent.label}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">{agent.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{agent.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
