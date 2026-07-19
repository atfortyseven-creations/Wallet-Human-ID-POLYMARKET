"use client";

import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { TuringShieldGate } from '@/components/auth/TuringShieldGate';
import TerminalDashboard from '@/components/terminal/WhaleDashboard';

export default function TerminalClient() {
  return (
    <ProvenanceSessionGate>
      <TuringShieldGate>
        <TerminalDashboard />
      </TuringShieldGate>
    </ProvenanceSessionGate>
  );
}
