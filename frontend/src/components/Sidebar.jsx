import React from 'react';
import { UploadCloud, LayoutDashboard, Sparkles, PieChart, FileText, MessageSquare, Cpu, Settings, Bot } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, hasDataset, theme }) {
  const isLight = theme === 'light';

  const mainNavItems = [
    { id: 'upload', label: 'Data Studio & Upload', icon: UploadCloud, enabled: true, badge: 'Upload / Samples' },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, enabled: hasDataset },
    { id: 'profiling', label: 'Profiling & Cleaning', icon: Sparkles, enabled: hasDataset },
    { id: 'agent_studio', label: 'AI Agent Command Studio', icon: Bot, enabled: true, badge: '8 Agents' },
    { id: 'visualizations', label: 'Interactive Charts', icon: PieChart, enabled: hasDataset },
    { id: 'chat', label: 'AI Data Analyst Chat', icon: MessageSquare, enabled: hasDataset },
    { id: 'reports', label: 'Executive Reports', icon: FileText, enabled: hasDataset },
  ];

  const configNavItems = [
    { id: 'settings', label: 'LLM & Agent Settings', icon: Settings, enabled: true },
  ];

  return (
    <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 transition-colors duration-300 ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800 shadow-sm' 
        : 'glass-panel border-slate-800/80 text-white'
    }`}>
      <div className="space-y-6">
        {/* Main Analytics Navigation Section */}
        <div>
          <p className={`px-3 text-[10px] font-extrabold uppercase tracking-widest mb-2.5 ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Analytics Studio
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled = !item.enabled;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && setActiveTab(item.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 glow-blue'
                      : isDisabled
                      ? 'text-slate-400 cursor-not-allowed opacity-40'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isDisabled ? 'text-slate-400' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                      isLight ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Section */}
        <div>
          <p className={`px-3 text-[10px] font-extrabold uppercase tracking-widest mb-2.5 ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            System Configuration
          </p>
          <div className="space-y-1">
            {configNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 glow-purple'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-sm shadow-purple-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info Badge */}
      <div 
        onClick={() => setActiveTab('agent_studio')}
        className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer hover:border-blue-500/40 transition-all ${
          isLight
            ? 'bg-slate-100/80 border-slate-200 text-slate-800'
            : 'glass-card border-slate-800/80 text-white'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <Cpu className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>LangGraph Multi-Agent</p>
          <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>8 Autonomous Agents</p>
        </div>
      </div>
    </aside>
  );
}
