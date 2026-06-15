"use client";

import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { ProvenanceStudioContent } from '@/components/provenance/ProvenanceStudioContent';

export default function TerminalClient() {
  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent variant="desktop" />
    </ProvenanceSessionGate>
  );
}
