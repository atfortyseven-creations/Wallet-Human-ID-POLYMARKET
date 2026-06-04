"use client";

import React, { useEffect } from 'react';

/**
 * WHALE FORTRESS V1 - CLIENT PROTECTION
 * Prevents casual inspection, tampering, and reverse engineering.
 * Implements "inhuman" level interaction guards.
 */
export function ClientFortress() {
  useEffect(() => {
    // 1. DISABLE CONTEXT MENU (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. DISABLE KEYBOARD SHORTCUTS (F12, Cmd+Opt+I, Cmd+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I / Cmd+Opt+I (Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+J / Cmd+Opt+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
      }
      // Disable Ctrl+U / Cmd+Opt+U (Source Code)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
      }
      // Disable Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    // 3. DEVTOOLS DETECTION / CONSOLE CLEARING
    // This is a "999999% intensity" deterrent
    const detector = setInterval(() => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools likely open
        console.clear();
        console.log("%cWHALE ALERT NETWORK SYSTEM", "color: #d4ff28; font-size: 40px; font-weight: bold;");
        console.log("%cACCESS RESTRICTED: Forensic Core Integrity Active", "color: #8b5cf6; font-size: 16px;");
      }
    }, 1000);

    // 4. PRINT PROTECTION
    const handleBeforePrint = () => {
        document.body.style.display = 'none';
        setTimeout(() => {
            document.body.style.display = 'block';
        }, 100);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      clearInterval(detector);
    };
  }, []);

  return null; // Invisible component
}
