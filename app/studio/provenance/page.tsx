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

  // [ATOMIC INDEXING] Log studio access once per day
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `provenance_studio_${new Date().toDateString()}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      fetch('/api/provenance/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'STUDIO_ACCESS', details: { path: '/studio/provenance' } })
      }).catch(() => {});
    }
  }, []);

  if (!isMounted) return null;

  return (
    <ProvenanceSessionGate>
      <ProvenanceStudioContent variant={isMobile ? 'mobile' : 'desktop'} />
    </ProvenanceSessionGate>
  );
}
