'use client';

import React from 'react';
import LottieCard from './ui/LottieCard';
import { Users, TrendingUp, Globe, Award, Shield, Zap, Heart, MessageCircle, DollarSign, BookOpen, Target, Trophy, Sparkles, Lock, Wallet, Coins, BarChart, Star, CheckCircle, Gift } from 'lucide-react';

export function CommunityInfo() {
    const communityCards = [
        {
            lottieSrc: "https://lottie.host/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/Community.lottie",
            title: "+150K Miembros",
            subtitle: "Comunidad global activa en 45 países",
            color: "bg-indigo-600"
        },
        {
            lottieSrc: "https://lottie.host/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/Growth.lottie",
            title: "300% Crecimiento",
            subtitle: "Aumento mensual de usuarios verificados",
            color: "bg-purple-600"
        },
        {
            lottieSrc: "https://lottie.host/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/Global.lottie",
            title: "Alcance Global",
            subtitle: "Operaciones en 45+ países del mundo",
            color: "bg-blue-600"
        },
        {
            lottieSrc: "https://lottie.host/d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a/Prize.lottie",
            title: "$2M en Premios",
            subtitle: "Distribuidos a la comunidad este año",
            color: "bg-pink-600"
        },
        {
            lottieSrc: "https://lottie.host/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b/Security.lottie",
            title: "100% Seguro",
            subtitle: "Auditorías de seguridad trimestrales",
            color: "bg-emerald-600"
        },
        {
            lottieSrc: "https://lottie.host/f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c/Speed.lottie",
            title: "<1s Transacciones",
            subtitle: "Velocidad promedio en Layer 2",
            color: "bg-cyan-600"
        },
        {
            lottieSrc: "https://lottie.host/a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d/Heart.lottie",
            title: "98% Satisfacción",
            subtitle: "Rating promedio de usuarios activos",
            color: "bg-rose-600"
        },
        {
            lottieSrc: "https://lottie.host/b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e/Chat.lottie",
            title: "24/7 Soporte",
            subtitle: "Equipo disponible en Discord y Telegram",
            color: "bg-violet-600"
        },
        {
            lottieSrc: "https://lottie.host/c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f/Money.lottie",
            title: "$50M Volumen",
            subtitle: "Volumen total de trading acumulado",
            color: "bg-green-600"
        },
        {
            lottieSrc: "https://lottie.host/d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a/Learn.lottie",
            title: "200+ Tutoriales",
            subtitle: "Academia DeFi gratuita para todos",
            color: "bg-amber-600"
        },
        {
            lottieSrc: "https://lottie.host/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/Target.lottie",
            title: "92% Precisión",
            subtitle: "Predicciones acertadas en mercados",
            color: "bg-red-600"
        },
        {
            lottieSrc: "https://lottie.host/f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c/Trophy.lottie",
            title: "Top 5 DeFi",
            subtitle: "Ranking global en plataformas DeFi",
            color: "bg-yellow-600"
        },
        {
            lottieSrc: "https://lottie.host/a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d/Magic.lottie",
            title: "Zero Gas Fees",
            subtitle: "Transacciones gratuitas para holders",
            color: "bg-fuchsia-600"
        },
        {
            lottieSrc: "https://lottie.host/b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e/Lock.lottie",
            title: "Non-Custodial",
            subtitle: "Tú controlas tus claves privadas siempre",
            color: "bg-slate-700"
        },
        {
            lottieSrc: "https://lottie.host/c5d6e7f8-a9b0-1c2d-3e4f-5a6b7c8d9e0f/Wallet.lottie",
            title: "Multi-Chain",
            subtitle: "Compatible con 15+ blockchains",
            color: "bg-orange-600"
        },
        {
            lottieSrc: "https://lottie.host/d6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a/Coins.lottie",
            title: "12% APY Promedio",
            subtitle: "Rendimientos en staking automático",
            color: "bg-lime-600"
        },
        {
            lottieSrc: "https://lottie.host/e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b/Chart.lottie",
            title: "500K Operaciones",
            subtitle: "Transacciones procesadas este mes",
            color: "bg-teal-600"
        },
        {
            lottieSrc: "https://lottie.host/f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c/Star.lottie",
            title: "4.9/5 Rating",
            subtitle: "Calificación en todas las plataformas",
            color: "bg-indigo-500"
        },
        {
            lottieSrc: "https://lottie.host/a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d/Check.lottie",
            title: "99.9% Uptime",
            subtitle: "Disponibilidad garantizada anual",
            color: "bg-sky-600"
        },
        {
            lottieSrc: "https://lottie.host/b0c1d2e3-f4a5-6b7c-8d9e-0f1a2b3c4d5e/Gift.lottie",
            title: "Referral Program",
            subtitle: "Gana 15% de comisión por referido",
            color: "bg-purple-500"
        }
    ];

    return (
        <div className="w-full max-w-[1440px] mx-auto mb-12 px-5 py-20">
            {/* Header */}
            <div className="mb-12 px-4 text-center">
                <h2 className="text-5xl md:text-7xl font-black text-indigo-900 mb-6 tracking-tighter drop-shadow-sm">
                    COMUNIDAD GLOBAL
                </h2>
                <p className="text-indigo-800/80 text-xl max-w-2xl mx-auto font-medium">
                    Únete a la revolución financiera más rápida del mundo.
                </p>
            </div>

            {/* Grid de 20 Tarjetas Vibrant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4">
                {communityCards.map((card, index) => (
                    <LottieCard
                        key={index}
                        lottieSrc={card.lottieSrc}
                        title={card.title}
                        subtitle={card.subtitle}
                        lottieSize="md"
                        className={`
                            ${card.color} 
                            border-none
                            hover:scale-105 hover:rotate-1 
                            transition-all duration-300 
                            shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                            hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]
                        `}
                    />
                ))}
            </div>
        </div>
    );
}
