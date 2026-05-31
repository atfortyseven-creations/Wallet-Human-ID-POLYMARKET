import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Registry · Studio Provenance',
  description:
    'All product records registered through Studio Provenance. Each record carries a verifiable QR code and a permanent reference on the public blockchain.',
  openGraph: {
    title: 'Product Registry · Studio Provenance',
    description:
      'Browse all on-chain product records. Scan any QR code to verify authenticity instantly.',
  },
};

export default function RegistryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
