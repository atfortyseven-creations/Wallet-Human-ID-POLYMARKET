import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Compliance — Humanity Ledger S.L. | Whale Network',
  description: 'Complete regulatory compliance documentation for the Whale Network protocol and $QDs token. MiCA, GDPR, AML/CFT, KYC, CNMV notification package — Humanity Ledger S.L.',
  openGraph: {
    title: 'Legal Compliance Framework — Humanity Ledger S.L.',
    description: 'Full MiCA-compliant regulatory documentation for the $QDs token on Aztec Network.',
  },
};

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
