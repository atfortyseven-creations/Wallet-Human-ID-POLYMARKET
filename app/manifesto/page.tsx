import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { MANIFESTO_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function ManifestoPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Privacy Manifesto"
      title="Privacy Manifesto"
      subtitle="The foundational principles governing data Privatety, financial confidentiality, and cryptographic self-determination within the Humanity Ledger protocol."
      sections={MANIFESTO_SECTIONS}
    />
  );
}
