"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "¿Qué es Human Wallet?",
        answer: "Human Wallet es una wallet Web3 no-custodial que utiliza biometría para eliminar la necesidad de frases semillas. Tu rostro es tu llave privada."
    },
    {
        question: "¿Es segura la autenticación biométrica?",
        answer: "Absolutamente. Utilizamos sharding criptográfico distribuido en 3 nodos seguros. Tus datos biométricos nunca salen de tu dispositivo y están cifrados end-to-end."
    },
    {
        question: "¿Qué redes blockchain soporta?",
        answer: "Actualmente soportamos Ethereum, Base, Polygon, Arbitrum, Optimism y más de 15 redes EVM. Continuamente agregamos nuevas chains."
    },
    {
        question: "¿Puedo recuperar mi wallet si pierdo mi dispositivo?",
        answer: "Sí. Implementamos Social Recovery que te permite designar guardianes de confianza que pueden ayudarte a recuperar el acceso a tu wallet."
    },
    {
        question: "¿Tiene costos de transacción?",
        answer: "Las transacciones siguen las tarifas de gas de cada red. Sin embargo, ofrecemos transacciones gasless para ciertas operaciones mediante Account Abstraction (ERC-4337)."
    },
    {
        question: "¿Qué es el Whale Tracker?",
        answer: "Es una herramienta premium que te permite seguir wallets de grandes inversores ('ballenas') en tiempo real, recibiendo alertas sobre sus movimientos y estrategias."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="relative w-full py-32 bg-gradient-to-b from-[#1F1F1F]/5 to-transparent">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-[#1F1F1F] text-white px-4 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4" />
                        Preguntas Frecuentes
                    </div>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-[#1F1F1F] mb-6 uppercase leading-tight">
                        Todo Lo Que <br className="hidden md:block" />
                        Necesitas Saber
                    </h2>
                    <p className="text-xl md:text-2xl text-[#1F1F1F]/60 max-w-2xl mx-auto font-light leading-relaxed">
                        Respuestas claras a preguntas comunes sobre Human Wallet
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            delay={index * 0.05}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-[#1F1F1F]/60 font-medium mb-4">
                        ¿Aún tienes preguntas?
                    </p>
                    <a
                        href="/soporte"
                        className="inline-block px-8 py-4 bg-[#1F1F1F] text-white rounded-full font-bold hover:scale-105 transition-transform duration-300"
                    >
                        Contacta con Soporte
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

function FAQItem({ 
    question, 
    answer, 
    isOpen, 
    onClick, 
    delay 
}: { 
    question: string; 
    answer: string; 
    isOpen: boolean; 
    onClick: () => void;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            onClick={onClick}
            className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-white/70 transition-all duration-300"
        >
            <div className="p-6 md:p-8 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-[#1F1F1F] pr-4 flex-1">
                    {question}
                </h3>
                <div className={`
                    w-10 h-10 rounded-full bg-[#1F1F1F] text-white 
                    flex items-center justify-center transition-transform duration-300
                    ${isOpen ? 'rotate-180' : ''}
                `}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </div>
            
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 md:px-8 pb-6 md:pb-8 pt-0"
                >
                    <p className="text-[#1F1F1F]/70 leading-relaxed text-base md:text-lg">
                        {answer}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
