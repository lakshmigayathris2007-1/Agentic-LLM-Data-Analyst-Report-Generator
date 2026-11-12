import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Code, Sparkles, Loader2, MessageSquare, Terminal, Copy, Check } from 'lucide-react';
import { queryChatAgent, getChatHistory } from '../services/api';
import ChartViewer from '../components/ChartViewer';

export default function ChatPage({ dataset, theme }) {
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    "What is the total sum of numerical columns?",
    "Show top 5 categories by record count",
    "Which group has the highest metrics?",
    "Give summary statistics of all columns",
    "What are the missing or null values in dataset?"
  ];

  const fetchHistory = async () => {
    if (!dataset) return;
    try {
      const history = await getChatHistory(dataset.id);
      setMessages(history);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dataset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || query;
    if (!textToSend.trim() || !dataset) return;

    setLoading(true);
    setQuery('');

    const userMsg = { user_query: textToSend, agent_response: null };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await queryChatAgent(dataset.id, textToSend);
      setMessages((prev) =>
        prev.map((msg, idx) => (idx === prev.length - 1 ? res : msg))
      );
    } catch (err) {
      const errRes = {
        user_query: textToSend,
        agent_response: 'Failed to process query: ' + (err.response?.data?.detail || err.message)
      };
      setMessages((prev) =>
        prev.map((msg, idx) => (idx === prev.length - 1 ? errRes : msg))
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!dataset) {
    return (
      <div className={`p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'glass-panel border-slate-800 text-slate-300'
      }`}>
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-500/40 animate-pulse" />
        <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>No Dataset Loaded</h3>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a 1-click sample or upload a dataset to start asking conversational questions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-6xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between shrink-0 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ChatAgent — Natural Language to Pandas AI
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Ask human questions in plain English; ChatAgent generates and runs Pandas Python execution code.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-extrabold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Dataset: {dataset.filename}
        </span>
      </div>

      {/* Message Chat Container */}
      <div className={`flex-1 rounded-3xl p-5 overflow-y-auto space-y-4 shadow-inner border ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'glass-panel border-slate-800'
      }`}>
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-500 glow-blue">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Ask Anything About Your Dataset
              </h3>
              <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ChatAgent converts your text prompt into structured Pandas code, executes it over <span className="text-blue-500 font-bold">{dataset.filename}</span>, and renders text or Plotly charts.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto pt-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuery(prompt)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="space-y-3 animate-fadeIn">
              {/* User Question Bubble */}
              <div className="flex justify-end">
                <div className="flex items-start gap-2.5 max-w-xl">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-bold shadow-lg shadow-blue-500/10">
                    <p>{msg.user_query}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Agent Response Bubble */}
              <div className="flex justify-start">
                <div className="flex items-start gap-2.5 max-w-2xl">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className={`p-4 rounded-2xl rounded-tl-none text-xs space-y-3 shadow-md border ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'glass-panel border-slate-800 text-slate-200'
                  }`}>
                    {!msg.agent_response ? (
                      <div className="flex items-center gap-2 text-blue-500 font-bold animate-pulse py-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Pandas execution logic & calculating...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-blue-500 font-extrabold">ChatAgent Result:</span>
                          <button
                            onClick={() => copyToClipboard(msg.agent_response, idx)}
                            className="text-slate-400 hover:text-blue-500 flex items-center gap-1 text-[10px]"
                          >
                            {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIdx === idx ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className={`whitespace-pre-wrap font-mono text-[11px] leading-relaxed p-3.5 rounded-xl border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-200'
                        }`}>
                          {msg.agent_response}
                        </div>

                        {msg.generated_code && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-blue-500" /> 
                              Executed Python Pandas Code
                            </span>
                            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto shadow-inner">
                              {msg.generated_code}
                            </pre>
                          </div>
                        )}

                        {msg.chart_json && (
                          <div className="pt-2">
                            <ChartViewer spec={typeof msg.chart_json === 'string' ? JSON.parse(msg.chart_json) : msg.chart_json} height={290} theme={theme} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
        className={`flex items-center gap-2 rounded-2xl p-2 shrink-0 border ${
          isLight ? 'bg-white border-slate-200 shadow-md' : 'glass-panel border-slate-800'
        }`}
      >
        <input
          type="text"
          placeholder="Ask anything about your dataset (e.g., 'What is the highest value in salary?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className={`flex-1 px-4 py-2.5 text-xs focus:outline-none ${
            isLight ? 'bg-transparent text-slate-900 placeholder-slate-400' : 'bg-transparent text-white placeholder-slate-500'
          }`}
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all glow-blue disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
