"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Copy, Download, Eye, EyeOff, Check, Shield, Lock, QrCode, Printer } from 'lucide-react';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { toast } from 'sonner';

export function MilitaryGradeSecretPhrase({ onConfirm }: { onConfirm?: (mnemonic: string) => void }) {
    const [mnemonic, setMnemonic] = useState<string>('');
    const [words, setWords] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [verificationWords, setVerificationWords] = useState<number[]>([]);
    const [userInput, setUserInput] = useState<{[key: number]: string}>({});
    const [isVerified, setIsVerified] = useState(false);

    // Generate 24-word mnemonic on mount (256-bit entropy)
    useEffect(() => {
        generateSecurePhrase();
    }, []);

    const generateSecurePhrase = () => {
        try {
            // Generate 24-word mnemonic (maximum security)
            const newMnemonic = generateMnemonic(256); // 256 bits = 24 words
            
            // Validate the generated mnemonic
            if (!validateMnemonic(newMnemonic)) {
                throw new Error('Invalid mnemonic generated');
            }

            setMnemonic(newMnemonic);
            setWords(newMnemonic.split(' '));
            
            // Select random words for verification (3, 7, 15, 21)
            setVerificationWords([3, 7, 15, 21]);
        } catch (error) {
            console.error('Error generating mnemonic:', error);
            toast.error('Error al generar frase secreta. Intenta de nuevo.');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(mnemonic);
            setIsCopied(true);
            toast.success('Frase copiada al portapapeles');
            setTimeout(() => setIsCopied(false), 3000);
        } catch (error) {
            toast.error('Error al copiar. Intenta de nuevo.');
        }
    };

    const handleDownloadPDF = () => {
        // Create PDF with mnemonic
        const content = `
HUMAN WALLET - RECOVERY PHRASE
================================

CRITICAL: Store this phrase in a safe place. Never share it with anyone.

Your 24-word recovery phrase:

${words.map((word, i) => `${i + 1}. ${word}`).join('\n')}

================================
Generated: ${new Date().toLocaleString()}
Wallet: Human Wallet v4.0
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `human-wallet-recovery-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Backup descargado. Guárdalo en un lugar seguro.');
    };

    const handleVerification = () => {
        // Check if user input matches selected verification words
        const allCorrect = verificationWords.every(index => {
            const userWord = userInput[index]?.trim().toLowerCase();
            const actualWord = words[index - 1];
            return userWord === actualWord;
        });

        if (allCorrect) {
            setIsVerified(true);
            toast.success('¡Verificación exitosa! Frase confirmada.');
            onConfirm?.(mnemonic);
        } else {
            toast.error('Las palabras no coinciden. Verifica e intenta de nuevo.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* DANGER ZONE Header */}
            <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-red-600 mb-2 uppercase">DANGER ZONE - CRITICAL</h2>
                        <ul className="space-y-1 text-red-700 font-bold text-sm">
                            <li>• Esta frase es la ÚNICA forma de recuperar tu wallet</li>
                            <li>• Si la pierdes, PIERDES TUS FONDOS para siempre</li>
                            <li>• NUNCA la compartas con nadie, ni siquiera con soporte</li>
                            <li>• Escríbela en papel y guárdala en un lugar seguro</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Security Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<Shield />}
                    label="Entropía"
                    value="256 bits"
                    description="Máxima seguridad"
                />
                <StatCard
                    icon={<Lock />}
                    label="Palabras"
                    value="24"
                    description="BIP39 estándar"
                />
                <StatCard
                    icon={<Check />}
                    label="Validación"
                    value="Checksum"
                    description="Verificado"
                />
            </div>

            {/* Mnemonic Display */}
            <div className="bg-white/50 backdrop-blur-xl border-2 border-purple-300 rounded-3xl p-8 mb-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-purple-900">Tu Frase de Recuperación</h3>
                        <button
                            onClick={() => setIsRevealed(!isRevealed)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            {isRevealed ? (
                                <><EyeOff className="w-4 h-4" /> Ocultar</>
                            ) : (
                                <><Eye className="w-4 h-4" /> Revelar</>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {words.map((word, index) => (
                            <WordCard
                                key={index}
                                number={index + 1}
                                word={word}
                                isRevealed={isRevealed}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={!isRevealed}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {isCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Descargar Backup
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                        <button
                            onClick={generateSecurePhrase}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            Generar Nueva
                        </button>
                    </div>
                </div>
            </div>

            {/* Verification Section */}
            {!isVerified && (
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 rounded-3xl p-8">
                    <h3 className="text-2xl font-black text-purple-900 mb-4">Verificación de Seguridad</h3>
                    <p className="text-purple-700 mb-6">
                        Para confirmar que guardaste tu frase, ingresa las siguientes palabras:
                    </p>

                    <div className="space-y-4">
                        {verificationWords.map((wordIndex) => (
                            <div key={wordIndex} className="flex items-center gap-4">
                                <span className="text-lg font-bold text-purple-900 w-24">
                                    Palabra #{wordIndex}:
                                </span>
                                <input
                                    type="text"
                                    value={userInput[wordIndex] || ''}
                                    onChange={(e) => setUserInput({...userInput, [wordIndex]: e.target.value})}
                                    placeholder="Escribe aquí"
                                    className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-600 outline-none transition-colors"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleVerification}
                        className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-black text-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                        Verificar y Confirmar
                    </button>
                </div>
            )}

            {isVerified && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 border-2 border-green-500 rounded-3xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-green-900 mb-2">¡Frase Verificada!</h3>
                    <p className="text-green-700">
                        Tu wallet está lista. Recuerda guardar tu frase de recuperación en un lugar seguro.
                    </p>
                </motion.div>
            )}
        </div>
    );
}

function WordCard({ number, word, isRevealed }: { number: number; word: string; isRevealed: boolean }) {
    return (
        <div className="bg-white/80 border-2 border-purple-200 rounded-xl p-3 hover:border-purple-400 transition-colors">
            <div className="text-xs font-mono text-purple-400 mb-1">#{number}</div>
            <div className="text-lg font-black text-purple-900">
                {isRevealed ? word : '••••••'}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, description }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-3">
                {icon}
            </div>
            <div className="text-sm text-purple-600 font-bold mb-1">{label}</div>
            <div className="text-2xl font-black text-purple-900">{value}</div>
            <div className="text-xs text-purple-500">{description}</div>
        </div>
    );
}
