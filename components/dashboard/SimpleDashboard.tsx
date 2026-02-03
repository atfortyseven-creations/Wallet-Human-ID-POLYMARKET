"use client";

import React from 'react';
import { LayoutDashboard, TrendingUp, Wallet, Shield } from 'lucide-react';

export default function SimpleDashboard() {
    return (
        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Balance', value: '$42,500.00', icon: Wallet, color: 'text-emerald-500' },
                    { label: 'Today Gain', value: '+12.5%', icon: TrendingUp, color: 'text-blue-500' },
                    { label: 'Active Positions', value: '8', icon: LayoutDashboard, color: 'text-purple-500' },
                    { label: 'Security Score', value: '98/100', icon: Shield, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-black/5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-white shadow-sm ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <h3 className="text-black/40 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-2xl font-black text-black">{stat.value}</p>
                    </div>
                ))}
            </div>
            
            <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[2.5rem] border border-black/5 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <LayoutDashboard size={32} />
                </div>
                <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">Panel Principal</h2>
                <p className="text-black/40 font-bold max-w-sm">Estamos optimizando tu experiencia. Pronto verás aquí tus analíticas avanzadas.</p>
            </div>
        </div>
    );
}
