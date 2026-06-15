"use client";

import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import TerminalDashboard from '@/components/terminal/WhaleDashboard';

export default function TerminalClient() {
  return (
    <ProvenanceSessionGate>
      <TerminalDashboard />
    </ProvenanceSessionGate>
  );
}
