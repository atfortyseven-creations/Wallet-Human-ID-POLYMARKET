import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Report · Humanity Ledger',
  description: 'Deep analytical report  Humanity Ledger sovereign analytics.',
};

export default function WhalepostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
