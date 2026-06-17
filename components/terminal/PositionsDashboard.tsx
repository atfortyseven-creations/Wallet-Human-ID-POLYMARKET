"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Position } from "@/hooks/usePolymarketPositions";

export default function PositionsDashboard({ positions, isLoading }: { positions: Position[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-black/40 space-y-2 rounded-3xl bg-[#FFFFFF] border border-black/10">
                <p>No active positions found.</p>
                <p className="text-xs">Browse markets to start attesting.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-black/5 text-black/40 uppercase tracking-wider text-[10px]">
                            <th className="px-6 py-4 font-bold">Market</th>
                            <th className="px-6 py-4 font-bold text-right">Avg</th>
                            <th className="px-6 py-4 font-bold text-right">Now</th>
                            <th className="px-6 py-4 font-bold text-right">Bet</th>
                            <th className="px-6 py-4 font-bold text-right">To Win</th>
                            <th className="px-6 py-4 font-bold text-right text-emerald-600">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {positions.map((pos, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group hover:bg-black/5 transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-black max-w-[200px] truncate" title={pos.market}>
                                    {pos.market}
                                </td>
                                <td className="px-6 py-4 text-right text-black/70">{pos.avgPrice}</td>
                                <td className="px-6 py-4 text-right text-black/70">{pos.currentPrice}</td>
                                <td className="px-6 py-4 text-right text-black/70">${pos.betAmount}</td>
                                <td className="px-6 py-4 text-right text-emerald-600">${pos.toWin}</td>
                                <td className="px-6 py-4 text-right font-bold text-black shadow-sm">
                                    ${pos.currentValue}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

