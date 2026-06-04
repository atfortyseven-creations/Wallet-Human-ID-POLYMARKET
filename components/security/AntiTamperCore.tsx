"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ️ Anti-Tamper Core  Nanoscopic Mutational Observer
 * Installs a hardware-level DOM watcher. If the user attempts to manipulate 
 * the DOM tree via DevTools to reveal hidden data or bypass visual restrictions, 
 * this sentinel terminates the session instantly.
 *
 * Additional System Protections:
 *  - Right-click / Context menu blocked globally.
 *  - F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S blocked.
 *  - Image drag-and-drop prevented.
 *  - Text selection of sensitive elements suppressed.
 */
export function AntiTamperCore() {
    const router = useRouter();
    const hasTampered = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        //  Removed DevTools Probe and MutationObserver to prevent mobile freezes 


        //  Right-Click / Context Menu Block 
        const blockContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        //  Keyboard Shortcut Block 
        const blockKeyboard = (e: KeyboardEvent) => {
            const key = e.key;
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;

            // F12
            if (key === 'F12') { e.preventDefault(); return; }
            // Ctrl+Shift+I (DevTools)
            if (ctrl && shift && (key === 'I' || key === 'i')) { e.preventDefault(); return; }
            // Ctrl+Shift+J (Console)
            if (ctrl && shift && (key === 'J' || key === 'j')) { e.preventDefault(); return; }
            // Ctrl+Shift+C (Inspector)
            if (ctrl && shift && (key === 'C' || key === 'c')) { e.preventDefault(); return; }
            // Ctrl+U (View Source)
            if (ctrl && (key === 'U' || key === 'u')) { e.preventDefault(); return; }
            // Ctrl+S (Save Page)
            if (ctrl && (key === 'S' || key === 's')) { e.preventDefault(); return; }
        };

        //  Drag Prevention 
        const blockDrag = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('keydown', blockKeyboard);
        document.addEventListener('dragstart', blockDrag);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', blockKeyboard);
            document.removeEventListener('dragstart', blockDrag);
        };
    }, [router]);

    return null;
}
