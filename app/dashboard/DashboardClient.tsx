"use client";

import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { ProvenanceStudioContent } from '@/components/provenance/ProvenanceStudioContent';

export default function DashboardClient() {
  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent variant="desktop" />
    </ProvenanceSessionGate>
  );
}
