"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
}

interface AIConciergeProps {
    portfolioData?: {
        assets: any[];
        totalValue: number;
        legendaryScore: number;
        strategicInsight: string;
    };
}

export default function AIConcierge({ portfolioData }: AIConciergeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: 'welcome', 
            role: 'assistant', 
            content: "Hello! I'm your Financial Logic Core. Analyze fees, detect scams, or find arbitrage?",
            suggestions: ["How much gas did I spend?", "Analyze my portfolio risk", "Any high-yield stables?"]
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate API delay
        try {
            const response = await fetch('/api/ai/concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: text,
                    portfolioContext: portfolioData
                })
            });
            const data = await response.json();

            setIsTyping(false);
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: data.answer || "Processing anomaly. Try again.",
                suggestions: data.suggestions
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'assistant', 
                content: "System offline. Logic Core rebooting..." 
            }]);
        }
    };

    return (
        <>
            {/* FLOATING TRIGGER */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-2xl transition-all ${
                    isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                style={{
                    background: 'linear-gradient(135deg, #1F1F1F 0%, #000000 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Sparkles className="text-purple-400 animate-pulse" size={24} />
            </motion.button>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[90vw] h-[600px] max-h-[70vh] flex flex-col rounded-[32px] overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-[#EAEADF]/95"
                    >
                        {/* Header */}
                        <div className="p-4 bg-white/50 border-b border-black/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                                    <Sparkles className="text-purple-400" size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1F1F1F] text-sm">Financial Concierge</h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={20} className="text-black/50" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F5F5F0]">
                            {messages.map((msg) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-[#1F1F1F] text-white rounded-tr-none' 
                                                : 'bg-white text-[#1F1F1F] rounded-tl-none border border-black/5'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Suggestions pills */}
                            {messages.length > 0 && messages[messages.length - 1].suggestions && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {messages[messages.length - 1].suggestions!.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="text-xs font-bold px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors border border-purple-200"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-black/5 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce [animation-delay:0.1s]" />
                                        <div className="w-1.5 h-1.5 bg-black/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 border-t border-black/5 backdrop-blur-md">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2 bg-[#F5F5F0] rounded-full px-2 py-2 border border-black/5 focus-within:border-purple-500/50 transition-colors"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 text-[#1F1F1F] placeholder:text-black/30"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-8 h-8 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

