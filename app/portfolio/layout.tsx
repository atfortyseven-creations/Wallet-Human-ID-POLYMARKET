import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whale Portfolio',
  description: 'Manage and track your system asset portfolio with high-fidelity analytics.',
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
