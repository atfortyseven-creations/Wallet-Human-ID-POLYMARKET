import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Report · Whale Alert Network',
  description: 'Deep analytical report  Whale Alert Network institutional analytics.',
};

export default function WhalepostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
