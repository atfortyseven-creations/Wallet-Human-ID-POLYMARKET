"use client";

import React, { useState } from 'react';
import { ArrowRight, Mail, BookOpen, Check } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function Web3AccessSection() {
    const { open } = useAppKit();
    const router = useRouter();

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-24 flex flex-col gap-16">
            
            {/* 1. New to Web3? Card (Blue Style) */}
            <div className="w-full bg-[#Dbf1ff] rounded-3xl p-10 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-lg group">
                {/* Decorative 3D Element (Blue Torus Placeholder) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex-1 text-center md:text-left z-10">
                    <h2 className="text-5xl md:text-7xl font-black text-[#031d47] mb-6 leading-[0.9] tracking-tighter uppercase font-heading">
                        ¿NUEVO<br/>EN LA<br/>WEB3?
                    </h2>
                    <p className="text-[#031d47]/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed mb-8">
                        A través de una serie de lecciones interactivas, Human Defi Learn te enseñará qué es la web3, por qué es importante para ti y cómo usar tu wallet en el proceso.
                    </p>
                    <button 
                        onClick={() => router.push('/wallet')}
                        className="bg-[#030b36] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-900 transition-transform active:scale-95 shadow-xl hover:shadow-2xl"
                    >
                        COMENZAR LA LECCIÓN
                    </button>
                </div>

                {/* Right Side Visual (Lottie/Image Placeholder) */}
                <div className="w-full md:w-1/3 h-64 md:h-full relative flex items-center justify-center">
                     {/* Using a geometric CSS shape to mimic the 'Blue Prism' if no Lottie is available immediately */}
                     <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl transform rotate-12 rotate-y-12 shadow-[0_20px_50px_rgba(0,0,255,0.3)] animate-float" />
                </div>
            </div>

            {/* 2. Subscription Card (Purple MetaMask Style) */}
            <SubscribeCard />

        </div>
    );
}

function SubscribeCard() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [preferences, setPreferences] = useState({ general: true, developer: false });

    // Handle Checkbox
    const togglePref = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) return toast.error("Por favor ingresa un email válido");
        
        setLoading(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preferences })
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success("¡Suscrito correctamente!");
                setSubscribed(true);
                setEmail('');
            } else {
                toast.error(data.error || "Error al suscribirse");
            }
        } catch (e) {
            toast.error("Ocurrió un error");
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="w-full bg-[#E5B8FB] rounded-3xl p-12 text-center text-[#4A1D6E]">
                <h3 className="text-3xl font-bold mb-4">¡Gracias por suscribirte!</h3>
                <p className="font-medium">Revisa tu bandeja de entrada para confirmar tu suscripción.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#E5B8FB] rounded-3xl overflow-hidden relative shadow-lg">
            {/* Geometric Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#d69bf5] transform skew-x-12 translate-x-20 z-0" />
            
            <div className="relative z-10 p-8 md:p-14 max-w-4xl mx-auto">
                <h3 className="text-2xl md:text-4xl font-black text-[#24083a] mb-8 text-center uppercase tracking-tight">
                    Suscríbete para recibir actualizaciones y anuncios
                </h3>

                {/* Checkboxes */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                            className={`w-6 h-6 border-2 border-[#4A1D6E] rounded flex items-center justify-center transition-colors ${preferences.general ? 'bg-[#4A1D6E]' : 'bg-transparent'}`}
                            onClick={() => togglePref('general')}
                        >
                            {preferences.general && <Check size={16} className="text-white" />}
                        </div>
                        <span className="text-[#24083a] font-bold text-lg select-none group-hover:opacity-80">Noticias generales</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                            className={`w-6 h-6 border-2 border-[#4A1D6E] rounded flex items-center justify-center transition-colors ${preferences.developer ? 'bg-[#4A1D6E]' : 'bg-transparent'}`}
                            onClick={() => togglePref('developer')}
                        >
                            {preferences.developer && <Check size={16} className="text-white" />}
                        </div>
                        <span className="text-[#24083a] font-bold text-lg select-none group-hover:opacity-80">Noticias para desarrolladores</span>
                    </label>
                </div>

                {/* Input Field */}
                <div className="bg-white rounded-full p-2 flex items-center shadow-inner mb-8">
                    <input 
                        type="email" 
                        placeholder="Dirección de correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent px-6 py-3 text-[#24083a] outline-none placeholder:text-gray-400 font-medium text-lg"
                    />
                </div>

                {/* Disclaimer & Button Row */}
                <div className="flex flex-col md:flex-row items-end gap-8">
                   
                    <button 
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="bg-[#24083a] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#3bf] hover:text-[#24083a] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 whitespace-nowrap order-2 md:order-1"
                    >
                        {loading ? 'SUSCRIBIENDO...' : 'SUSCRÍBETE'}
                    </button>

                     <p className="text-xs text-[#24083a]/70 leading-relaxed md:max-w-xl order-1 md:order-2">
                        Human Defi puede utilizar la información de contacto que nos proporciones para contactarte acerca de nuestros productos y servicios. Al hacer clic en “suscribirse”, aceptas recibir dichas comunicaciones. Puedes cancelar tu suscripción en cualquier momento.
                    </p>
                </div>
            </div>
        </div>
    );
}
