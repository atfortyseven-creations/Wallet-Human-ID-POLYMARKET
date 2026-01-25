"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, TrendingUp, Medal, Verified } from "lucide-react";
import Image from "next/image";
import { LEADERBOARD_DATA } from "@/data/leaderboard";
import TipButton from "@/components/leaderboard/TipButton";

const TIME_FRAMES = ["TODAY", "WEEKLY", "MONTHLY", "ALL TIME"];

export default function Leaderboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFrame, setTimeFrame] = useState("ALL TIME");

    // Filter Logic
    const filteredData = useMemo(() => {
        if (!searchQuery) return LEADERBOARD_DATA;
        const lowerQuery = searchQuery.toLowerCase();
        return LEADERBOARD_DATA.filter(user =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.address.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">

                {/* Titles */}
                <div className="space-y-2">
                    <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
                        <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        Global Leaderboard
                    </h2>
                    <p className="text-white/40 text-sm font-sans tracking-wider uppercase ml-1">
                        Top Performers & Whales
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Name or Address..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all shadow-lg shadow-black/20 backdrop-blur-md"
                    />
                </div>
            </div>

            {/* CONTROLS & TABLE HEADER */}
            <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

                {/* Time Frame Tabs */}
                <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                    {TIME_FRAMES.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`
                                relative px-6 py-2.5 rounded-2xl text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 flex-1 md:flex-none
                                ${timeFrame === tf ? 'text-black' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}
                            `}
                        >
                            {timeFrame === tf && (
                                <motion.div
                                    layoutId="activeTime"
                                    className="absolute inset-0 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                />
                            )}
                            <span className="relative z-10">{tf}</span>
                        </button>
                    ))}
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-6 md:col-span-5">User</div>
                    <div className="col-span-3 text-right">Profit / Loss</div>
                    <div className="col-span-2 md:col-span-2 text-right hidden md:block">Volume</div>
                    <div className="col-span-2 md:col-span-1 text-right">Tip</div>
                </div>

                {/* TABLE BODY */}
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="popLayout">
                        {filteredData.map((user, index) => (
                            <motion.div
                                key={user.rank}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors group"
                            >
                                {/* RANK */}
                                <div className="col-span-1 flex justify-center">
                                    {user.rank === 1 && <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">🥇</span>}
                                    {user.rank === 2 && <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(192,192,192,0.5)]">🥈</span>}
                                    {user.rank === 3 && <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(205,127,50,0.5)]">🥉</span>}
                                    {user.rank > 3 && (
                                        <span className="text-sm font-mono text-white/40 font-bold group-hover:text-white/80">
                                            #{user.rank}
                                        </span>
                                    )}
                                </div>

                                {/* USER */}
                                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            fill
                                            className="object-cover rounded-full border-2 border-white/10 group-hover:border-white/30 transition-colors shadow-lg"
                                        />
                                        {user.verified && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px] border border-black shadow-md">
                                                <Verified className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                                            {user.name}
                                            {user.rank <= 3 && <Medal className="w-3 h-3 text-yellow-500/50" />}
                                        </h3>
                                        <p className="text-[10px] font-mono text-white/40 truncate">
                                            {user.address}
                                        </p>
                                    </div>
                                </div>

                                {/* PROFIT */}
                                <div className="col-span-3 text-right">
                                    <div className="text-sm font-bold text-[#00ff9d] drop-shadow-[0_0_8px_rgba(0,255,157,0.3)] font-mono tracking-tight">
                                        {user.profit}
                                    </div>
                                    <div className="text-[10px] text-white/20 uppercase tracking-wider">
                                        Net PnL
                                    </div>
                                </div>

                                {/* VOLUME */}
                                <div className="col-span-2 md:col-span-2 text-right hidden md:block">
                                    <div className="text-sm font-medium text-white/80">
                                        {user.volume}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-white/30">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>30d Vol</span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <TipButton traderName={user.name} traderAddress={user.address} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredData.length === 0 && (
                        <div className="py-12 text-center text-white/30 font-serif italic">
                            No traders found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
