'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, CheckCircle, Shield, X, RotateCcw } from 'lucide-react';
import jsQR from 'jsqr';
import { useSecureCamera } from '@/hooks/useSecureCamera';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useAppKit } from '@reown/appkit/react';
import { parseScanPayload } from '@/lib/scan/parseScanPayload';
import { completeSessionHandshake } from '@/lib/scan/sessionHandshake';
import { useSignMessage, useAccount } from 'wagmi';

const VIEWFINDER_SIZE = 240;

async function scanFileForQR(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No context'));
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code) resolve(code.data);
        else reject(new Error('No QR code found'));
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

function ScannerOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  const PERIMETER = VIEWFINDER_SIZE * 4;
  const path = `M 0 0 L ${VIEWFINDER_SIZE} 0 L ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE} L 0 ${VIEWFINDER_SIZE} Z`;
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: VIEWFINDER_SIZE, height: VIEWFINDER_SIZE,
        zIndex: 20,
      }}
      viewBox={`0 0 ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE}`}
    >
      {/* Corner marks */}
      {[
        'M 0 30 L 0 0 L 30 0',
        `M ${VIEWFINDER_SIZE - 30} 0 L ${VIEWFINDER_SIZE} 0 L ${VIEWFINDER_SIZE} 30`,
        `M 0 ${VIEWFINDER_SIZE - 30} L 0 ${VIEWFINDER_SIZE} L 30 ${VIEWFINDER_SIZE}`,
        `M ${VIEWFINDER_SIZE - 30} ${VIEWFINDER_SIZE} L ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE} L ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE - 30}`,
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" />
      ))}
      {/* Scanning line */}
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <path
        d={path}
        fill="none"
        stroke="#4ADE80"
        strokeWidth={2.5}
        strokeDasharray={`${VIEWFINDER_SIZE * 0.6} ${PERIMETER}`}
        strokeLinecap="round"
        style={{ animation: `scan-pulse 1.6s ease-in-out infinite` }}
      />
      <style>{`
        @keyframes scan-pulse {
          0%, 100% { stroke-dashoffset: 0; opacity: 1; }
          50% { stroke-dashoffset: -${PERIMETER}; opacity: 0.7; }
        }
      `}</style>
    </svg>
  );
}

