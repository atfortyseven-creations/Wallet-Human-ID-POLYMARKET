"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CwiIdentity } from './CwiIdentity';
import { PermissionNexusModal } from '@/components/bsv/PermissionNexusModal';

interface CWIContextType {
  identity: CwiIdentity | null;
  setIdentity: (id: CwiIdentity | null) => void;
  isInitialized: boolean;
  getPublicKey: () => Promise<string>;
  getAddress: () => Promise<string>;
  createAction: (params: any) => Promise<any>;
  encrypt: (data: string | Uint8Array, counterparty?: string) => Promise<string>;
  decrypt: (data: string, counterparty?: string) => Promise<string | Uint8Array>;
  actions: any[];
}

const CWIContext = createContext<CWIContextType | undefined>(undefined);

export function CWIProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<CwiIdentity | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  
  // Permission Nexus State
  const [nexusOpen, setNexusOpen] = useState(false);
  const [nexusData, setNexusData] = useState<any>(null);
  const [nexusResolve, setNexusResolve] = useState<any>(null);

  // No default identity  user must create or import a wallet

  const getPublicKey = useCallback(async () => {
    return identity?.getPublicKey() || '';
  }, [identity]);

  const getAddress = useCallback(async () => {
    return identity?.getAddress() || '';
  }, [identity]);

  const createAction = useCallback(async (params: any) => {
    console.log('CWI: Handshake Request', params);
    
    // Trigger Permission Nexus
    return new Promise((resolve, reject) => {
      setNexusData({ origin: 'External dApp', action: 'createAction', params });
      setNexusResolve(() => async (approved: boolean) => {
        if (approved) {
          const newAction = { 
            id: `tx_${Date.now()}`, 
            params, 
            timestamp: new Date().toISOString(),
            status: 'broadcasted' 
          };
          setActions(prev => [newAction, ...prev]);
          
          // Pure On-Chain emulation: SHA-256 cryptographic digest of the payload
          const encoder = new TextEncoder();
          const payloadBuffer = encoder.encode(JSON.stringify(params) + Date.now());
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', payloadBuffer);
          const hashHex = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0')).join('');
              
          resolve({ txid: hashHex });
        } else {
          reject(new Error('Protocol Handshake Refused by User.'));
        }
        setNexusOpen(false);
      });
      setNexusOpen(true);
    });
  }, [identity]);

  const encrypt = useCallback(async (data: string | Uint8Array, counterparty?: string) => {
    if (!identity) throw new Error('CWI not initialized');
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    return identity.encrypt(bytes, counterparty || '');
  }, [identity]);

  const decrypt = useCallback(async (data: string, counterparty?: string) => {
    if (!identity) throw new Error('CWI not initialized');
    return identity.decrypt(data, counterparty || '');
  }, [identity]);

  const value = {
    identity,
    setIdentity,
    isInitialized: !!identity && identity.isInitialized(),
    getPublicKey,
    getAddress,
    createAction,
    encrypt,
    decrypt,
    actions
  };

  return (
    <CWIContext.Provider value={value}>
      {children}
      <PermissionNexusModal 
        isOpen={nexusOpen}
        onClose={() => setNexusOpen(false)}
        onApprove={() => nexusResolve && nexusResolve(true)}
        onRefuse={() => nexusResolve && nexusResolve(false)}
        origin={nexusData?.origin || 'Unknown'}
        action={nexusData?.action || 'Unknown'}
        params={nexusData?.params || {}}
      />
    </CWIContext.Provider>
  );
}

export function useCWI() {
  const context = useContext(CWIContext);
  if (context === undefined) {
    throw new Error('useCWI must be used within a CWIProvider');
  }
  return context;
}
