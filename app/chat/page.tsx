"use client";
import dynamic from 'next/dynamic';

const LedgerChat = dynamic(
  () => import('@/components/terminal/LedgerChat').then(m => ({ default: m.LedgerChat })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#F2F2F7] overflow-hidden">
      {/* PC & Mobile: Fill the entire screen exactly like a native app */}
      <div className="flex flex-col w-full h-full bg-white">
        <LedgerChat forceAutoInit={true} />
      </div>
    </div>
  );
}
