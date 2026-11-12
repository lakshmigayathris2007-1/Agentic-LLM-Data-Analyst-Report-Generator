import React, { useState, useEffect } from 'react';
import { Bot, Play, CheckCircle2, Circle, Activity, MessageSquare, Terminal, Cpu, ArrowRight, RefreshCw, Zap, Shield, Sparkles } from 'lucide-react';
import { getAgentInfo, interactWithAgent } from '../services/api';

export default function AgentStudioPage({ dataset, onRunPipeline, isAnalyzing, theme }) {
  const isLight = theme === 'light';
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentResponse, setAgentResponse] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await getAgentInfo();
      setAgents(data.agents || []);
      if (data.agents && data.agents.length > 0) {
        setSelectedAgent(data.agents[0]);
      }
    } catch (err) {
      console.error('Failed to load agent metadata:', err);
    }
  };

  const handleAgentChat = async (e) => {
    e.preventDefault();
    if (!agentPrompt.trim() || !selectedAgent) return;
    setIsQuerying(true);
    setAgentResponse(null);
    try {
      const res = await interactWithAgent(selectedAgent.id, dataset?.id, agentPrompt);
      setAgentResponse(res.response);
      addLog(`[${selectedAgent.name}] Executed prompt: "${agentPrompt}"`);
    } catch (err) {
      setAgentResponse(`Error interacting with agent: ${err.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-blue-200 text-slate-900 shadow-sm'
          : 'glass-panel border-slate-800 text-white'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              AI Agent Command Center
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-600 dark:text-cyan-400 border border-blue-500/30">
                LangGraph State Graph
              </span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              8 Autonomous Agents operating collaboratively with LLM reasoning & deterministic fail-safes.
            </p>
          </div>
        </div>

        {dataset && (
          <button
            onClick={() => onRunPipeline(dataset.id)}
            disabled={isAnalyzing}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all shadow-lg ${
              isAnalyzing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 glow-blue'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Orchestrating Agents...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run Autonomous 8-Agent Graph</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Agents Workflow Graph Grid */}
      <div className="space-y-3">
        <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          LangGraph Multi-Agent Pipeline Graph
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent, index) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isLight
                      ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-400/30'
                      : 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                    : 'glass-card border-slate-800 text-slate-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                    Agent #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500">Ready</span>
                  </div>
                </div>

                <h4 className={`text-sm font-extrabold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {agent.name}
                </h4>
                <p className={`text-xs font-semibold mb-2 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                  {agent.role}
                </p>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {agent.description}
                </p>

                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-blue-500/20 flex items-center justify-between text-[10px] text-blue-500 font-bold">
                    <span>Selected for Sandbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Agent Sandbox & Direct Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Selected Agent Detail & Sandbox */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800'
        }`}>
          {selectedAgent ? (
            <>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-lg">
                    #{agents.findIndex((a) => a.id === selectedAgent.id) + 1}
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedAgent.name} Sandbox
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {selectedAgent.role} ({selectedAgent.type})
                    </p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Direct Chat Enabled
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {selectedAgent.description}
              </p>

              {/* Direct Prompt Input */}
              <form onSubmit={handleAgentChat} className="space-y-3">
                <label className={`text-xs font-extrabold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Interact directly with {selectedAgent.name}:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder={`Ask ${selectedAgent.name} about data processing, insights, or custom rules...`}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isQuerying || !agentPrompt.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 disabled:opacity-50"
                  >
                    {isQuerying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Query Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Agent Output Box */}
              {agentResponse && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-blue-500 font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Response from {selectedAgent.name}:
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap font-sans">{agentResponse}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Select an agent above to inspect sandbox parameters.</p>
          )}
        </div>

        {/* Right: Live Agent Execution Logs Terminal */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
          isLight ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' : 'glass-panel border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Live Agent Execution Console
            </h4>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex-1 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[260px] pr-2 text-slate-300">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="leading-relaxed text-cyan-300/90 border-b border-slate-800/50 pb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic">
                No execution logs recorded yet. Run the multi-agent graph or query an agent to stream live telemetry.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>LangGraph Engine: Active</span>
            <span>State Memory: Isolated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
