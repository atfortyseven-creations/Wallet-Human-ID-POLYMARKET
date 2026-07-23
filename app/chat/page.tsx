import { WhaleChat } from '@/components/terminal/WhaleChat';

export const metadata = {
  title: 'Whale Chat · Sovereign Network',
  description: 'Zero-knowledge end to end encrypted messaging with hardware binding.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col w-full h-[100dvh] bg-white overflow-hidden">
      <WhaleChat forceAutoInit={true} />
    </div>
  );
}

