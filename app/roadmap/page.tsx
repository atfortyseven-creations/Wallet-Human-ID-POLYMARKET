import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { ROADMAP_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function RoadmapPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · System Architecture"
      title="System Architecture"
      subtitle="Five-phase implementation plan for the Humanity Ledger protocol on the Aztec Network. Each phase builds on verified foundations, from cryptographic infrastructure to full institutional adoption."
      sections={ROADMAP_SECTIONS}
    />
  );
}
