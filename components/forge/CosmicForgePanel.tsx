'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntityCard } from './EntityCard';
import { Loader2, Zap, Activity, Box } from 'lucide-react';

export function CosmicForgePanel() {
  const [hiveEnergy, setHiveEnergy] = useState<number | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Hive Energy and Latest Entities
  useEffect(() => {
    async function fetchForgeState() {
      try {
        const [hiveRes, entitiesRes] = await Promise.all([
          fetch('/api/forge/hive'),
          fetch('/api/forge/entities')
        ]);
        const hiveData = await hiveRes.json();
        const entitiesData = await entitiesRes.json();
        
        setHiveEnergy(hiveData.energy);
        setEntities(entitiesData.entities || []);
      } catch (e) {
        console.error("Failed to load Data Studio state", e);
      } finally {
        setLoading(false);
      }
    }
    fetchForgeState();

    // SSE Realtime Updates
    const evtSource = new EventSource('/api/forge/stream');
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'HIVE_UPDATE') {
          setHiveEnergy(data.energy);
        } else if (data.type === 'ENTITY_SPAWN' || data.type === 'ENTITY_EVOLUTION') {
          setEntities(prev => [data.entity, ...prev.filter(e => e.id !== data.entity.id)]);
        }
      } catch (err) {}
    };

    return () => evtSource.close();
  }, []);

  return (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto">
      <div className="flex flex-col gap-8 max-w-[2560px] mx-auto text-left">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-[#050505]">
              Akashic Data Studio
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-widest text-black/50 max-w-md">
              Living entities spawned by institutional whale volume. Evolution determined by macro market entropy and network activity.
            </p>
          </div>

          {/* Hive Energy Bar */}
          <div className="flex items-center gap-3 px-5 py-4 bg-white border border-black/10 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">Hive Energy</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#050505]">
                  {hiveEnergy !== null ? `$${(hiveEnergy/1e6).toFixed(2)}M` : '---'}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel / Simulation */}
        {process.env.NODE_ENV !== 'production' && (
           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-yellow-800 font-mono uppercase font-black tracking-widest">Dev Mode: Event Simulator</span>
              <button onClick={() => {
                fetch('/api/forge/entities', { method: 'POST' });
              }} className="px-4 py-2 bg-black text-white text-[10px] uppercase font-black tracking-widest rounded-lg">
                Invoke Dummy Seed
              </button>
           </div>
        )}

        <div className="flex items-center justify-between mt-8 border-b border-black/10 pb-4">
           <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-black/40" /> Active Entities
           </h2>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-black/20" size={32} />
             <span className="text-[10px] font-mono tracking-widest text-black/30 uppercase">Synchronizing Hive State...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {entities.map(entity => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
              {entities.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-3xl">
                  <Box size={42} className="text-black/10 mb-4" />
                  <p className="text-[12px] font-black uppercase tracking-widest text-black/30">Dormant State</p>
                  <p className="text-[10px] text-black/20 font-medium">No institutional anomalies detected.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
