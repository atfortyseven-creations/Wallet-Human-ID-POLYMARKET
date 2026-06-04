import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { DEVELOPER_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function DeveloperPage() {
  return (
    <AztecDocPage
      eyebrow="Developers · Developer Hub"
      title="Developer Hub"
      subtitle="Comprehensive documentation, SDKs, and reference implementations for integrating institutional-grade zero-knowledge privacy into your decentralized applications."
      sections={DEVELOPER_SECTIONS}
    />
  );
}
