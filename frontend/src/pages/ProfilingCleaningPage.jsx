import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, CheckCircle2, AlertCircle, RefreshCw, Loader2, Database, Search } from 'lucide-react';
import { cleanDataset, getDatasetPreview } from '../services/api';
import DataPreviewTable from '../components/DataPreviewTable';

export default function ProfilingCleaningPage({ dataset, profile, refreshDatasetInfo, theme }) {
  const isLight = theme === 'light';
  const [handleMissing, setHandleMissing] = useState('auto');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [handleOutliers, setHandleOutliers] = useState(true);

  const [cleaning, setCleaning] = useState(false);
  const [cleanLog, setCleanLog] = useState(null);
  const [preview, setPreview] = useState(null);

  const columnDetails = profile?.column_details || {};
  const duplicateRows = profile?.duplicate_rows || 0;
  const qualityScore = profile?.quality_score || 100.0;

  const fetchPreview = async () => {
    if (!dataset) return;
    try {
      const data = await getDatasetPreview(dataset.id, 50);
      setPreview(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [dataset]);

  const handleExecuteCleaning = async () => {
    if (!dataset) return;
    setCleaning(true);
    setCleanLog(null);
    try {
      const options = {
        handle_missing: handleMissing,
        remove_duplicates: removeDuplicates,
        handle_outliers: handleOutliers,
        outlier_threshold: 3.0
      };
      const res = await cleanDataset(dataset.id, options);
      setCleanLog(res);
      await refreshDatasetInfo(dataset.id);
      await fetchPreview();
    } catch (err) {
      alert('Cleaning failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCleaning(false);
    }
  };

  if (!dataset) {
    return (
      <div className={`p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'glass-panel border-slate-800 text-slate-300'
      }`}>
        <Database className="w-12 h-12 mx-auto mb-3 text-blue-500/40 animate-pulse" />
        <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>No Dataset Loaded</h3>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a 1-click sample or upload a dataset to view profiling & cleaning controls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className={`p-6 rounded-3xl border flex items-center justify-between flex-wrap gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
      }`}>
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-bold">
            Step 2 & 3: ProfilingAgent & CleaningAgent
          </span>
          <h2 className={`text-2xl font-black mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Data Health Profiling & Auto-Cleaning Workbench
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Inspect column types, null count distributions, duplicate records, and trigger automated data cleaning.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score</p>
            <p className="text-2xl font-black text-blue-500 font-mono">{qualityScore.toFixed(1)} / 100</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duplicate Rows</p>
            <p className="text-2xl font-black text-amber-500 font-mono">{duplicateRows}</p>
          </div>
        </div>
      </div>

      {/* Control Panel & Column Profiling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cleaning Options Panel */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Cleaning Agent Controls
            </h3>
          </div>

          <div>
            <label className={`text-xs font-extrabold block mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Missing Value Imputation Strategy
            </label>
            <select
              value={handleMissing}
              onChange={(e) => setHandleMissing(e.target.value)}
              className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <option value="auto">Auto Impute (Median numeric, Mode categorical)</option>
              <option value="fill_mean">Impute Mean (Numeric attributes)</option>
              <option value="fill_median">Impute Median (Numeric attributes)</option>
              <option value="drop">Drop Rows with Missing Values</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 text-xs font-bold text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                Remove Duplicate Records ({duplicateRows} found)
              </span>
            </label>

            <label className="flex items-center space-x-3 text-xs font-bold text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={handleOutliers}
                onChange={(e) => setHandleOutliers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                Outlier Capping (IQR 1.5× Rule)
              </span>
            </label>
          </div>

          <button
            onClick={handleExecuteCleaning}
            disabled={cleaning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 glow-blue"
          >
            {cleaning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CleaningAgent Executing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Trigger CleaningAgent</span>
              </>
            )}
          </button>

          {cleanLog && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 space-y-1 font-bold">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Cleaning Agent Completed!
              </p>
              {cleanLog.actions_taken?.map((act, i) => (
                <p key={i} className="text-[11px] font-normal opacity-90">• {act}</p>
              ))}
            </div>
          )}
        </div>

        {/* Column Profiling Breakdown */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
        }`}>
          <h3 className={`text-base font-extrabold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Column Profiling Breakdown
          </h3>
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] sticky top-0 font-extrabold ${
                isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Column Name</th>
                  <th className="py-2.5 px-3">Detected Type</th>
                  <th className="py-2.5 px-3">Null Count</th>
                  <th className="py-2.5 px-3">Null %</th>
                  <th className="py-2.5 px-3">Unique Values</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {Object.entries(columnDetails).map(([col, info]) => (
                  <tr key={col} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                    <td className={`py-2.5 px-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{col}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-500 font-mono font-bold">
                        {info.type} ({info.dtype})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{info.null_count}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-bold ${info.null_percentage > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {info.null_percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{info.unique_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dataset Preview */}
      {preview && (
        <DataPreviewTable
          columns={preview.columns}
          rows={preview.rows}
          isCleaned={preview.is_cleaned}
          theme={theme}
        />
      )}
    </div>
  );
}
