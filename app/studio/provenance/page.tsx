'use client';

import { useEffect, useState } from 'react';
import { ProvenanceSessionGate } from '@/components/provenance/ProvenanceSessionGate';
import { ProvenanceStudioContent } from '@/components/provenance/ProvenanceStudioContent';

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
    );
  }, []);
  return { isMobile, isMounted };
}

export default function ProvenanceStudioPage() {
  const { isMobile, isMounted } = useIsMobileDevice();

  if (!isMounted) return null;

  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent variant={isMobile ? 'mobile' : 'desktop'} />
    </ProvenanceSessionGate>
  );
}
