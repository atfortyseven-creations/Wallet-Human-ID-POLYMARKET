import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { ProvenanceStudioContent } from '@/components/provenance/ProvenanceStudioContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Provenance | Whale Network',
  description: 'Zero-knowledge verifiable product passports on Aztec Network.',
};

export default function StudioProvenancePage() {
  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent />
    </ProvenanceSessionGate>
  );
}
