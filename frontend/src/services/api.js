import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/datasets/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res.data;
};

export const loadSampleDataset = async (sampleKey) => {
  const res = await api.post('/datasets/load-sample', { sample_key: sampleKey });
  return res.data;
};

export const getDatasets = async () => {
  const res = await api.get('/datasets/');
  return res.data;
};

export const getDatasetById = async (id) => {
  const res = await api.get(`/datasets/${id}`);
  return res.data;
};

export const getDatasetPreview = async (id, limit = 50) => {
  const res = await api.get(`/datasets/${id}/preview?limit=${limit}`);
  return res.data;
};

export const cleanDataset = async (id, options) => {
  const res = await api.post(`/datasets/${id}/clean`, options);
  return res.data;
};

export const runAnalysis = async (id) => {
  const res = await api.post(`/analysis/run/${id}`, {}, { timeout: 180000 });
  return res.data;
};

export const getAnalysisResults = async (id) => {
  const res = await api.get(`/analysis/${id}/results`);
  return res.data;
};

export const getReports = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};

export const downloadReportUrl = (filename) => {
  return `http://localhost:8000/api/reports/download/${filename}`;
};

export const queryChatAgent = async (datasetId, query) => {
  const res = await api.post('/chat/query', { dataset_id: datasetId, query });
  return res.data;
};

export const getChatHistory = async (datasetId) => {
  const res = await api.get(`/chat/history/${datasetId}`);
  return res.data;
};

// LLM Settings API
export const getLlmSettings = async () => {
  const res = await api.get('/settings/llm');
  return res.data;
};

export const updateLlmSettings = async (settings) => {
  const res = await api.post('/settings/llm', settings);
  return res.data;
};

export const testLlmConnection = async () => {
  const res = await api.post('/settings/llm/test');
  return res.data;
};

// Agent Studio API
export const getAgentInfo = async () => {
  const res = await api.get('/agents/info');
  return res.data;
};

export const interactWithAgent = async (agentId, datasetId, prompt) => {
  const res = await api.post('/agents/interact', {
    agent_id: agentId,
    dataset_id: datasetId,
    prompt: prompt
  });
  return res.data;
};

export default api;
