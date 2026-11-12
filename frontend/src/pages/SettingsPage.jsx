import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Key, ShieldCheck, RefreshCw, Zap, CheckCircle2, AlertTriangle, Eye, EyeOff, Server, Sliders } from 'lucide-react';
import { getLlmSettings, updateLlmSettings, testLlmConnection } from '../services/api';

export default function SettingsPage({ theme }) {
  const isLight = theme === 'light';
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [showKey, setShowKey] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const cfg = await getLlmSettings();
      if (cfg) {
        setProvider(cfg.provider || 'openai');
        setModel(cfg.model || 'gpt-4o');
        setTemperature(cfg.temperature || 0.2);
        setHasOpenAIKey(cfg.has_openai_key);
        setHasGeminiKey(cfg.has_gemini_key);
      }
    } catch (err) {
      console.error('Failed fetching LLM settings:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);
    try {
      const res = await updateLlmSettings({
        provider,
        model,
        api_key: apiKey,
        gemini_key: geminiKey,
        temperature
      });
      setToastMessage({ type: 'success', text: 'LLM configuration updated successfully!' });
      fetchSettings();
    } catch (err) {
      setToastMessage({ type: 'error', text: `Failed updating settings: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testLlmConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({ status: 'error', message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const providerModels = {
    openai: [
      { id: 'gpt-4o', label: 'GPT-4o (Recommended Flagship)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost-Efficient)' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    gemini: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Ultra Fast & Lightweight)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced Reasoning)' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' }
    ],
    ollama: [
      { id: 'llama3', label: 'Llama 3 (8B / 70B Local)' },
      { id: 'mistral', label: 'Mistral 7B Local' },
      { id: 'codellama', label: 'CodeLlama Local' }
    ],
    fallback: [
      { id: 'deterministic-rules', label: 'Deterministic Rule Engine (No API Key Required)' }
    ]
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className={`p-6 rounded-3xl border flex items-center justify-between transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-purple-200 text-slate-900 shadow-sm'
          : 'glass-panel border-slate-800 text-white'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              LLM Engine & Agent Settings
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Configure AI providers (OpenAI, Google Gemini, Ollama, Rule Fallback), manage keys, and test connectivity.
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className={`p-6 rounded-3xl border space-y-6 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800'
      }`}>
        {/* 1. LLM Provider Selector */}
        <div className="space-y-3">
          <label className={`text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Active AI LLM Provider
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'openai', label: 'OpenAI GPT', desc: 'GPT-4o Reasoning', icon: Cpu },
              { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 1.5 / 2.0', icon: Zap },
              { id: 'ollama', label: 'Ollama (Local)', desc: 'Privacy-focused Local', icon: Server },
              { id: 'fallback', label: 'Rule Engine', desc: 'Zero API Key Fallback', icon: ShieldCheck }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    setModel(providerModels[p.id][0].id);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25 glow-purple'
                      : isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                      : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-extrabold">{p.label}</span>
                  </div>
                  <p className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Model Selection */}
        <div className="space-y-2">
          <label className={`text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Model Name
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {(providerModels[provider] || []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. API Key Management */}
        {provider === 'openai' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                OpenAI API Key
              </label>
              {hasOpenAIKey && (
                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Key Detected in Environment
                </span>
              )}
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {provider === 'gemini' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Google Gemini API Key
              </label>
              {hasGeminiKey && (
                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Gemini Key Active
                </span>
              )}
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* 4. Temperature Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Temperature ({temperature})
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {temperature < 0.3 ? 'Deterministic & Precise' : 'Creative & Analytical'}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-purple-500" /> : <Zap className="w-4 h-4 text-purple-500" />}
            <span>Test Connectivity</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-purple-500/25 glow-purple disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Connection Test Diagnostics Result */}
      {testResult && (
        <div className={`p-6 rounded-3xl border space-y-3 animate-fadeIn ${
          testResult.status === 'success'
            ? isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : isLight
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center justify-between font-extrabold text-xs">
            <span className="flex items-center gap-2">
              {testResult.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
              Connectivity Diagnostics Report
            </span>
            <span className="font-mono text-[10px] uppercase">{testResult.details?.provider || provider}</span>
          </div>
          <p className="text-xs font-mono leading-relaxed">{testResult.message}</p>
        </div>
      )}
    </div>
  );
}
