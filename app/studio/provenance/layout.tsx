import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Provenance Studio · Create Product Records',
  description:
    'Register product records, generate scannable QR labels, and confirm them permanently on the blockchain. Designed for manufacturers, certifiers, and public institutions.',
  openGraph: {
    title: 'Provenance Studio',
    description:
      'Create verifiable product records with QR codes and on-chain confirmation. Built on Aztec Network.',
  },
};

export default function StudioProvenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
