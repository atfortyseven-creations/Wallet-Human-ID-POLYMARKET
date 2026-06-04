"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Check } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("system_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("system_cookie_consent", "accepted");
    // set cookie for middleware if needed
    document.cookie = "system_cookie_consent=accepted; path=/; max-age=31536000";
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("system_cookie_consent", "declined");
    document.cookie = "system_cookie_consent=declined; path=/; max-age=31536000";
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-[400px] bg-white border border-black/10 shadow-2xl rounded-2xl p-6 z-[999]"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center flex-shrink-0">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#0a0a0a] mb-2">Architectural Privacy</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-serif mb-6">
                We utilize essential cryptographic cookies to maintain session integrity. No tracking. No third-party data sales. Absolute precision.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={acceptCookies}
                  className="flex-1 bg-[#0a0a0a] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-black/80 transition-colors flex justify-center items-center gap-2"
                >
                  <Check size={14} /> Accept
                </button>
                <button
                  onClick={declineCookies}
                  className="flex-1 bg-transparent border border-black/10 text-[#0a0a0a] text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-black/5 transition-colors flex justify-center items-center gap-2"
                >
                  <X size={14} /> Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
