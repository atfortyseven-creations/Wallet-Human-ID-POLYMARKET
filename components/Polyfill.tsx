"use client";

import { useEffect } from 'react';
import { Buffer } from 'buffer';

export default function Polyfill() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!window.Buffer) {
                window.Buffer = Buffer;
            }
            if (!window.global) {
                window.global = window as any;
            }
            if (!window.process) {
                window.process = { env: {} } as any;
            }
        }
    }, []);

    return null;
}
