// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, PhoneOff, PhoneCall } from "lucide-react";

interface CallPayload {
  type: "VIDEO_CALL" | "VOICE_CALL";
  caller: {
    address: string;
    name: string;
    avatarUrl: string;
  };
  timestamp: number;
}

export function IncomingCallOverlay() {
  const [callPayload, setCallPayload] = useState<CallPayload | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      const payload = e.detail as CallPayload;
      setCallPayload(payload);
      setSecondsLeft(30);
    };
    window.addEventListener("ledger_incoming_call_ui", handler);
    return () => window.removeEventListener("ledger_incoming_call_ui", handler);
  }, []);

  useEffect(() => {
    if (!callPayload) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleDecline();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callPayload]);

  const handleAnswer = () => {
    window.dispatchEvent(new CustomEvent("ledger_call_answered", { detail: callPayload }));
    setCallPayload(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleDecline = () => {
    window.dispatchEvent(new CustomEvent("ledger_call_declined", { detail: callPayload }));
    setCallPayload(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const initials = callPayload
    ? callPayload.caller.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <AnimatePresence>
      {callPayload && (
        <motion.div
          key="incoming-call-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-[340px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black pt-10 pb-8 px-6 flex flex-col items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-white/20 blur-sm"
                />
                {callPayload.caller.avatarUrl ? (
                  <img
                    src={callPayload.caller.avatarUrl}
                    alt={callPayload.caller.name}
                    className="relative w-20 h-20 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-white text-2xl font-black">{initials}</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest mb-1">
                  {callPayload.type === "VIDEO_CALL" ? "Incoming Video Call" : "Incoming Voice Call"}
                </p>
                <p className="text-white font-black text-[22px] tracking-tight leading-tight">
                  {callPayload.caller.name}
                </p>
                <p className="text-white/40 font-mono text-[9px] mt-1">
                  {callPayload.caller.address.slice(0, 6)}...{callPayload.caller.address.slice(-4)}
                </p>
              </div>

              {/* Timer ring */}
              <div className="flex items-center gap-1.5 mt-1">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                />
                <span className="text-white/40 text-[9px] font-mono">Auto-decline in {secondsLeft}s</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="bg-white px-6 py-6 flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <PhoneOff size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Decline</span>
              </button>

              <button
                onClick={handleAnswer}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  {callPayload.type === "VIDEO_CALL" ? (
                    <Video size={20} className="text-white" />
                  ) : (
                    <Phone size={20} className="text-white" />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Answer</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}