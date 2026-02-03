"use client";

import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function SimpleDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-white">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl flex flex-col items-center gap-4">
                <LayoutDashboard size={48} className="text-purple-500 opacity-50" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-white/40">Este módulo está siendo optimizado.</p>
            </div>
        </div>
    );
}
