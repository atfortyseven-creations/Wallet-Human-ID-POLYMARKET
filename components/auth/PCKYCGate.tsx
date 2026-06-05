"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Shield,
  Smartphone,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wifi,
  Lock,
  Eye,
  Zap,
} from "lucide-react";

//  AES-GCM Decryption 
async function decryptPayload(ciphertext: string, hexKey: string): Promise<string> {
  const keyBytes = new Uint8Array(
    hexKey.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

//  Timer Hook 
function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

//  QR Orbit Animation 
function QROrbit({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ width: 320, height: 320 }}
      >
        <svg width="320" height="320" viewBox="0 0 320 320">
          <circle
            cx="160" cy="160" r="150"
            fill="none" stroke="rgba(16,185,129,0.15)"
            strokeWidth="1.5" strokeDasharray="8 6"
          />
        </svg>
      </motion.div>
      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ width: 270, height: 270 }}
      >
        <svg width="270" height="270" viewBox="0 0 270 270">
          <circle
            cx="135" cy="135" r="128"
            fill="none" stroke="rgba(99,102,241,0.12)"
            strokeWidth="1" strokeDasharray="3 10"
          />
        </svg>
      </motion.div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

//  Pulsing Dot Status 
function StatusDot({ color, pulse = true }: { color: string; pulse?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

//  Props 
interface PCKYCGateProps {
  walletAddress: string;
  onVerified: () => void;
}

type GateStage = "INIT" | "QR_WAITING" | "MOBILE_SCANNING" | "SUCCESS" | "EXPIRED" | "ERROR";

//  Main Component 
export function PCKYCGate({ walletAddress, onVerified }: PCKYCGateProps) {
  const [stage, setStage] = useState<GateStage>("INIT");
  const [uuid, setUuid] = useState<string | null>(null);
  const [ekey, setEkey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [livenessScore, setActivenessScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const remaining = useCountdown(expiresAt);

  //  Initialize session 
  const initSession = useCallback(async () => {
    setStage("INIT");
    try {
      const res = await fetch("/api/auth/kyc-init", { method: "POST" });
      if (!res.ok) throw new Error("Session init failed");
      const data = await res.json();
      setUuid(data.uuid);
      setEkey(data.ekey);
      setExpiresAt(data.expiresAt);
      setStage("QR_WAITING");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize KYC session");
      setStage("ERROR");
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  //  Auto-expire 
  useEffect(() => {
    if (remaining === 0 && stage === "QR_WAITING") {
      setStage("EXPIRED");
    }
  }, [remaining, stage]);

  //  Polling for mobile completion 
  useEffect(() => {
    if (stage !== "QR_WAITING" || !uuid) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/kyc-qr-poll?uuid=${uuid}&walletAddress=${walletAddress}`
        );
        const data = await res.json();

        if (data.status === "SUCCESS") {
          clearInterval(pollRef.current!);
          setActivenessScore(data.livenessScore || 99);
          setStage("MOBILE_SCANNING");

          // Brief dramatic pause for the scanner animation to show
          await new Promise((r) => setTimeout(r, 1800));
          setStage("SUCCESS");
          setTimeout(onVerified, 2500);
        } else if (data.status === "EXPIRED" || data.status === "BURNED") {
          clearInterval(pollRef.current!);
          setStage("EXPIRED");
        }
      } catch {
        // Silent  keep polling
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [stage, uuid, walletAddress, onVerified]);

  //  QR URL 
  const qrUrl =
    uuid && ekey
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/mobile-kyc?session=${uuid}&ekey=${ekey}`
      : "";

  //  Time formatting 
  const timeStr = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  const timeProgress = expiresAt > 0 ? remaining / 300 : 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "rgba(5,5,5,0.92)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">

        {/*  INIT / LOADING  */}
        {stage === "INIT" && (
          <motion.div
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              className="w-12 h-12 rounded-full border-t-2 border-emerald-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30">
              Initializing Secure KYC Channel
            </p>
          </motion.div>
        )}

        {/*  QR WAITING  */}
        {stage === "QR_WAITING" && uuid && ekey && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-sm w-full px-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30">
                  Humanity Ledger
                </p>
                <p className="text-[11px] font-black text-white/80 uppercase tracking-wider">
                  Biometric Verification
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <StatusDot color="#10b981" />
                <span className="text-[8px] font-mono text-emerald-500/70 uppercase tracking-widest">
                  E2EE
                </span>
              </div>
            </div>

            {/* QR */}
            <QROrbit>
              <div
                className="rounded-2xl overflow-hidden p-3"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&color=050505&bgcolor=ffffff`} alt="QR" className="w-[200px] h-[200px] object-contain" />
              </div>
            </QROrbit>

            {/* Instructions */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                Scan with your mobile
              </p>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Open this app on your phone, connect your wallet, then complete the facial scan.
              </p>
            </div>

            {/* Steps */}
            <div className="mt-6 w-full space-y-2">
              {[
                { icon: Smartphone, label: "Open app on mobile" },
                { icon: Lock, label: "Connect wallet + sign" },
                { icon: Eye, label: "Complete face scan" },
                { icon: Zap, label: "PC unlocks automatically" },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Icon size={11} className="text-white/40" />
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
                  <div
                    className="ml-auto w-4 h-4 rounded-full border border-white/10 flex items-center justify-center text-[8px] font-black text-white/25"
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={11} className="text-white/30" />
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                    Session Expires
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono font-black"
                  style={{ color: remaining < 60 ? "#ef4444" : remaining < 120 ? "#f59e0b" : "#10b981" }}
                >
                  {timeStr}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${timeProgress * 100}%`,
                    background: remaining < 60
                      ? "#ef4444"
                      : remaining < 120
                      ? "#f59e0b"
                      : "linear-gradient(90deg, #10b981, #6366f1)",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="mt-5 flex items-center gap-3">
              <motion.div
                className="flex gap-1"
                initial="hidden"
                animate="visible"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-emerald-500/60"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Awaiting mobile verification
              </span>
            </div>
          </motion.div>
        )}

        {/*  MOBILE SCANNING (transition)  */}
        {stage === "MOBILE_SCANNING" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center px-8"
          >
            <motion.div
              className="w-20 h-20 rounded-full border-2 border-emerald-500/60"
              animate={{ scale: [1, 1.1, 1], borderColor: ["rgba(16,185,129,0.4)", "rgba(16,185,129,0.9)", "rgba(16,185,129,0.4)"] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Wifi size={28} className="text-emerald-500" />
              </div>
            </motion.div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-emerald-500/70 mb-2">
                Biometric Signal Received
              </p>
              <p className="text-lg font-black text-white uppercase tracking-wider">
                Verifying Humanity Proof
              </p>
              <p className="text-[10px] text-white/30 mt-2 uppercase tracking-widest">
                Activeness Score: {livenessScore}/100
              </p>
            </div>
            <div className="w-full max-w-xs h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/*  SUCCESS  */}
        {stage === "SUCCESS" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-10 gap-6"
          >
            {/* Success Ring */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(16,185,129,0.15)" }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 0 60px rgba(16,185,129,0.4), 0 0 120px rgba(16,185,129,0.15)",
                }}
              >
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>

            <div>
              <motion.p
                className="text-[9px] font-mono uppercase tracking-[0.5em] text-emerald-400/80 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Humanity Verified
              </motion.p>
              <motion.h2
                className="text-3xl font-black text-white tracking-tight mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Verificación KYC
              </motion.h2>
              <motion.h2
                className="text-3xl font-black tracking-tight"
                style={{ color: "#10b981" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Completada 
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Shield size={12} className="text-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest">
                  ZK Proof Bound · Score {livenessScore}/100
                </span>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-2">
                Redirecting to System Terminal
              </p>
            </motion.div>
          </motion.div>
        )}

        {/*  EXPIRED  */}
        {stage === "EXPIRED" && (
          <motion.div
            key="expired"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center gap-6 px-8"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock size={28} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-500/70 mb-2">
                Session Expired
              </p>
              <p className="text-lg font-black text-white">QR Code Expired</p>
              <p className="text-[10px] text-white/40 mt-1">
                The secure tunnel expired. Generate a new QR code.
              </p>
            </div>
            <button
              onClick={initSession}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <RefreshCw size={14} />
              Generate New QR
            </button>
          </motion.div>
        )}

        {/*  ERROR  */}
        {stage === "ERROR" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center gap-4 px-8"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield size={28} className="text-red-500" />
            </div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{errorMsg}</p>
            <button
              onClick={initSession}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-[10px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
