'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  ShieldCheck, FileText, BrainCircuit, Lock, Loader2, CheckCircle2,
  AlertTriangle, Fingerprint, Upload, XCircle, Activity, BookOpen,
  Layers, Cpu, BarChart2, ChevronDown, ChevronUp, Copy, Check, ShieldAlert
} from 'lucide-react';
import { 
  runAcademicIntegrityAnalysis, 
  AnalysisResult, 
  AnalysisPhase, 
  Verdict, 
  AIVerdict,
  ProgressUpdate
} from '@/lib/academic-integrity-engine';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  normalizing:      { label: 'Unicode Normalization & Auditing', icon: <ShieldAlert size={16} /> },
  scanning_unicode: { label: 'Invisible Character Scanning',     icon: <ShieldCheck size={16} /> },
  shingling:        { label: 'K-Gram Shingling (MOSS)',          icon: <Layers size={16} /> },
  winnowing:        { label: 'Winnow Fingerprinting',            icon: <Fingerprint size={16} /> },
  minhash:          { label: 'MinHash Signature (200 hashes)',   icon: <BarChart2 size={16} /> },
  entropy:          { label: 'Entropy & Burstiness Analysis',    icon: <Activity size={16} /> },
  stylometry:       { label: 'Stylometric Profiling',            icon: <BookOpen size={16} /> },
  zk_commit:        { label: 'ZK-SNARK Commitment (Aztec V5)',   icon: <Lock size={16} /> },
};

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; border: string; label: string; desc: string }> = {
  LIKELY_ORIGINAL:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '✓ Likely Original',        desc: 'No significant matches or AI patterns detected. High integrity.' },
  REVIEW_REQUIRED:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   label: '⚠ Manual Review Required', desc: 'Statistical anomalies or manipulation detected. Further investigation advised.' },
  HIGH_RISK:        { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     label: '✗ High Risk',              desc: 'Strong indicators of AI generation, plagiarism, or document tampering.' },
};

const AI_VERDICT_CONFIG: Record<AIVerdict, { color: string; label: string }> = {
  LIKELY_HUMAN: { color: 'text-emerald-400', label: 'Likely Human' },
  UNCERTAIN:    { color: 'text-amber-400',   label: 'Uncertain' },
  LIKELY_AI:    { color: 'text-red-400',     label: 'Likely AI-Generated' },
};

