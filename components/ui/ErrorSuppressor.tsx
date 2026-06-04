"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
    useEffect(() => {
        // Suppress WalletConnect Origin Error 3000 in Next.js Dev Overlay
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (
                event.reason?.message?.includes("WebSocket connection closed abnormally") ||
                event.reason?.message?.includes("origin not allowed")
            ) {
                // Prevent the Next.js development overlay from hijacking the screen
                event.preventDefault();
                console.warn("[AppKit] Suppressed Origin Error: Ensure localhost is whitelisted in Reown Dashboard.");
            }
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    }, []);

    return null;
}

