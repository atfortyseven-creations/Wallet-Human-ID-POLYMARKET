"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, ShieldAlert, BadgePercent, MessageCircle } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'system' | 'transaction' | 'social';
    read: boolean;
    time: string;
}

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'Admin Broadcast', message: 'Maintenance scheduled for tonight at 2 AM UTC.', type: 'system', read: false, time: '2m ago' },
        { id: '2', title: 'Payment Received', message: 'You received 0.5 ETH from 0x82...9a1', type: 'transaction', read: false, time: '1h ago' },
        { id: '3', title: 'New Referral', message: 'Friend registered! You earned $5.00.', type: 'social', read: true, time: '3h ago' },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch(type) {
            case 'system': return <ShieldAlert size={16} className="text-red-500" />;
            case 'transaction': return <BadgePercent size={16} className="text-green-500" />;
            case 'social': return <MessageCircle size={16} className="text-blue-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full bg-white/50 border border-[#1F1F1F]/5 text-[#1F1F1F]/70 hover:bg-white hover:shadow-md transition-all active:scale-95"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#EAEADF] rounded-full" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-[#1F1F1F]/5 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-[#1F1F1F]/5 flex justify-between items-center bg-[#FAFAF8]">
                                <h3 className="font-bold text-[#1F1F1F]">Notifications</h3>
                                <div className="text-xs text-[#1F1F1F]/40 font-mono">
                                    {unreadCount} unread
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-[#1F1F1F]/40 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`p-4 border-b border-[#1F1F1F]/5 hover:bg-[#FAF9F6] transition-colors relative group ${!n.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-8 h-8 rounded-full bg-white border border-[#1F1F1F]/5 flex items-center justify-center shadow-sm shrink-0`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-sm ${!n.read ? 'font-bold text-[#1F1F1F]' : 'font-medium text-[#1F1F1F]/70'}`}>
                                                            {n.title}
                                                        </h4>
                                                        <span className="text-[10px] text-[#1F1F1F]/40 whitespace-nowrap ml-2">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#1F1F1F]/60 mt-0.5 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Unread Dot */}
                                            {!n.read && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-[#FAFAF8] border-t border-[#1F1F1F]/5 text-center">
                                <button className="text-xs font-bold text-[#1F1F1F]/50 hover:text-[#1F1F1F] transition-colors">
                                    Mark all as changed
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
