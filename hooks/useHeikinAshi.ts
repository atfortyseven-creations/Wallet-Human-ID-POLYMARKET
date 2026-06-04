"use client";

import { useState, useEffect } from 'react';

export interface HeikinAshiSignal {
  token: string;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  timestamp: string;
}

export function useHeikinAshi(tokens: string[]) {
  const [signals, setSignals] = useState<Record<string, 'LONG' | 'SHORT' | 'NEUTRAL'>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokens.length === 0) return;

    const fetchSignals = async () => {
      setIsLoading(true);
      try {
        // We use the unified analytics API
        // For efficiency, we would ideally pass multiple tokens, 
        // but for now we fetch them one by one or we could add a bulk endpoint.
        // Given the "Legendary" requirement, I'll fetch the top tokens.
        
        const newSignals: Record<string, 'LONG' | 'SHORT' | 'NEUTRAL'> = {};
        
        await Promise.all(tokens.map(async (token) => {
          try {
            const res = await fetch(`/api/v1/whale/analytics?type=heikin-ashi&token=${token}`, {
              headers: {
                'X-WAC-API-KEY': 'DEV_INTERNAL_WAC' // Internal bypass or use a real key if configured
              }
            });
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
              newSignals[token] = data.data[0].signal;
            } else {
              newSignals[token] = 'NEUTRAL';
            }
          } catch (e) {
            newSignals[token] = 'NEUTRAL';
          }
        }));

        setSignals(prev => ({ ...prev, ...newSignals }));
      } catch (error) {
        console.error("Error fetching HA signals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [tokens.join(',')]);

  return { signals, isLoading };
}

