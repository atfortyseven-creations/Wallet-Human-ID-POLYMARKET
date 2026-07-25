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
import { useAztecNative } from '@/context/AztecNativeContext';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  normalizing:      { label: 'Normalización de texto y auditoría', icon: <ShieldAlert size={16} /> },
  scanning_unicode: { label: 'Búsqueda de caracteres ocultos', icon: <ShieldCheck size={16} /> },
  shingling:        { label: 'Generación de n-gramas estructurales', icon: <Layers size={16} /> },
  winnowing:        { label: 'Análisis de huellas dactilares', icon: <Fingerprint size={16} /> },
  minhash:          { label: 'Firma de similitud', icon: <BarChart2 size={16} /> },
  entropy:          { label: 'Análisis de entropía y cadencia', icon: <Activity size={16} /> },
  stylometry:       { label: 'Perfil estilométrico', icon: <BookOpen size={16} /> },
  zk_commit:        { label: 'Generación de prueba de integridad', icon: <Lock size={16} /> },
};

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; border: string; label: string; desc: string }> = {
  LIKELY_ORIGINAL:  { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Alta Probabilidad de Originalidad', desc: 'No se han detectado coincidencias significativas ni patrones de Inteligencia Artificial.' },
  REVIEW_REQUIRED:  { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   label: 'Requiere Revisión Manual', desc: 'Se detectaron anomalías estadísticas o posibles alteraciones de texto. Se recomienda investigar.' },
  HIGH_RISK:        { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     label: 'Riesgo Alto de Plagio o IA', desc: 'Fuertes indicadores de texto generado por IA, plagio, o intentos de manipulación del documento.' },
};

const AI_VERDICT_CONFIG: Record<AIVerdict, { color: string; label: string }> = {
  LIKELY_HUMAN: { color: 'text-emerald-700', label: 'Probablemente Humano' },
  UNCERTAIN:    { color: 'text-amber-700',   label: 'Incierto' },
  LIKELY_AI:    { color: 'text-red-700',     label: 'Probablemente Generado por IA' },
};

function generateSubmissionId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ID-${ts}-${rand}`;
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

  const { spendQDs, balance, aztecAddress } = useAztecNative();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handle file reading safely
  const readFile = (file: File) => {
    // Reject binary formats that readAsText will ruin
    if (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setPhase('error');
      setErrorMsg(`No es posible leer archivos PDF o Word de forma directa. Por favor, abre el documento y pega el texto en el cuadro inferior.`);
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
      setErrorMsg('Error al leer el archivo. Por favor pega el texto directamente.');
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
    if (e.target) e.target.value = '';
  };

  // ── Start analysis
  const handleAnalyze = async () => {
    if (!aztecAddress) {
      setPhase('error');
      setErrorMsg('Debes conectar tu Aztec Identity para realizar un análisis.');
      return;
    }

    if (balance < 500) {
      setPhase('error');
      setErrorMsg(`Saldo insuficiente. Necesitas 500 QDs para realizar el análisis (Balance actual: ${balance.toFixed(2)} QDs).`);
      return;
    }

    if (!text.trim() || text.trim().length < 100) {
      setPhase('error');
      setErrorMsg('El documento es demasiado corto. Introduce al menos 100 caracteres para un análisis confiable.');
      return;
    }
    
    setPhase('normalizing');
    setProgress(0);
    setErrorMsg('');
    setResult(null);
    setCompletedPhases([]);

    const submissionId = generateSubmissionId();

    try {
      const spendSuccess = await spendQDs(500, "Turing Shield Anti-Plagiarism Analysis");
      if (!spendSuccess) {
         setPhase('error');
         setErrorMsg("Fallo al debitar 500 QDs de la red Aztec. Verifica tu conexión e intenta de nuevo.");
         setProgress(0);
         return;
      }

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
            return phases.slice(0, Math.max(0, idx)); 
          });
        }
      );
      
      setResult(res);
      setPhase('complete');
      setProgress(100);
      setCompletedPhases(Object.keys(PHASE_CONFIG));
    } catch (err: any) {
      setPhase('error');
      setErrorMsg(err.message || 'Se produjo un error durante el análisis.');
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 text-gray-900 font-sans">

      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Turing Shield <span className="text-blue-600">Academic</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
          Herramienta profesional de verificación de integridad académica. Detecta alteraciones de texto, plagio estructural y uso de IA.
        </p>
      </div>

      {/* ─── Main Card ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        <div className="p-6 md:p-8">

          {/* ── IDLE STATE ── */}
          {(isIdle || phase === 'error') && (
            <div className="flex flex-col gap-5">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3
                  ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload size={20} className={isDragging ? 'text-blue-500' : 'text-gray-500'} />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium text-sm">Arrastra un archivo de texto o haz clic para examinar</p>
                  <p className="text-gray-400 text-xs mt-1">Soporta .txt, .md, .csv (PDF y Word deben ser pegados manualmente)</p>
                </div>
                {fileName && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-blue-600 text-xs mt-2">
                    <FileText size={12} />
                    {fileName}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFileInput} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">O pega el texto directamente</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Pega el ensayo, tesis o documento académico del estudiante aquí..."
                  className="w-full h-40 bg-white border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm transition-all"
                />
                {text && (
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {text.split(/\s+/).filter(Boolean).length.toLocaleString()} palabras
                  </div>
                )}
              </div>

              {/* Error */}
              {phase === 'error' && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-red-700 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleAnalyze}
                disabled={!text.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <BrainCircuit size={18} />
                Analizar Documento
              </button>
            </div>
          )}

          {/* ── PROCESSING STATE ── */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-8 py-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
              </div>

              <div className="w-full max-w-sm flex flex-col gap-2">
                {Object.entries(PHASE_CONFIG).map(([key, cfg]) => {
                  const isDone = completedPhases.includes(key);
                  const isActive = phase === key;
                  return (
                    <div key={key} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${isActive ? 'bg-blue-50 text-blue-700' : isDone ? 'text-gray-400' : 'text-gray-300'}`}>
                      <div className="shrink-0">
                        {isDone ? <Check size={14} className="text-emerald-500" /> : isActive ? <Loader2 size={14} className="animate-spin" /> : cfg.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{phaseLabel}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS STATE ── */}
          {phase === 'complete' && result && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">

              {/* Verdict banner */}
              {(() => {
                const vc = VERDICT_CONFIG[result.plagiarismVerdict];
                return (
                  <div className={`flex items-start gap-4 p-5 rounded-xl border ${vc.bg} ${vc.border}`}>
                    <CheckCircle2 size={24} className={`${vc.color} mt-0.5 shrink-0`} />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <p className={`text-base font-bold ${vc.color}`}>{vc.label}</p>
                        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full bg-white/50 border ${vc.border} ${vc.color}`}>
                          Nivel de Riesgo: {result.overallRisk}/100
                        </span>
                      </div>
                      <p className={`text-sm mt-1 opacity-90 ${vc.color}`}>{vc.desc}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Security Alerts */}
              {(result.securityAlerts.homoglyphsFound > 0 || result.securityAlerts.zeroWidthCharsFound > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={16} className="text-red-600" />
                    <h4 className="text-sm font-bold text-red-800">Se detectó manipulación del documento</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-red-700 mb-2">
                    {result.securityAlerts.unicodeAnomalies.map((anom, i) => (
                      <li key={i}>{anom}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600">
                    Se encontraron caracteres ocultos o letras reemplazadas visualmente idénticas. Estos métodos suelen usarse para evadir detectores. El texto ha sido limpiado para el análisis.
                  </p>
                </div>
              )}

              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Integridad General', value: `${(result.documentIntegrityScore * 100).toFixed(1)}%`, color: 'text-gray-900', sub: 'Métrica base' },
                  { label: 'Probabilidad IA', value: `${(result.aiProbability * 100).toFixed(1)}%`, color: result.aiProbability > 0.5 ? 'text-red-600' : 'text-blue-600', sub: AI_VERDICT_CONFIG[result.aiVerdict].label },
                  { label: 'Entropía de Texto', value: result.shannonEntropy, color: 'text-gray-700', sub: 'Aleatoriedad de caracteres' },
                  { label: 'Cadencia (Burstiness)', value: result.burstinessScore, color: 'text-gray-700', sub: 'Variación de oraciones' },
                  { label: 'Riqueza Léxica', value: result.stylometrics.ttr, color: 'text-gray-700', sub: 'Variedad de vocabulario' },
                  { label: 'Palabras Analizadas', value: result.totalWords.toLocaleString(), color: 'text-gray-900', sub: `${result.uniqueWords.toLocaleString()} únicas` },
                ].map((m, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col gap-0.5">
                    <span className="text-gray-500 text-xs font-semibold">{m.label}</span>
                    <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
                    <span className="text-gray-400 text-xs">{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Expandable: Stylometric details */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BarChart2 size={16} className="text-gray-400" /> Ver reporte estilométrico completo
                  </span>
                  {showDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {showDetails && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    {Object.entries(result.stylometrics).map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ZK Commitment - simplified view */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Lock size={14} />
                    <span className="text-xs font-semibold">Identificador de Reporte</span>
                  </div>
                  <button
                    onClick={handleCopyCommitment}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors bg-white border border-gray-200 px-2 py-1 rounded shadow-sm"
                  >
                    {copied ? <><Check size={12} className="text-emerald-500" /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
                <div className="text-xs text-gray-400 font-mono break-all">
                  {result.zkCommitment}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>ID: {result.submissionId}</span>
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm py-3 rounded-xl transition-colors mt-1 shadow-sm"
              >
                Analizar Nuevo Documento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer info ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <ShieldAlert size={18} className="text-gray-400" />, title: 'Anti-Evasión', desc: 'Detecta y limpia sustituciones de caracteres y espacios invisibles diseñados para engañar detectores.' },
          { icon: <Fingerprint size={18} className="text-gray-400" />, title: 'Análisis Estructural', desc: 'Evalúa la estructura profunda del texto para encontrar parafraseos y plagios complejos.' },
          { icon: <Activity size={18} className="text-gray-400" />, title: 'Detección Estilométrica', desc: 'Estudia patrones como la variación de longitud de oraciones para identificar textos generados por IA.' },
        ].map((card, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              {card.icon}
            </div>
            <div>
              <h4 className="text-gray-800 font-medium text-sm">{card.title}</h4>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
