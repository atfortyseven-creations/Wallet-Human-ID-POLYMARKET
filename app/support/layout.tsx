import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whale Support',
  description: '24/7 institutional-grade assistance for the Whale Alert Pro ecosystem.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
