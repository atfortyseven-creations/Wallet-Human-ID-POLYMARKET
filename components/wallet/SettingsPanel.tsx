"use client";

import { useState } from 'react';
import { WalletConnectSessions } from '@/components/wallet/WalletConnectSessions';
import { toast } from 'sonner';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { useWalletStore } from '@/lib/store/wallet-store';
import { startRegistration } from '@simplewebauthn/browser';

export default function SettingsPanel() {
  const { address: authUserId } = useSystemAccount();
  const { nuclearDisconnect } = useSystemSignOut();
  const { mnemonic } = useWalletStore();
  const [showSecret, setShowSecret] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  const registerPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const resp = await fetch(`/api/auth/webauthn/register?userId=${authUserId}`);
      const options = await resp.json();
      if (options.error) throw new Error(options.error);
      const attResp = await startRegistration(options);
      const verifyResp = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attResp, userId: authUserId }),
      });
      const verification = await verifyResp.json();
      if (verification.verified) {
        toast.success('PASSKEY REGISTERED');
      } else {
        throw new Error(verification.error || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'FAILED TO REGISTER PASSKEY');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <div className="space-y-8 font-mono text-black">
      <section className="border border-black p-6 space-y-6">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">SECURITY</h3>
        
        <div className="space-y-4">
          <button 
            onClick={registerPasskey}
            disabled={isRegisteringPasskey}
            className="w-full flex items-center justify-between p-4 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="font-black uppercase tracking-widest text-[10px]">REGISTER PASSKEY</span>
            {isRegisteringPasskey ? (
              <span className="text-[10px] tracking-widest">PROCESSING...</span>
            ) : (
              <span className="text-[10px] tracking-widest">ADD</span>
            )}
          </button>
        </div>
      </section>

      <section className="border border-black p-6 space-y-6">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">ADVANCED VAULT</h3>
        
        {!showSecret ? (
             <DangerZoneReveal onSuccess={() => setShowSecret(true)} />
        ) : (
            <div className="p-6 border border-black text-center space-y-6">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] break-all leading-loose">
                    {mnemonic || "NO MNEMONIC FOUND"}
                </p>
                <button 
                    onClick={() => setShowSecret(false)}
                    className="w-full px-6 py-4 bg-black text-white text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black border border-black transition-colors"
                >
                    HIDE SECRET
                </button>
            </div>
        )}
      </section>

      <section className="border border-black p-6 space-y-6">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">SESSION MANAGEMENT</h3>
        <div className="flex flex-col gap-4">
          <p className="text-[10px] uppercase tracking-widest">Clear all secure keys and local registries.</p>
          <button 
            onClick={nuclearDisconnect}
            className="w-full px-6 py-4 bg-black text-white text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black border border-black transition-colors"
          >
            DISCONNECT SESSION
          </button>
        </div>
      </section>

      <div className="text-center text-[9px] uppercase tracking-widest opacity-50 pt-4">
        WHALE ALERT NETWORK TERMINAL V2
      </div>
    </div>
  );
}

function DangerZoneReveal({ onSuccess }: { onSuccess: () => void }) {
    const [input, setInput] = useState('');
    const correctPhrase = "WHALE";
    const isMatched = input.toUpperCase() === correctPhrase;

    return (
        <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest">
                TYPE <span className="font-black">WHALE</span> TO REVEAL SECRETS.
            </p>

            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="TYPE WHALE..."
                className="w-full px-6 py-4 border border-black outline-none font-black text-[11px] uppercase tracking-widest transition-colors focus:bg-black focus:text-white placeholder:text-black/30"
            />

            <button
                disabled={!isMatched}
                onClick={() => { if (isMatched) onSuccess(); }}
                className={`w-full h-12 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center border border-black ${
                    isMatched 
                    ? 'bg-black text-white cursor-pointer' 
                    : 'bg-white text-black/30 cursor-not-allowed'
                }`}
            >
                {isMatched ? 'CLICK TO REVEAL' : 'LOCKED'}
            </button>
        </div>
    );
}
