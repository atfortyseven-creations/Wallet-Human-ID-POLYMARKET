"use client";
import dynamic from 'next/dynamic';

const LedgerChat = dynamic(
  () => import('@/components/terminal/LedgerChat').then(m => ({ default: m.LedgerChat })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    // [LAYOUT FIX] The ClientLayout already wraps /chat in `fixed inset-0 flex flex-col overflow-hidden`.
    // This page just needs to hand off a flex-1 min-h-0 flex-col child so LedgerChat
    // can own the full remaining height with no dead-space below.
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-white">
      <LedgerChat forceAutoInit={true} />
    </div>
  );
}
