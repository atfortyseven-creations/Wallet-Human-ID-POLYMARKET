"use client";
import dynamic from 'next/dynamic';

const LedgerChat = dynamic(
  () => import('@/components/terminal/LedgerChat').then(m => ({ default: m.LedgerChat })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="flex flex-col w-full h-[100dvh] bg-white overflow-hidden">
      <LedgerChat forceAutoInit={true} />
    </div>
  );
}
