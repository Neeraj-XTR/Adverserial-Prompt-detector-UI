import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, ZapOff, Send } from 'lucide-react';

export default function RedTeamDetector() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDetect = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Detection failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'jailbreak':
        return 'from-red-600 to-red-700';
      case 'injection':
        return 'from-orange-500 to-orange-600';
      case 'benign':
        return 'from-emerald-500 to-emerald-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'jailbreak':
        return <AlertCircle className="w-5 h-5" />;
      case 'injection':
        return <ZapOff className="w-5 h-5" />;
      case 'benign':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-red-500';
    if (conf >= 0.6) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Grid background effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.05)_75%,rgba(68,68,68,.05))] bg-[length:60px_60px]"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RedTeam Detector
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Advanced AI jailbreak & prompt injection detection. Analyze prompts for malicious intent, obfuscation techniques, and adversarial patterns.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden mb-6">
          {/* Form Section */}
          <div className="p-8 border-b border-slate-700/30">
            <form onSubmit={handleDetect} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Enter Prompt to Analyze
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste a prompt here to test for jailbreak attempts, injection attacks, and obfuscation techniques..."
                className="w-full h-32 bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                {loading ? 'Analyzing...' : 'Detect Threats'}
              </button>
            </form>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-8 bg-red-950/20 border-t border-red-900/30 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300">Error</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-8 space-y-6">
              {/* Classification Result */}
              <div className={`bg-gradient-to-r ${getLabelColor(result.label)} rounded-xl p-6 text-white`}>
                <div className="flex items-center gap-3 mb-2">
                  {getLabelIcon(result.label)}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Classification</h3>
                    <p className="text-2xl font-bold capitalize">{result.label}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm opacity-90">
                    <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="opacity-75"> confidence</span>
                  </p>
                </div>
              </div>

              {/* Threat Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Jailbreak Score</p>
                  <p className="text-3xl font-bold text-cyan-400">{result.scores.jailbreak}</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Injection Score</p>
                  <p className="text-3xl font-bold text-blue-400">{result.scores.injection}</p>
                </div>
              </div>

              {/* Detailed Findings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-200 text-lg">Detailed Analysis</h3>

                {result.findings.critical_jailbreak && result.findings.critical_jailbreak.length > 0 && (
                  <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
                    <p className="text-red-300 font-semibold text-sm mb-3">🚨 Critical Jailbreak Patterns</p>
                    <div className="space-y-2">
                      {result.findings.critical_jailbreak.map((pattern, i) => (
                        <code key={i} className="block text-xs bg-slate-950/60 text-red-400 p-2 rounded border border-red-900/30">
                          {pattern}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {result.findings.jailbreak && result.findings.jailbreak.length > 0 && (
                  <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-4">
                    <p className="text-orange-300 font-semibold text-sm mb-3">⚠️ Jailbreak Patterns</p>
                    <div className="space-y-2">
                      {result.findings.jailbreak.map((pattern, i) => (
                        <code key={i} className="block text-xs bg-slate-950/60 text-orange-400 p-2 rounded border border-orange-900/30">
                          {pattern}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {result.findings.injection && result.findings.injection.length > 0 && (
                  <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4">
                    <p className="text-blue-300 font-semibold text-sm mb-3">🔗 Injection Patterns</p>
                    <div className="space-y-2">
                      {result.findings.injection.map((pattern, i) => (
                        <code key={i} className="block text-xs bg-slate-950/60 text-blue-400 p-2 rounded border border-blue-900/30">
                          {pattern}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {result.findings.obfuscation && result.findings.obfuscation.length > 0 && (
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-4">
                    <p className="text-purple-300 font-semibold text-sm mb-3">🔐 Obfuscation Techniques</p>
                    <div className="flex flex-wrap gap-2">
                      {result.findings.obfuscation.map((tech, i) => (
                        <span key={i} className="text-xs bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full border border-purple-700/50">
                          {tech.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {result.findings.decoded_payload && (
                      <div className="mt-3 pt-3 border-t border-purple-900/30">
                        <p className="text-purple-300 text-xs font-semibold mb-2">Decoded Payload:</p>
                        <code className="block text-xs bg-slate-950/60 text-purple-400 p-2 rounded break-all">
                          {result.findings.decoded_payload}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {result.findings.heuristic && result.findings.heuristic.length > 0 && (
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-300 font-semibold text-sm mb-3">🔍 Heuristic Findings</p>
                    <div className="flex flex-wrap gap-2">
                      {result.findings.heuristic.map((finding, i) => (
                        <span key={i} className="text-xs bg-slate-700/40 text-slate-300 px-3 py-1 rounded-full border border-slate-600/50">
                          {finding.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!result.findings.critical_jailbreak?.length &&
                  !result.findings.jailbreak?.length &&
                  !result.findings.injection?.length &&
                  !result.findings.obfuscation?.length &&
                  !result.findings.heuristic?.length && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 text-center">
                      <p className="text-emerald-300 font-semibold">✓ No malicious patterns detected</p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>AI Red Team Detection Tool • Advanced Pattern Recognition & Obfuscation Detection</p>
        </div>
      </div>
    </div>
  );
}
