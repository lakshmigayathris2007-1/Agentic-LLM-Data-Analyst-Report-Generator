import React, { useState } from 'react';
import { UploadCloud, FileText, Database, ArrowRight, CheckCircle2, Loader2, Sparkles, Zap, ShoppingBag, Users, HeartPulse, DollarSign } from 'lucide-react';
import { uploadDataset, loadSampleDataset, runAnalysis } from '../services/api';

export default function UploadPage({ datasets, onDatasetSelect, refreshDatasets, setActiveTab, theme }) {
  const isLight = theme === 'light';
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);

  const sampleDatasets = [
    {
      key: 'ecommerce',
      title: 'E-Commerce Sales & Profitability',
      domain: 'Sales & Revenue',
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600',
      desc: '150 order records across regions, product categories, discount rates, profit margins & delivery days.'
    },
    {
      key: 'hr',
      title: 'HR Employee Attrition & Salary',
      domain: 'Human Resources',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      desc: '120 employee records across departments, performance ratings, attrition labels & overtime hours.'
    },
    {
      key: 'healthcare',
      title: 'Healthcare Patient Diagnostics',
      domain: 'Healthcare & Medical',
      icon: HeartPulse,
      color: 'from-emerald-500 to-teal-600',
      desc: '130 patient records detailing blood pressure, BMI, diagnoses, readmission status & stay days.'
    },
    {
      key: 'financial',
      title: 'Fintech Transactions & Fraud',
      domain: 'Finance & Risk',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      desc: '140 financial transaction records with credit scores, account types, fraud risk scores & balances.'
    }
  ];

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadDataset(file);
      await refreshDatasets();
      onDatasetSelect(res.dataset_id);
      setActiveTab('dashboard');
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleKey) => {
    setLoadingSample(sampleKey);
    setUploadError(null);
    try {
      const res = await loadSampleDataset(sampleKey);
      await refreshDatasets();
      onDatasetSelect(res.dataset_id);
      setActiveTab('dashboard');
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed loading sample dataset.');
    } finally {
      setLoadingSample(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunPipeline = async (datasetId) => {
    setAnalyzingId(datasetId);
    try {
      await runAnalysis(datasetId);
      await refreshDatasets();
      onDatasetSelect(datasetId);
      setActiveTab('dashboard');
    } catch (err) {
      alert('Analysis workflow failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-800 shadow-xl'
          : 'glass-panel border-slate-800 text-white'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-blue-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30 inline-block font-extrabold">
            Data Ingestion & Autonomous Studio
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Upload Dataset or Load 1-Click Sample
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our 8-Agent LangGraph system will autonomously inspect, clean, compute domain KPIs, render Plotly charts, generate executive PDF/DOCX reports, and power natural language pandas queries.
          </p>
        </div>
      </div>

      {/* 1-Click Sample Datasets Loader Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <Zap className="w-4 h-4 text-amber-500" /> 1-Click Instant Sample Datasets
          </h3>
          <span className="text-[11px] text-slate-400">Pre-built ready for autonomous agent execution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleDatasets.map((sample) => {
            const Icon = sample.icon;
            const isLoadingThis = loadingSample === sample.key;
            return (
              <div
                key={sample.key}
                onClick={() => !loadingSample && handleLoadSample(sample.key)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md'
                    : 'glass-card border-slate-800 text-white hover:border-blue-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sample.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {sample.domain}
                    </span>
                  </div>
                  <h4 className={`text-sm font-extrabold mb-1 group-hover:text-blue-500 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {sample.title}
                  </h4>
                  <p className={`text-[11px] leading-relaxed line-clamp-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {sample.desc}
                  </p>
                </div>

                <button
                  disabled={Boolean(loadingSample)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    isLoadingThis
                      ? 'bg-blue-600 text-white'
                      : isLight
                      ? 'bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-800'
                      : 'bg-slate-800 group-hover:bg-blue-600 text-slate-200 group-hover:text-white'
                  }`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Sample...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load Sample</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom File Upload Drag and Drop Zone */}
      <div className="space-y-3">
        <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Upload Custom Dataset File
        </h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : isLight
              ? 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50 shadow-sm'
              : 'border-slate-800 glass-panel hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            id="fileInput"
            accept=".csv,.xlsx,.xls,.json"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <label htmlFor="fileInput" className="cursor-pointer block">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-lg">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {uploading ? 'Ingesting and Profiling Dataset...' : 'Click to Upload or Drag & Drop File'}
            </h3>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Supports CSV, Excel (.xlsx, .xls), or JSON datasets up to 100MB
            </p>
          </label>

          {uploadError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs max-w-md mx-auto font-bold">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Existing Uploaded Datasets History Hub */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Dataset Repository & Pipeline History
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{datasets.length} Total Datasets</span>
        </div>

        {datasets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No datasets in repository yet. Select a 1-click sample above or upload your custom dataset file.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {datasets.map((ds) => (
              <div key={ds.id} className={`py-4 flex items-center justify-between flex-wrap gap-4 px-3 rounded-2xl transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
                    {ds.file_type || 'CSV'}
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {ds.filename}
                    </h4>
                    <div className={`flex items-center gap-3 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="font-mono">{ds.row_count?.toLocaleString()} Rows</span>
                      <span>•</span>
                      <span className="font-mono">{ds.column_count} Columns</span>
                      <span>•</span>
                      <span className="capitalize font-bold text-blue-500">{ds.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onDatasetSelect(ds.id); setActiveTab('dashboard'); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    View Studio
                  </button>
                  <button
                    onClick={() => handleRunPipeline(ds.id)}
                    disabled={analyzingId === ds.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-extrabold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {analyzingId === ds.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Agent Graph...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run 8-Agent Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
