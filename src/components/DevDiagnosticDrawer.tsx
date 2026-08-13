import React, { useState } from 'react';
import { X, Bot, Send, Loader2, CheckCircle2, AlertCircle, RefreshCw, Terminal, Cpu } from 'lucide-react';
import { nexusApi } from '../services/apiClient.js';
import { AI_CONFIG } from '../config/ai-models.js';

interface DevDiagnosticDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serverOnline: boolean | null;
  geminiConfigured: boolean | null;
}

export const DevDiagnosticDrawer: React.FC<DevDiagnosticDrawerProps> = ({
  isOpen,
  onClose,
  serverOnline,
  geminiConfigured,
}) => {
  const [testPrompt, setTestPrompt] = useState('Verify NEXUS diagnostic engine and AI service layer.');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    message: string;
    status: string;
    modelUsed: string;
    executionTimeMs: number;
  } | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim() || loading) return;

    setLoading(true);
    setAiResult(null);
    setErrorInfo(null);

    const response = await nexusApi.testAi(testPrompt.trim());
    setLoading(false);

    if (response.success && response.data) {
      setAiResult(response.data);
    } else {
      setErrorInfo(response.error?.message || 'Failed to communicate with Gemini API.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden nexus-glass flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wider uppercase">
                PHASE 2 GEMINI AI SERVICE DIAGNOSTIC
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Server-side API verification (/api/nexus/ai-test)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Diagnostic Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
          {/* Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">EXPRESS / API SERVER:</span>
              <span className="flex items-center space-x-1.5 font-bold">
                {serverOnline === null ? (
                  <span className="text-amber-400">CONNECTING...</span>
                ) : serverOnline ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ONLINE (200 OK)</span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>OFFLINE</span>
                  </span>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">GEMINI API KEY:</span>
              <span className={`font-bold ${geminiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {geminiConfigured === null
                  ? 'CHECKING...'
                  : geminiConfigured
                  ? 'CONFIGURED (GEMINI_API_KEY)'
                  : 'NOT DETECTED (SECRETS PANEL)'}
              </span>
            </div>
          </div>

          {/* Model Config Details */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-900 pb-1">
              <span className="flex items-center space-x-1 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>ACTIVE MODEL ALIASES</span>
              </span>
              <span>AI_CONFIG ENGINE</span>
            </div>
            <div className="flex justify-between">
              <span>MODEL_FAST:</span>
              <span className="text-cyan-300">{AI_CONFIG.MODEL_FAST}</span>
            </div>
            <div className="flex justify-between">
              <span>MODEL_CODE:</span>
              <span className="text-purple-300">{AI_CONFIG.MODEL_CODE}</span>
            </div>
          </div>

          {/* Test Form */}
          <form onSubmit={handleTestAi} className="space-y-3">
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
              EXECUTE TEST PROMPT
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter test input for Gemini service..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={loading || !testPrompt.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>RUNNING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SEND TEST</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Result Banner */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2">
              <div className="flex items-center justify-between text-cyan-400 text-[11px]">
                <span className="font-bold uppercase tracking-wider">STRUCTURED RESPONSE</span>
                <span>Latency: {aiResult.executionTimeMs}ms | Model: {aiResult.modelUsed}</span>
              </div>
              <p className="text-slate-200 font-sans text-sm">{aiResult.message}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex items-center space-x-2">
                <span>Diagnostic Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{aiResult.status}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorInfo && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>SERVICE NOTICE</span>
              </div>
              <p className="text-xs text-rose-200 font-sans">{errorInfo}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-colors cursor-pointer"
          >
            CLOSE DIAGNOSTIC
          </button>
        </div>
      </div>
    </div>
  );
};
