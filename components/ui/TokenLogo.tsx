"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { QUANTUM_TOKENS } from '@/lib/config/tokens';

// Build fast symbol → local logoPath map from our 357 verified tokens (built once at module load)
const TOKEN_LOGO_MAP: Record<string, string> = {};
QUANTUM_TOKENS.forEach(t => {
    if (t.symbol && t.logoPath) {
        TOKEN_LOGO_MAP[t.symbol.toUpperCase()] = t.logoPath;
    }
});

export interface TokenLogoProps {
    symbol: string;
    name?: string;
    address?: string;
    logoURI?: string | null;
    className?: string;
    fallbackClassName?: string;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ symbol, logoURI, className, fallbackClassName }) => {
    const [failed, setFailed] = useState(false);

    // Reset on symbol change
    useEffect(() => {
        setFailed(false);
    }, [symbol, logoURI]);

    // Resolve the best local logo path:
    // 1. Direct logoURI if it points to our local folder
    // 2. Symbol lookup in QUANTUM_TOKENS map (357 tokens, built once at module load)
    // 3. Text fallback
    const resolvedPath = (() => {
        if (logoURI && logoURI.startsWith('/system-shots/logostoken/')) return logoURI;
        const upper = symbol?.toUpperCase();
        if (upper && TOKEN_LOGO_MAP[upper]) return TOKEN_LOGO_MAP[upper];
        return null;
    })();

    if (!resolvedPath || failed) {
        return (
            <div className={cn(
                "flex items-center justify-center font-black uppercase tracking-tight bg-black/10 text-black/60 text-[10px]",
                className,
                fallbackClassName
            )}>
                {typeof symbol === 'string' ? symbol.slice(0, 2) : '?'}
            </div>
        );
    }

    return (
        <img
            src={resolvedPath}
            alt={symbol || 'Token'}
            className={cn("object-contain", className)}
            onError={() => setFailed(true)}
        />
    );
};
