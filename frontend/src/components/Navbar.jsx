import React from 'react';
import { Bot, Database, Activity, Sun, Moon, Settings, Cpu } from 'lucide-react';

export default function Navbar({ selectedDataset, datasets, onSelectDataset, llmConfig, setActiveTab, theme, toggleTheme }) {
  const isLight = theme === 'light';

  const providerLabel = llmConfig?.provider === 'gemini' 
    ? 'Gemini Flash' 
    : llmConfig?.provider === 'openai' 
    ? 'OpenAI GPT-4o' 
    : llmConfig?.provider === 'ollama' 
    ? 'Local Ollama' 
    : 'Rule Engine';

  return (
    <header className={`px-6 py-3 flex items-center justify-between sticky top-0 z-40 border-b transition-colors duration-300 ${
      isLight 
        ? 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-900 shadow-sm' 
        : 'glass-panel border-slate-800/80 text-white'
    }`}>
      {/* Brand Title */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 glow-blue">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-black flex items-center gap-2 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Agentic AI Analyst
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              LangGraph Multi-Agent
            </span>
          </h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Autonomous Data Profiling, Analytics & Executive Reports
          </p>
        </div>
      </div>

      {/* Center / Right Control Cluster */}
      <div className="flex items-center space-x-3">
        {/* Dataset Selector Dropdown */}
        {datasets && datasets.length > 0 && (
          <div className="relative flex items-center">
            <Database className="w-4 h-4 text-blue-500 absolute left-3 pointer-events-none" />
            <select
              value={selectedDataset?.id || ''}
              onChange={(e) => onSelectDataset(e.target.value)}
              className={`pl-9 pr-8 py-1.5 rounded-xl border text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.filename} ({ds.row_count?.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* LLM Engine Indicator Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
            llmConfig?.provider === 'gemini'
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
              : llmConfig?.provider === 'openai'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
          }`}
          title="Configure LLM Provider & AI Models"
        >
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>{providerLabel}</span>
          <Settings className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* 8 AI Agents Status Pill */}
        <div 
          onClick={() => setActiveTab('agent_studio')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold cursor-pointer hover:bg-cyan-500/20 transition-colors"
          title="Open AI Agent Command Studio"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-500" />
          <span>8 Agents Active</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
          }`}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