function generateSubmissionId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${ts}-${rand}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function TuringAcademicShield() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [phase, setPhase] = useState<AnalysisPhase | null>(null);
  const [phaseLabel, setPhaseLabel] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handle file reading safely
  const readFile = (file: File) => {
    // Reject binary formats that readAsText will ruin
    if (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setPhase('error');
      setErrorMsg(`Cannot directly read binary files like ${file.name}. Please open the file and copy-paste the text directly into the box.`);
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content || '');
      setPhase(null);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setPhase('error');
      setErrorMsg('Failed to read file. Please paste text directly.');
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    // reset input so the same file can be selected again
    if (e.target) e.target.value = '';
  };

  // ── Start analysis
  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 100) {
      setPhase('error');
      setErrorMsg('Document is too short. Please paste at least 100 characters for a reliable forensic analysis.');
      return;
    }
    
    setPhase('normalizing');
    setProgress(0);
    setErrorMsg('');
    setResult(null);
    setCompletedPhases([]);

    const submissionId = generateSubmissionId();

    try {
      const res = await runAcademicIntegrityAnalysis(
        text, 
        submissionId,
        (update: ProgressUpdate) => {
          setPhase(update.phase);
          setPhaseLabel(update.label);
          setProgress(update.progress);
          setCompletedPhases(prev => {
            const phases = Object.keys(PHASE_CONFIG);
            const idx = phases.indexOf(update.phase);
            return phases.slice(0, Math.max(0, idx)); // Mark all previous phases as done
          });
        }
      );
      
      setResult(res);
      setPhase('complete');
      setProgress(100);
      setCompletedPhases(Object.keys(PHASE_CONFIG));
    } catch (err: any) {
      setPhase('error');
      setErrorMsg(err.message || 'An error occurred during analysis.');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setPhase(null);
    setText('');
    setFileName('');
    setResult(null);
    setProgress(0);
    setCompletedPhases([]);
    setShowDetails(false);
    setErrorMsg('');
  };

  const handleCopyCommitment = () => {
    if (result?.zkCommitment) {
      navigator.clipboard.writeText(result.zkCommitment);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isProcessing = phase !== null && phase !== 'complete' && phase !== 'error';
  const isIdle = phase === null;

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in duration-500">

      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">ICAIEPHE 2026 — Timișoara</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Turing Shield <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Academic</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          The world's most advanced Zero-Knowledge plagiarism engine. 8-layer forensic analysis detecting AI humanizers, homoglyphs, and invisible character injection.
        </p>
      </div>

      {/* ─── Main Card ─────────────────────────────────────── */}
      <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-slate-700/50 rounded-[28px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
        
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="relative z-10 p-6 md:p-10">

          {/* ── IDLE STATE ── */}
          {(isIdle || phase === 'error') && (
            <div className="flex flex-col gap-6">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer
                  ${isDragging ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Upload size={24} className={isDragging ? 'text-emerald-400' : 'text-slate-400'} />
                  </div>
                  <div>
                    <p className="text-slate-200 font-semibold text-sm">Drag & drop a text file, or click to browse</p>
                    <p className="text-slate-500 text-xs mt-1">.txt, .md, .csv (For PDFs/Word, please copy-paste text below)</p>
                  </div>
                  {fileName && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-mono">
                      <FileText size={12} />
                      {fileName}
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFileInput} />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-xs uppercase tracking-widest font-mono">or paste text directly</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the student's essay, thesis, or any academic text here... Full documents supported."
                  className="w-full h-56 bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none font-mono text-sm leading-relaxed transition-all"
                />
                {text && (
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500 font-mono">
                    {text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  </div>
                )}
              </div>

              {/* Error */}
              {phase === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-red-200 text-sm leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleAnalyze}
                disabled={!text.trim()}
                className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-base py-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <BrainCircuit size={22} />
                Run 8-Layer Forensic Analysis
              </button>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5"><Lock size={10} /> 100% Client-Side</span>
                <span className="flex items-center gap-1.5"><ShieldAlert size={10} /> Detects Evaders</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={10} /> No Cloud Uploads</span>
              </div>
            </div>
          )}

          {/* ── PROCESSING STATE ── */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-10 py-8">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[spin_6s_linear_infinite]" />
                <div className="absolute inset-3 border border-dashed border-teal-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                <div className="absolute inset-6 border border-blue-400/20 rounded-full animate-pulse" />
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-4 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <Fingerprint size={44} className="text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="w-full max-w-lg flex flex-col gap-2">
                {Object.entries(PHASE_CONFIG).map(([key, cfg]) => {
                  const isDone = completedPhases.includes(key);
                  const isActive = phase === key;
                  return (
                    <div key={key} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-emerald-500/10 border border-emerald-500/20' : isDone ? 'opacity-50' : 'opacity-25'}`}>
                      <div className={`shrink-0 ${isDone ? 'text-emerald-500' : isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {isDone ? <Check size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : cfg.icon}
                      </div>
                      <span className={`text-sm font-mono ${isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full max-w-lg">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>{phaseLabel}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS STATE ── */}
          {phase === 'complete' && result && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Verdict banner */}
              {(() => {
                const vc = VERDICT_CONFIG[result.plagiarismVerdict];
                return (
                  <div className={`flex items-center gap-4 p-5 rounded-2xl border ${vc.bg} ${vc.border}`}>
                    <CheckCircle2 size={32} className={vc.color} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-lg font-black ${vc.color}`}>{vc.label}</p>
                        <span className={`text-xl font-black ${vc.color}`}>Risk: {result.overallRisk}/100</span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">{vc.desc}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Security Alerts (if any manipulation detected) */}
              {(result.securityAlerts.homoglyphsFound > 0 || result.securityAlerts.zeroWidthCharsFound > 0) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={18} className="text-red-400" />
                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Document Tampering Detected</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-red-200">
                    {result.securityAlerts.unicodeAnomalies.map((anom, i) => (
                      <li key={i}>{anom}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-300/80 mt-3 font-mono">
                    Students use these invisible characters or look-alike letters to break traditional plagiarism scanners. Turing Shield has removed them and analyzed the true text.
                  </p>
                </div>
              )}

              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Integrity Score', value: `${(result.documentIntegrityScore * 100).toFixed(1)}%`, color: 'text-emerald-400', sub: 'Mathematical baseline' },
                  { label: 'AI Probability', value: `${(result.aiProbability * 100).toFixed(1)}%`, color: result.aiProbability > 0.5 ? 'text-red-400' : 'text-blue-400', sub: AI_VERDICT_CONFIG[result.aiVerdict].label },
                  { label: 'Shannon Entropy', value: result.shannonEntropy, color: 'text-purple-400', sub: 'Char-level randomness' },
                  { label: 'Burstiness', value: result.burstinessScore, color: 'text-cyan-400', sub: 'Sentence rhythm variation' },
                  { label: 'Vocab Richness (TTR)', value: result.stylometrics.ttr, color: 'text-yellow-400', sub: 'Type-Token Ratio' },
                  { label: 'Words Analyzed', value: result.totalWords.toLocaleString(), color: 'text-slate-100', sub: `${result.uniqueWords.toLocaleString()} unique` },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{m.label}</span>
                    <span className={`text-2xl font-black ${m.color}`}>{m.value}</span>
                    <span className="text-slate-500 text-xs font-mono">{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Expandable: Stylometric details */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <BarChart2 size={15} /> Full Stylometric & Cryptographic Report
                  </span>
                  {showDetails ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {showDetails && (
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                    {Object.entries(result.stylometrics).map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400 font-mono capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-bold text-slate-200">{v}</span>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 font-mono">Shingles Generated</span>
                      <span className="text-sm font-bold text-slate-200">{result.totalShingles.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 font-mono">Winnow Fingerprints</span>
                      <span className="text-sm font-bold text-slate-200">{result.winnowFingerprintCount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ZK Commitment */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-emerald-400" />
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Zero-Knowledge Proof</h4>
                  </div>
                  <button
                    onClick={handleCopyCommitment}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700"
                  >
                    {copied ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy Hash</>}
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-black/60 rounded-xl p-4 border border-slate-800 break-all leading-relaxed shadow-inner">
                  {result.zkCommitment}
                </div>
                <div className="mt-3 flex justify-between text-xs font-mono text-slate-500">
                  <span>ID: {result.submissionId}</span>
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-4 rounded-xl transition-colors mt-2"
              >
                Scan Another Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── How it works (footer info) ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <ShieldAlert size={20} className="text-amber-400" />, title: 'Tamper-Proof Normalization', desc: 'Detects and cleans homoglyph substitutions and invisible zero-width characters used by students to bypass traditional detectors.' },
          { icon: <Fingerprint size={20} className="text-emerald-400" />, title: 'Deep Fingerprinting', desc: 'Stanford\'s MOSS Winnowing and MinHash generate a robust structural fingerprint that catches heavily paraphrased text.' },
          { icon: <Activity size={20} className="text-blue-400" />, title: 'Stylometric AI Detection', desc: 'Analyzes Shannon entropy, sentence burstiness, and vocabulary richness to identify humanizer-processed AI text statistically.' },
        ].map((card, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              {card.icon}
            </div>
            <h4 className="text-slate-200 font-bold text-sm">{card.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
