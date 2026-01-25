"use client";

import { motion } from "framer-motion";
import { Newspaper, Wallet, Trophy } from "lucide-react";

type Tab = "NEWS" | "WALLET" | "LEADERBOARD";

interface GlassDockProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function GlassDock({ activeTab, onTabChange }: GlassDockProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto">
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex p-1.5 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl relative"
            >
                <TabButton
                    isActive={activeTab === "NEWS"}
                    onClick={() => onTabChange("NEWS")}
                    icon={<Newspaper className="w-4 h-4" />}
                    label="NEWS"
                />

                <div className="w-[1px] bg-white/5 mx-1 my-2" />

                <TabButton
                    isActive={activeTab === "LEADERBOARD"}
                    onClick={() => onTabChange("LEADERBOARD")}
                    icon={<Trophy className="w-4 h-4" />}
                    label="LEADERBOARD"
                />

                <div className="w-[1px] bg-white/5 mx-1 my-2" />

                <TabButton
                    isActive={activeTab === "WALLET"}
                    onClick={() => onTabChange("WALLET")}
                    icon={<Wallet className="w-4 h-4" />}
                    label="WALLET"
                />
            </motion.div>
        </div>
    );
}

function TabButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-6 py-3 rounded-full flex items-center gap-3 transition-colors duration-300 ${isActive ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            <span className="relative z-10 flex items-center gap-2 font-sans text-xs font-bold tracking-wider">
                {icon}
                <span className="hidden md:block">{label}</span>
            </span>
        </button>
    );
}
