'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const WhaleChatPINGate = dynamic(() => import('@/components/chat/WhaleChatPINGate'), { ssr: false });
const WhaleChatInitPhase = dynamic(() => import('@/components/chat/WhaleChatInitPhase'), { ssr: false });
const SystemChat = dynamic(() => import('@/components/dashboard/SystemChat'), { ssr: false });

export default function ChatClientPage() {
  const [entered, setEntered] = useState(false);
  const [initialized, setInitialized] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!entered ? (
        <WhaleChatPINGate key="gate" onEnter={() => setEntered(true)} />
      ) : !initialized ? (
        <WhaleChatInitPhase key="init" onComplete={() => setInitialized(true)} />
      ) : (
        <SystemChat key="chat" onReturnToGate={() => { setEntered(false); setInitialized(false); }} />
      )}
    </AnimatePresence>
  );
}
