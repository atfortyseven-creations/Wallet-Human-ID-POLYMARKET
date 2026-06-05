"use client";

import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface Props {
  whales: any[];
  isSystemFlow: boolean;
  onProfileClick: (address: string) => void;
}

export function MacroEntityConstellations({ whales, isSystemFlow, onProfileClick }: Props) {
  
  // Transform real-time whales into Scatter plot data
  const data = useMemo(() => {
    let pts = whales.map((tx, idx) => {
        const btc = tx.value / 1e8;
        return {
            id: tx.txid,
            index: whales.length - idx, // X axis: older to newer (relative time)
            btc: btc,
            size: Math.max(20, Math.min(800, btc * 2)), // Scatter node size
            address: tx.vout?.[0]?.scriptpubkey_address || '',
            isSystem: btc > 100,
            feeRate: tx.fee / tx.vsize
        }
    });

    if (isSystemFlow) {
        pts = pts.filter(p => p.isSystem);
    }
    return pts;
  }, [whales, isSystemFlow]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-black/80 backdrop-blur-md border border-indigo-500/30 p-3 rounded-xl shadow-2xl">
            <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mb-1">Kinetic Event</div>
            <div className="font-mono text-white text-lg">{p.btc.toFixed(2)} BTC</div>
            <div className="text-gray-500 text-[10px] mt-1 break-all w-48 font-mono">{p.address}</div>
            <div className="text-cyan-500 text-[10px] mt-2 font-mono">{p.feeRate.toFixed(1)} sat/vB</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[500px] relative">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" style={{ backgroundSize: '40px 40px' }} />
       
       <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
             <Activity size={12} className="text-indigo-400" />
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Time-Space Constellations</span>
          </div>
       </div>

       <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 60, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
                type="number" 
                dataKey="index" 
                name="Time" 
                hide 
                domain={['dataMin - 1', 'dataMax + 1']} 
            />
            <YAxis 
                type="number" 
                dataKey="btc" 
                name="Volume" 
                hide 
                domain={['dataMin', 'dataMax + 50']} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(99, 102, 241, 0.2)' }} />
            <Scatter name="Whales" data={data} onClick={(e) => {
                if(e && e.payload && e.payload.address) onProfileClick(e.payload.address);
            }}>
                {data.map((entry, index) => {
                    const isGiant = entry.btc > 1000;
                    const isMega = entry.btc > 100;
                    let fill = 'rgba(139, 92, 246, 0.4)'; // Default purple
                    let stroke = 'rgba(139, 92, 246, 0.8)';

                    if (isSystemFlow) {
                        fill = 'rgba(6, 182, 212, 0.4)';
                        stroke = 'rgba(6, 182, 212, 0.8)';
                        if (isGiant) {
                            fill = 'rgba(6, 182, 212, 0.8)';
                            stroke = 'rgba(255, 255, 255, 1)';
                        }
                    } else if (isGiant) {
                        fill = 'rgba(244, 63, 94, 0.5)';
                        stroke = 'rgba(244, 63, 94, 1)';
                    } else if (isMega) {
                        fill = 'rgba(249, 115, 22, 0.4)';
                        stroke = 'rgba(249, 115, 22, 0.8)';
                    }

                    return (
                        <Cell 
                           key={`cell-${index}`} 
                           fill={fill} 
                           stroke={stroke} 
                           strokeWidth={isGiant ? 2 : 1}
                           className="transition-all duration-300 hover:opacity-80 hover:brightness-150 cursor-pointer"
                        />
                    );
                })}
            </Scatter>
        </ScatterChart>
       </ResponsiveContainer>

       {/* HUD Overlays */}
       <div className="absolute bottom-4 right-4 pointer-events-none text-right">
           <div className="text-[10px] text-gray-500 uppercase tracking-widest">Y-Axis: Relative Mass (BTC Volume)</div>
           <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">X-Axis: Real-Time Event Sequence</div>
       </div>
    </div>
  );
}

