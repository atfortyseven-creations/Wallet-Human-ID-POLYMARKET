"use client";
import dynamic from 'next/dynamic';

const LedgerChat = dynamic(
  () => import('@/components/terminal/LedgerChat').then(m => ({ default: m.LedgerChat })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#F2F2F7] overflow-hidden items-center justify-center">
      {/* PC: constrained to a max width with rounded corners and shadow, like a desktop app */}
      <div className="flex flex-col w-full h-full md:h-[calc(100dvh-40px)] md:max-w-6xl md:rounded-2xl md:overflow-hidden md:shadow-2xl md:border md:border-black/10 bg-white">
        <LedgerChat forceAutoInit={true} />
      </div>
    </div>
  );
}
