import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { SECURITY_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function SecurityPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Security Policy"
      title="Security Policy"
      subtitle="Zero-trust architecture, formal threat modeling, continuous vulnerability disclosure, and cryptographic guarantees underpinning all Humanity Ledger infrastructure."
      sections={SECURITY_SECTIONS}
    />
  );
}