export default function ScanPage() {
  const router = useRouter();
  const { address } = useSystemAccount();
  const { open: openAppKit } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const { connector } = useAccount();

  const [status, setStatus] = useState<'starting' | 'scanning' | 'pin_required' | 'verifying_pin' | 'success' | 'error' | 'denied'>('starting');
  const [tab, setTab] = useState<'camera' | 'file'>('camera');
  const [errMsg, setErrMsg] = useState('');
  const [needsWallet, setNeedsWallet] = useState(false);
  const [successLabel, setSuccessLabel] = useState('Done');
  const [fileLoading, setFileLoading] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinScanData, setPinScanData] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const pinInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const hasScannedRef = useRef(false);
  const firstFrameRef = useRef(false);
  const addressRef = useRef(address);
  const lastScanDataRef = useRef<string | null>(null);
  const handleRouteRef = useRef<(text: string) => Promise<void>>(async () => {});
  const stopCameraRef = useRef<() => void>(() => {});

  useEffect(() => { addressRef.current = address; }, [address]);
  useEffect(() => { setMounted(true); }, []);

  const getAddress = useCallback(() => {
    if (addressRef.current) return addressRef.current;
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/system_handshake=(0x[a-fA-F0-9]{40})/i);
      return m?.[1] ?? null;
    }
    return null;
  }, []);

  const handleDecoded = useCallback(async (decodedText: string) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    stopCameraRef.current();
    setStatus('scanning');
    lastScanDataRef.current = decodedText;

    const route = parseScanPayload(decodedText);

    try {
      if (route.type === 'session') {
        setPinScanData(decodedText);
        setPinInput('');
        setStatus('pin_required');
        return;
      } else if (route.type === 'wallet' && route.walletAddress) {
        setSuccessLabel('Opening chat');
        sessionStorage.setItem('whale_scan_peer', route.walletAddress.toLowerCase());
        setStatus('success');
        setTimeout(() => router.push('/chat'), 900);
        return;
      } else if (route.type === 'passport' && route.slug) {
        setSuccessLabel('Opening passport');
        setStatus('success');
        setTimeout(() => router.push(`/passport/${route.slug}`), 700);
        return;
      } else if (route.type === 'gs1' && route.gtin) {
        const res = await fetch(`/api/passport/resolve?url=${encodeURIComponent(decodedText)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrMsg((body as { error?: string }).error || 'No product passport mapped to this GS1 code.');
          setStatus('error');
          hasScannedRef.current = false;
          return;
        }
        const data = await res.json();
        setSuccessLabel('Opening passport');
        setStatus('success');
        setTimeout(() => router.push(`/passport/${data.slug}`), 700);
        return;
      } else {
        setErrMsg('QR code not recognized. Try a session QR, wallet address, product label, or GS1 link.');
        setStatus('error');
        hasScannedRef.current = false;
      }
    } catch {
      setErrMsg('Something went wrong. Please try again.');
      setStatus('error');
      hasScannedRef.current = false;
    }
  }, [router]);

  useEffect(() => { handleRouteRef.current = handleDecoded; }, [handleDecoded]);

  const { videoRef, canvasRef, error: camError, startCamera, stopCamera } = useSecureCamera({
    facingMode: 'environment',
    onFrame: useCallback((canvas: HTMLCanvasElement) => {
      if (hasScannedRef.current) return;
      if (!firstFrameRef.current) {
        firstFrameRef.current = true;
        setStatus(prev => prev === 'starting' ? 'scanning' : prev);
      }
      // Try BarcodeDetector API first (faster, native)
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        const BD = (window as any).BarcodeDetector;
        new BD({ formats: ['qr_code'] })
          .detect(canvas)
          .then((barcodes: Array<{ rawValue?: string }>) => {
            if (barcodes.length > 0 && barcodes[0].rawValue && !hasScannedRef.current) {
              handleRouteRef.current(barcodes[0].rawValue);
            }
          })
          .catch(() => {});
      }
      // Fallback: jsQR
      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data && !hasScannedRef.current) {
          handleRouteRef.current(code.data);
        }
      } catch { /* frame */ }
    }, []),
  });

  stopCameraRef.current = stopCamera;

  const initScanner = useCallback(async () => {
    hasScannedRef.current = false;
    firstFrameRef.current = false;
    setStatus('starting');
    setErrMsg('');
    await startCamera();
  }, [startCamera]);

  // Camera error → show denied state
  useEffect(() => {
    if (camError && tab === 'camera') {
      const isDenied = camError.toLowerCase().includes('denied') || camError.toLowerCase().includes('permission') || camError.toLowerCase().includes('not allowed');
      if (isDenied) {
        setStatus('denied');
      } else {
        setErrMsg(camError);
        setStatus('error');
      }
    }
  }, [camError, tab]);

  // Auto-start on mount
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => initScanner(), 300);
    return () => { clearTimeout(t); stopCamera(); };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab switch
  useEffect(() => {
    if (!mounted) return;
    if (tab === 'file') {
      stopCamera();
    } else {
      initScanner();
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePinConfirm = useCallback(async () => {
    if (pinInput.length !== 4 || !pinScanData) return;
    setStatus('verifying_pin');
    try {
      const result = await completeSessionHandshake(pinScanData, getAddress, signMessageAsync, connector, pinInput);
      if (!result.ok) {
        setErrMsg(result.message);
        if ('needsWallet' in result && result.needsWallet) setNeedsWallet(true);
        setStatus('error');
        hasScannedRef.current = false;
        return;
      }
      setSuccessLabel('Session linked');
      setStatus('success');
      setTimeout(() => router.push('/terminal'), 1400);
    } catch {
      setErrMsg('PIN verification failed. Please check the code and try again.');
      setStatus('error');
      hasScannedRef.current = false;
    }
  }, [pinInput, pinScanData, getAddress, signMessageAsync, connector, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    try {
      const decoded = await scanFileForQR(file);
      await handleDecoded(decoded);
    } catch {
      setErrMsg('No valid QR code detected in the image.');
      setStatus('error');
      hasScannedRef.current = false;
    } finally {
      setFileLoading(false);
      e.target.value = '';
    }
  };

  const reset = () => {
    hasScannedRef.current = false;
    firstFrameRef.current = false;
    setErrMsg('');
    setNeedsWallet(false);
    setPinInput('');
    setPinScanData(null);
    setTab('camera');
    initScanner();
  };

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-4 z-30 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <div className="flex flex-col">
          <span className="text-white font-black text-[15px] tracking-tight">Scan QR</span>
          <span className="text-white/40 font-mono text-[9px] uppercase tracking-[0.25em]">Humanity Ledger · Aztec Network</span>
        </div>
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* ── CAMERA FEED (fullscreen) ── */}
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ display: tab === 'camera' ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute opacity-0 pointer-events-none"
          style={{ width: 1, height: 1, top: 0, left: 0 }}
        />

        {/* Dark vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.75) 70%)',
          }}
        />
      </div>

      {/* ── OVERLAYS ── */}

      {/* STARTING */}
      {status === 'starting' && tab === 'camera' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-white" size={32} />
          <span className="text-white/60 text-[11px] font-mono uppercase tracking-widest">Starting camera…</span>
        </div>
      )}

      {/* SCANNING — viewfinder */}
      {status === 'scanning' && tab === 'camera' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <ScannerOverlay active />
        </div>
      )}

      {/* CAMERA DENIED */}
      {status === 'denied' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 gap-5 bg-black/95">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Camera size={28} className="text-white/60" />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-[15px] mb-2">Camera Access Required</p>
            <p className="text-white/50 text-[12px] leading-relaxed max-w-[260px]">
              Please allow camera access in your browser settings and tap Retry.
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-7 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full"
          >
            <RotateCcw size={13} /> Retry
          </button>
          <button
            onClick={() => setTab('file')}
            className="text-white/40 text-[10px] underline mt-1"
          >
            Upload a QR image instead
          </button>
        </div>
      )}

      {/* ERROR */}
      {status === 'error' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 gap-5 bg-black/95">
          <Shield size={32} className="text-red-400" />
          <p className="text-red-300 text-[12px] text-center font-bold leading-relaxed max-w-[260px]">{errMsg}</p>
          {needsWallet ? (
            <button
              onClick={() => { openAppKit(); }}
              className="px-7 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-7 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full"
            >
              <RotateCcw size={13} /> Try Again
            </button>
          )}
        </div>
      )}

      {/* PIN REQUIRED */}
      {status === 'pin_required' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 gap-5 bg-black/95">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
            <Shield size={24} className="text-black" />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-[15px] mb-1">Visual PIN</p>
            <p className="text-white/50 text-[11px] max-w-[220px] leading-relaxed">
              Enter the 4-digit code shown on your desktop screen
            </p>
          </div>
          <div className="flex gap-3">
            {[0,1,2,3].map((i) => (
              <input
                key={i}
                ref={pinInputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={pinInput[i] || ''}
                className="w-12 h-14 text-center text-xl font-black bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-white transition-all text-white caret-white"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const next = pinInput.split('');
                  next[i] = val.slice(-1);
                  const newPin = next.join('');
                  setPinInput(newPin);
                  if (val && i < 3) pinInputRefs[i + 1].current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !pinInput[i] && i > 0) pinInputRefs[i - 1].current?.focus();
                }}
              />
            ))}
          </div>
          <button
            onClick={handlePinConfirm}
            disabled={pinInput.length < 4}
            className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full disabled:opacity-30 transition-opacity"
          >
            Confirm & Link
          </button>
          <button onClick={reset} className="text-white/30 text-[9px] underline">
            Cancel, re-scan
          </button>
        </div>
      )}

      {/* VERIFYING PIN */}
      {status === 'verifying_pin' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/95">
          <Loader2 className="animate-spin text-white" size={32} />
          <p className="text-white/60 text-[11px] font-mono uppercase tracking-widest">Verifying PIN…</p>
        </div>
      )}

      {/* SUCCESS */}
      {status === 'success' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/95">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <p className="text-white font-black text-[15px] tracking-tight">{successLabel}</p>
        </div>
      )}

      {/* ── FILE TAB CONTENT ── */}
      {tab === 'file' && status !== 'error' && status !== 'success' && status !== 'pin_required' && status !== 'verifying_pin' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black/95 px-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Upload size={28} className="text-white/60" />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-[15px] mb-1">Upload QR Image</p>
            <p className="text-white/40 text-[11px]">Select an image containing a QR code</p>
          </div>
          <label className="cursor-pointer flex items-center gap-2 px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full">
            {fileLoading ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />}
            {fileLoading ? 'Scanning…' : 'Choose image'}
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={fileLoading} />
          </label>
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 px-6 py-4 bg-gradient-to-t from-black/90 to-transparent"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        {/* Tab switcher */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              tab === 'camera'
                ? 'bg-white text-black border-white'
                : 'bg-white/10 text-white/50 border-white/10'
            }`}
          >
            <Camera size={13} /> Camera
          </button>
          <button
            onClick={() => setTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              tab === 'file'
                ? 'bg-white text-black border-white'
                : 'bg-white/10 text-white/50 border-white/10'
            }`}
          >
            <Upload size={13} /> Gallery
          </button>
        </div>

        {/* Hint text */}
        <p className="text-center text-[10px] text-white/30 font-mono">
          {tab === 'camera'
            ? 'Point at a session QR, wallet code, or product label'
            : 'Select an image containing a QR code'}
        </p>
      </div>
    </div>
  );
}
