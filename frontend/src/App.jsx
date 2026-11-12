import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import ProfilingCleaningPage from './pages/ProfilingCleaningPage';
import VisualizationsPage from './pages/VisualizationsPage';
import ReportsPage from './pages/ReportsPage';
import ChatPage from './pages/ChatPage';
import AgentStudioPage from './pages/AgentStudioPage';
import SettingsPage from './pages/SettingsPage';

import { getDatasets, getDatasetById, getAnalysisResults, runAnalysis, getLlmSettings } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  const [datasetDetails, setDatasetDetails] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [llmConfig, setLlmConfig] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchDatasetsList = async () => {
    try {
      const list = await getDatasets();
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id);
      }
    } catch (err) {
      console.error('Failed fetching datasets:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const cfg = await getLlmSettings();
      setLlmConfig(cfg);
    } catch (err) {
      console.error('Failed loading LLM config:', err);
    }
  };

  useEffect(() => {
    fetchDatasetsList();
    fetchSettings();
  }, []);

  const loadDatasetInfo = async (datasetId) => {
    if (!datasetId) return;
    try {
      const data = await getDatasetById(datasetId);
      setDatasetDetails(data.dataset);
      setProfileData(data.profile);

      try {
        const res = await getAnalysisResults(datasetId);
        setAnalysisData(res.analysis);
      } catch {
        setAnalysisData(null);
      }
    } catch (err) {
      console.error('Failed loading dataset info:', err);
    }
  };

  useEffect(() => {
    if (selectedDatasetId) {
      loadDatasetInfo(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  const handleSelectDataset = (id) => {
    setSelectedDatasetId(id);
    loadDatasetInfo(id);
  };

  const handleRunPipeline = async (datasetId) => {
    setIsAnalyzing(true);
    try {
      await runAnalysis(datasetId);
      await fetchDatasetsList();
      await loadDatasetInfo(datasetId);
      setActiveTab('dashboard');
    } catch (err) {
      alert('Analysis error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f17] text-slate-100'
    }`}>
      <Navbar 
        selectedDataset={datasetDetails} 
        datasets={datasets}
        onSelectDataset={handleSelectDataset}
        llmConfig={llmConfig}
        setActiveTab={setActiveTab}
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasDataset={Boolean(selectedDatasetId)}
          theme={theme}
        />

        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${
          isLight ? 'bg-slate-50' : 'bg-[#0b0f17]'
        }`}>
          {activeTab === 'upload' && (
            <UploadPage
              datasets={datasets}
              onDatasetSelect={handleSelectDataset}
              refreshDatasets={fetchDatasetsList}
              setActiveTab={setActiveTab}
              theme={theme}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              dataset={datasetDetails}
              profile={profileData}
              analysis={analysisData}
              onRunPipeline={handleRunPipeline}
              isAnalyzing={isAnalyzing}
              theme={theme}
            />
          )}

          {activeTab === 'profiling' && (
            <ProfilingCleaningPage
              dataset={datasetDetails}
              profile={profileData}
              refreshDatasetInfo={loadDatasetInfo}
              theme={theme}
            />
          )}

          {activeTab === 'agent_studio' && (
            <AgentStudioPage
              dataset={datasetDetails}
              onRunPipeline={handleRunPipeline}
              isAnalyzing={isAnalyzing}
              theme={theme}
            />
          )}

          {activeTab === 'visualizations' && (
            <VisualizationsPage
              dataset={datasetDetails}
              analysis={analysisData}
              onRunPipeline={handleRunPipeline}
              isAnalyzing={isAnalyzing}
              theme={theme}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              dataset={datasetDetails}
              analysis={analysisData}
              onRunPipeline={handleRunPipeline}
              isAnalyzing={isAnalyzing}
              theme={theme}
            />
          )}

          {activeTab === 'chat' && (
            <ChatPage 
              dataset={datasetDetails} 
              theme={theme}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              theme={theme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
