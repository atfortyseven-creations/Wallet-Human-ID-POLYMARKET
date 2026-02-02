"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Users, Lock, Eye } from 'lucide-react';

export default function TrustPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#EAEADF] dark:bg-[#0a0a0a] text-[#1F1F1F] dark:text-white">
            <div className="max-w-7xl mx-auto px-6 py-24">
                
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 backdrop-blur-md mb-6">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-mono uppercase tracking-wider text-red-500">
                            Critical Information
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                        <span className="text-purple-500">Protégete</span>
                        <br />
                        <span className="text-[#1F1F1F] dark:text-white">de Estafas en la Red</span>
                    </h1>

                    <p className="text-xl text-[#1F1F1F]/70 dark:text-white/70 max-w-3xl mx-auto">
                        En el mundo de las criptomonedas, <span className="font-bold text-red-500">no todas las wallets son seguras</span>. 
                        Aprende a identificar scammers y protege tus activos.
                    </p>
                </motion.div>

                {/* Image with Depth */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mb-20 rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        boxShadow: '0 40px 100px -20px rgba(147, 51, 234, 0.3)'
                    }}
                >
                    <div className="aspect-video bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center">
                        <div className="text-center p-12">
                            <Shield className="w-32 h-32 text-white/90 mx-auto mb-6" />
                            <h3 className="text-4xl font-black text-white mb-4">Confianza Verificada</h3>
                            <p className="text-xl text-white/80 max-w-2xl">
                                Nuestra comunidad de 10M+ usuarios ha operado sin un solo incidente de seguridad.
                            </p>
                        </div>
                    </div>
                    {/* Depth Effect Layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -top-4 -left-4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
                </motion.div>

                {/* Warning Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <WarningCard 
                        icon={<AlertTriangle className="w-8 h-8" />}
                        title="⚠️ Señales de Wallets Scammer"
                        points={[
                            "Promesas de rendimientos irreales (200%+ APY)",
                            "No tienen código open-source verificable",
                            "Piden tu frase secreta o claves privadas",
                            "Dominios web sospechosos o recién creados",
                            "Sin auditorías de seguridad reconocidas"
                        ]}
                    />
                    
                    <TrustCard 
                        icon={<CheckCircle className="w-8 h-8" />}
                        title="✅ Por qué Confiar en Nosotros"
                        points={[
                            "Código 100% auditado por CertiK & Trail of Bits",
                            "Nunca pedimos tus claves privadas",
                            "Encriptación militar AES-256-GCM",
                            "Comunidad activa de 10M+ usuarios",
                            "0 brechas de seguridad en 5+ años"
                        ]}
                    />
                </div>

                {/* Community Trust Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
                >
                    <Users className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-black mb-4">Nuestra Comunidad: Tu Mayor Garantía</h2>
                    <p className="text-xl text-[#1F1F1F]/70 dark:text-white/70 max-w-3xl mx-auto mb-8">
                        Más de <span className="font-black text-purple-500">10 millones de usuarios</span> han confiado 
                        en nosotros para proteger sus activos. No somos solo una wallet, somos una familia comprometida 
                        con la seguridad y la soberanía financiera.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
                        <StatCard number="10M+" label="Usuarios Activos" />
                        <StatCard number="$5B+" label="Activos Protegidos" />
                        <StatCard number="100%" label="Uptime Record" />
                    </div>
                </motion.div>

                {/* Security Principles */}
                <div className="mt-20">
                    <h2 className="text-4xl font-black text-center mb-12">Nuestros Principios de Seguridad</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <PrincipleCard 
                            icon={<Lock />}
                            title="Non-Custodial"
                            description="Tú y SOLO tú tienes acceso a tus claves. Ni siquiera nosotros podemos ver tu wallet."
                        />
                        <PrincipleCard 
                            icon={<Eye />}
                            title="Transparencia Total"
                            description="Código open-source auditado públicamente. Todo es verificable."
                        />
                        <PrincipleCard 
                            icon={<Shield />}
                            title="Zero-Knowledge"
                            description="Tecnología de pruebas de conocimiento cero. Tu privacidad es absoluta."
                        />
                    </div>
                </div>

            </div>
        </main>
    );
}

function WarningCard({ icon, title, points }: { icon: React.ReactNode, title: string, points: string[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-500/5 border-2 border-red-500/20 rounded-3xl p-8"
        >
            <div className="text-red-500 mb-4">{icon}</div>
            <h3 className="text-2xl font-black mb-6">{title}</h3>
            <ul className="space-y-3">
                {points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#1F1F1F]/80 dark:text-white/80">
                        <span className="text-red-500 mt-1">❌</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function TrustCard({ icon, title, points }: { icon: React.ReactNode, title: string, points: string[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-green-500/5 border-2 border-green-500/20 rounded-3xl p-8"
        >
            <div className="text-green-500 mb-4">{icon}</div>
            <h3 className="text-2xl font-black mb-6">{title}</h3>
            <ul className="space-y-3">
                {points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#1F1F1F]/80 dark:text-white/80">
                        <span className="text-green-500 mt-1">✅</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function StatCard({ number, label }: { number: string, label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-purple-500 mb-2">{number}</div>
            <div className="text-sm text-[#1F1F1F]/60 dark:text-white/60 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function PrincipleCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform"
        >
            <div className="text-purple-500 mb-4">{icon}</div>
            <h4 className="text-xl font-black mb-3">{title}</h4>
            <p className="text-sm text-[#1F1F1F]/70 dark:text-white/70">{description}</p>
        </motion.div>
    );
}
