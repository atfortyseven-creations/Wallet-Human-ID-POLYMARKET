'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const WhaleChatPINGate = dynamic(() => import('@/components/chat/WhaleChatPINGate'), { ssr: false });
const WhaleChatInitPhase = dynamic(() => import('@/components/chat/WhaleChatInitPhase'), { ssr: false });
const SystemChat = dynamic(() => import('@/components/dashboard/SystemChat'), { ssr: false });

import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';

export default function ChatClientPage() {
  const [entered, setEntered] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { address, isConnected } = useAccount();

  // If wallet disconnects, strictly force back to Gate
  if (!isConnected || !address) {
    if (entered) {
      setEntered(false);
      setInitialized(false);
    }
    return <WhaleChatPINGate key="gate" onEnter={() => setEntered(true)} />;
  }

  return (
    <AnimatePresence mode="wait">
      {!entered ? (
        <WhaleChatPINGate key="gate" onEnter={() => setEntered(true)} />
      ) : (
        <SystemChat key="chat" onReturnToGate={() => { setEntered(false); setInitialized(false); }} />
      )}
    </AnimatePresence>
  );
}
