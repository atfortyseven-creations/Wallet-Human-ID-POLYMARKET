"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { generateWalletMnemonic } from '@/lib/wallet/mnemonic';

interface SeedPhraseBackupDialogProps {
  onComplete: (mnemonic: string) => void;
  onCancel: () => void;
}

export default function SeedPhraseBackupDialog({ onComplete, onCancel }: SeedPhraseBackupDialogProps) {
  const [step, setStep] = useState<'generate' | 'backup' | 'verify'>('generate');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleGenerate = () => {
    const newMnemonic = generateWalletMnemonic(12);
    setMnemonic(newMnemonic);
    setWords(newMnemonic.split(' '));
    setStep('backup');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([`HumanID Wallet Recovery Phrase\n\n${mnemonic}\n\n⚠️ KEEP THIS SAFE AND NEVER SHARE IT`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanid-recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerify = () => {
    setVerificationComplete(true);
    setTimeout(() => {
      onComplete(mnemonic);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#EAEADF] rounded-3xl shadow-2xl p-8 mx-4"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#1F1F1F]/10 transition-colors"
        >
          <X size={24} className="text-[#1F1F1F]" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#1F1F1F] rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={32} className="text-[#EAEADF]" />
                </div>
                <h2 className="text-3xl font-black text-[#1F1F1F]">Create Recovery Phrase</h2>
                <p className="text-[#1F1F1F]/70 max-w-md mx-auto">
                  Your recovery phrase is the key to your wallet. Keep it safe and never share it with anyone.
                </p>
              </div>

              <div className="bg-[#1F1F1F]/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1F1F1F] text-[#EAEADF] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1F1F1F]">Write it down</h3>
                    <p className="text-sm text-[#1F1F1F]/70">Store it in a secure physical location</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1F1F1F] text-[#EAEADF] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1F1F1F]">Never share it</h3>
                    <p className="text-sm text-[#1F1F1F]/70">Anyone with your phrase can access your funds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1F1F1F] text-[#EAEADF] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1F1F1F]">Don't lose it</h3>
                    <p className="text-sm text-[#1F1F1F]/70">If lost, your funds cannot be recovered</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-bold hover:bg-[#1F1F1F]/90 transition-all"
              >
                Generate Recovery Phrase
              </button>
            </motion.div>
          )}

          {step === 'backup' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#1F1F1F] mb-2">Your Recovery Phrase</h2>
                <p className="text-[#1F1F1F]/70">Write down these 12 words in order</p>
              </div>

              {/* Seed Phrase Grid */}
              <div className="relative">
                <div className={`grid grid-cols-3 gap-3 ${!showPhrase && 'blur-md select-none'}`}>
                  {words.map((word, index) => (
                    <div
                      key={index}
                      className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#1F1F1F]/10"
                    >
                      <div className="text-xs text-[#1F1F1F]/50 font-bold mb-1">{index + 1}</div>
                      <div className="font-black text-[#1F1F1F]">{word}</div>
                    </div>
                  ))}
                </div>

                {/* Show/Hide Overlay */}
                {!showPhrase && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowPhrase(true)}
                      className="px-6 py-3 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1F1F1F]/90 transition-all shadow-lg"
                    >
                      <Eye size={20} />
                      Click to Reveal
                    </button>
                  </div>
                )}
              </div>

              {showPhrase && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 bg-white/50 backdrop-blur-sm rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/70 transition-all border border-[#1F1F1F]/10"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-white/50 backdrop-blur-sm rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/70 transition-all border border-[#1F1F1F]/10"
                  >
                    <Download size={20} />
                    Download
                  </button>
                </motion.div>
              )}

              <button
                onClick={handleVerify}
                disabled={!showPhrase}
                className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-bold hover:bg-[#1F1F1F]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                I've Secured My Phrase
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        {verificationComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-[#EAEADF] rounded-3xl flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircle2 size={64} className="text-green-600 mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-black text-[#1F1F1F]">Wallet Created!</h3>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
