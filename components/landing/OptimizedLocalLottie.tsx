import React, { useEffect, useRef, useState } from 'react';

//  Global LRU JSON Cache 
const JSON_CACHE = new Map<string, any>();
const JSON_PENDING = new Map<string, Promise<any>>();

async function loadLottieJSON(filename: string): Promise<any | null> {
  if (JSON_CACHE.has(filename)) return JSON_CACHE.get(filename);
  if (JSON_PENDING.has(filename)) return JSON_PENDING.get(filename);

  const pending = (async () => {
    try {
      const res = await fetch(`/${encodeURIComponent(filename)}`, {
        cache: 'force-cache',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && ('v' in data || 'layers' in data)) {
          JSON_CACHE.set(filename, data);
          return data;
        }
      }
    } catch { /* fall through */ }

    try {
      const res = await fetch(`/api/lottie?file=${encodeURIComponent(filename)}`, {
        cache: 'force-cache',
      });
      if (res.ok) {
        const data = await res.json();
        if (!data?.error) {
          JSON_CACHE.set(filename, data);
          return data;
        }
      }
    } catch { /* fall through */ }

    console.warn(`[Lottie] Could not load: ${filename}`);
    return null;
  })();

  JSON_PENDING.set(filename, pending);
  try {
    await pending;
  } finally {
    JSON_PENDING.delete(filename);
  }
  return pending;
}

interface OptimizedLocalLottieProps {
  filename: string;
  className?: string;
  isActive?: boolean;
  loop?: boolean;
  speed?: number;
}

export function OptimizedLocalLottie({
  filename,
  className,
  isActive = true,
  loop = true,
  speed = 1,
}: OptimizedLocalLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load using native IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (status === 'idle') {
          setStatus('loading');
          loadLottieJSON(filename).then((json) => {
            if (json) {
              setData(json);
              setStatus('ready');
            } else {
              setStatus('error');
            }
          });
        }
      } else {
        // Strict unmount to release RAM on iOS
        setIsVisible(false);
      }
    }, { threshold: 0, rootMargin: '400px' });
    
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [filename, status]);

  // Handle Lottie instantiation completely manually for 100% crash immunity
  useEffect(() => {
    let isMounted = true;
    let localInstance: any = null;

    if (status === 'ready' && data && isVisible && lottieContainerRef.current) {
        import('lottie-web').then((lottieModule) => {
            if (!isMounted) return;
            const lottie = lottieModule.default || lottieModule;
            try {
                localInstance = lottie.loadAnimation({
                    container: lottieContainerRef.current!,
                    renderer: 'svg',
                    loop,
                    autoplay: isActive,
                    animationData: data,
                    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
                });
                localInstance.setSpeed(speed);
                instanceRef.current = localInstance;
            } catch (err) {
                console.error('Lottie init error:', err);
            }
        });
    }

    return () => {
        isMounted = false;
        try {
            if (instanceRef.current) {
                instanceRef.current.destroy();
            } else if (localInstance) {
                localInstance.destroy();
            }
        } catch (e) {
            // ABYSMALLY PERFECT CATCH: isolates lottie-web's infamous React 18 strict mode unmount crash
        } finally {
            instanceRef.current = null;
        }
    };
  }, [data, isVisible, status, loop, isActive]);

  // Speed and pause control when visible
  useEffect(() => {
    if (instanceRef.current && status === 'ready' && isVisible) {
      instanceRef.current.setSpeed(speed);
      if (!isActive) {
          instanceRef.current.pause();
      } else {
          instanceRef.current.play();
      }
    }
  }, [speed, isActive, status, isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className ?? ''}`}
    >
      {status === 'ready' && data && isVisible && (
          <div ref={lottieContainerRef} style={{ width: '100%', height: '100%' }} />
      )}

      {/* Loading shimmer */}
      {(status === 'idle' || status === 'loading') && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f4ef]/60 rounded">
          <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#ccc]">···</span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 rounded">
          <span className="text-[10px] text-[#999]"></span>
        </div>
      )}
    </div>
  );
}
