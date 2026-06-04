import ChatClientPage from '@/components/chat/ChatClientPage';

export const metadata = {
  title: 'Whale Chat · Whale Alert Network',
  description: 'End-to-end encrypted messaging with on-chain analytics.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-0 relative bg-white">
      <ChatClientPage />
    </div>
  );
}

