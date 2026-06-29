import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Report · Whale Network',
  description: 'Deep analytical report  Whale Network sovereign analytics.',
};

export default function WhalepostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
