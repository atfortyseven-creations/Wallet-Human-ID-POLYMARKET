"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, ExternalLink, Shield, Globe,
    AlertTriangle, Lock, Loader2
} from 'lucide-react';

interface ExternalEmbedProps {
    url: string;
    title: string;
    icon: React.ReactNode;
    accentColor?: string;
    description?: string;
}

export function ExternalEmbed({
    url,
    title,
    icon,
    accentColor = '#050505',
    description,
}: ExternalEmbedProps) {
    const [status, setStatus]   = useState<'loading' | 'ready' | 'blocked'>('loading');
    const [key, setKey]         = useState(0);
    const iframeRef             = useRef<HTMLIFrameElement>(null);
    const timeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

    /*  Start load timer on mount  */
    React.useEffect(() => {
        // Start the 12s cross-origin fallback timer immediately on mount
        timeoutRef.current = setTimeout(() => setStatus('ready'), 12000);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [url]);

    /*  Attempt to detect X-Frame-Options block  */
    const handleLoad = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Try accessing contentDocument  will throw if blocked by CORS/XFO
        try {
            const doc = iframeRef.current?.contentDocument;
            // If doc is null AND readyState isn't 'complete' it was blocked
            if (doc === null || doc === undefined) {
                setStatus('blocked');
            } else {
                setStatus('ready');
            }
        } catch {
            // Security error means cross-origin but LOADED (not blocked)  OK
            setStatus('ready');
        }
    }, []);

    const handleError = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setStatus('blocked');
    }, []);

    const startLoad = useCallback(() => {
        setStatus('loading');
        // Timeout fallback: if 12s pass assume it's ready (cross-origin can't be checked)
        timeoutRef.current = setTimeout(() => setStatus('ready'), 12000);
    }, []);

    const handleRefresh = () => {
        setKey(k => k + 1);
        startLoad();
    };

    /*  Loading skeleton  */
    const LoadingSkeleton = () => (
        <div className="absolute inset-0 bg-white flex flex-col">
            {/* Top nav skeleton */}
            <div className="h-14 border-b border-[#E5E5E5] bg-[#FDFDFB] flex items-center px-6 gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#E5E5E5] animate-pulse"/>
                <div className="w-32 h-3 rounded-full bg-[#E5E5E5] animate-pulse"/>
                <div className="ml-auto flex gap-3">
                    <div className="w-20 h-6 rounded-lg bg-[#E5E5E5] animate-pulse"/>
                    <div className="w-20 h-6 rounded-lg bg-[#E5E5E5] animate-pulse"/>
                </div>
            </div>
            {/* Content skeleton */}
            <div className="flex-1 p-8 space-y-6">
                <div className="w-64 h-8 rounded-xl bg-[#E5E5E5] animate-pulse"/>
                <div className="w-full max-w-2xl h-4 rounded-full bg-[#E5E5E5] animate-pulse"/>
                <div className="w-3/4 h-4 rounded-full bg-[#E5E5E5] animate-pulse"/>
                <div className="grid grid-cols-3 gap-4 mt-8">
                    {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-[#E5E5E5] animate-pulse"/>)}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {[1,2].map(i => <div key={i} className="h-48 rounded-2xl bg-[#E5E5E5] animate-pulse"/>)}
                </div>
            </div>
            {/* Spinner overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin" style={{ color: accentColor }}/>
                    <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">
                        Loading {title}
                    </span>
                </div>
            </div>
        </div>
    );

    /*  Blocked / fallback state  */
    const BlockedState = () => (
        <div className="absolute inset-0 bg-[#FFFFFF] flex flex-col items-center justify-center gap-6">
            <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg"
                style={{ background: accentColor }}
            >
                {icon}
            </div>
            <div className="text-center max-w-md">
                <h2 className="text-lg font-black text-[#050505] uppercase tracking-tight mb-2">
                    {title}
                </h2>
                {description && (
                    <p className="text-[11px] text-[#888888] leading-relaxed mb-1">{description}</p>
                )}
                <p className="text-[10px] text-[#AAAAAA] mt-3 flex items-center justify-center gap-1">
                    <Lock size={10}/> This page has cross-origin embed restrictions (X-Frame-Options).
                </p>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-lg transition-all hover:opacity-85 active:scale-95"
                style={{ background: accentColor }}
            >
                <ExternalLink size={15}/> Open {title} 
            </a>
            <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[#E5E5E5] text-[10px] font-black text-[#888888] uppercase tracking-widest hover:text-[#050505] transition-colors"
            >
                <RefreshCw size={12}/> Try Again
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/*  Institutional Address Bar  */}
            <div
                className="shrink-0 h-11 border-b border-[#E5E5E5] bg-[#FDFDFB] flex items-center px-4 gap-3 z-10"
            >
                {/* Color dot + icon */}
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ background: accentColor }}
                >
                    <span className="scale-75">{icon}</span>
                </div>

                {/* URL pill */}
                <div className="flex items-center gap-1.5 bg-[#F4F4F2] border border-[#E5E5E5] rounded-lg px-3 py-1.5 flex-1 max-w-sm">
                    <Shield size={9} className="text-[#00C076] shrink-0"/>
                    <span className="text-[10px] font-mono text-[#888888] truncate">{url}</span>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 ml-1">
                    {status === 'loading' && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#888888] uppercase">
                            <Loader2 size={10} className="animate-spin"/> Loading
                        </span>
                    )}
                    {status === 'ready' && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#00C076] uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]"/> Connected
                        </span>
                    )}
                    {status === 'blocked' && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#FF9500] uppercase">
                            <AlertTriangle size={9}/> Restricted
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={handleRefresh}
                        title="Refresh"
                        className="p-1.5 rounded-lg hover:bg-[#E5E5E5]/50 text-[#888888] hover:text-[#050505] transition-colors"
                    >
                        <RefreshCw size={13} className={status === 'loading' ? 'animate-spin' : ''}/>
                    </button>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        className="p-1.5 rounded-lg hover:bg-[#E5E5E5]/50 text-[#888888] hover:text-[#050505] transition-colors"
                    >
                        <ExternalLink size={13}/>
                    </a>
                </div>

                {/* Title label */}
                <span className="text-[9px] font-black text-[#CCCCCC] uppercase tracking-widest shrink-0 hidden lg:block">
                    {title}
                </span>
            </div>

            {/*  iframe area  */}
            <div className="flex-1 relative overflow-hidden bg-white">
                <AnimatePresence>
                    {status === 'loading' && (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-10"
                        >
                            <LoadingSkeleton/>
                        </motion.div>
                    )}
                    {status === 'blocked' && (
                        <motion.div
                            key="blocked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-10"
                        >
                            <BlockedState/>
                        </motion.div>
                    )}
                </AnimatePresence>

                <iframe
                    key={key}
                    ref={iframeRef}
                    src={url}
                    title={title}
                    onLoad={handleLoad}
                    onError={handleError}
                    className="w-full h-full border-0"
                    style={{ display: status === 'blocked' ? 'none' : 'block' }}
                    allow="camera; microphone; clipboard-write; encrypted-media; fullscreen"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                />
            </div>
        </div>
    );
}
