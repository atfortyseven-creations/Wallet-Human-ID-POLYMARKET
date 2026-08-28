'use client';
import React, { useRef, useEffect, useState } from 'react';

interface LottieSendButtonProps {
  onTrigger?: () => void;
  disabled?: boolean;
  'data-key'?: number;
}

export function LottieSendButton({ onTrigger, disabled, 'data-key': dataKey }: LottieSendButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const [animData, setAnimData] = useState<any>(null);
  const prevKey = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetch('/lottie/send-button.json')
      .then(r => r.json())
      .then(setAnimData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current || !animData) return;
    import('lottie-web').then(mod => {
      const lottie = mod.default || mod;
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      instanceRef.current = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: animData,
      });
      // Stay at first frame
      instanceRef.current.goToAndStop(0, true);
    });
    return () => { instanceRef.current?.destroy(); };
  }, [animData]);

  // Play animation when dataKey changes (new key = new send triggered)
  useEffect(() => {
    if (!instanceRef.current) return;
    if (dataKey !== undefined && dataKey !== prevKey.current) {
      prevKey.current = dataKey;
      instanceRef.current.goToAndPlay(0, true);
    }
  }, [dataKey]);

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onTrigger}
      className="w-9 h-9 rounded-full bg-[#1c7aff] flex items-center justify-center text-white disabled:opacity-30 active:scale-90 transition-all shadow-sm shrink-0 overflow-hidden"
      aria-label="Send message"
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </button>
  );
}
