"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TelemetryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sendTelemetry = (action: string, metadata: any) => {
      fetch('/api/forum/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, metadata }),
        // keepalive ensures the request fires even if the user navigates away
        keepalive: true 
      }).catch(() => {});
    };

    // Track Page View
    sendTelemetry('PAGE_VIEW', { path: pathname, timestamp: Date.now() });

    // Track Time on Page when unmounting
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      sendTelemetry('PAGE_EXIT', { path: pathname, durationMs: duration });
    };
  }, [pathname]);

  return null; // Silent component
}
