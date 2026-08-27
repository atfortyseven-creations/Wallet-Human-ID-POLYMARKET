import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ledger Support',
  description: '24/7 sovereign-grade assistance for the Humanity Ledger Pro ecosystem.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
