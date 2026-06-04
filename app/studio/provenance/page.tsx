'use client';

import { useEffect, useState } from 'react';
import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { ProvenanceStudioContent } from '@/components/provenance/ProvenanceStudioContent';

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
    );
  }, []);
  return isMobile;
}

export default function ProvenanceStudioPage() {
  const isMobile = useIsMobileDevice();

  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent variant={isMobile ? 'mobile' : 'desktop'} />
    </ProvenanceSessionGate>
  );
}
