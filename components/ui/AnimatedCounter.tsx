'use client';

import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { safeToLocaleString } from '@/lib/utils/number-format';

interface AnimatedCounterProps {
  value: number;
  isCurrency?: boolean;
  duration?: number;
}

export function AnimatedCounter({ value, isCurrency = true, duration = 1.2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });

    return () => controls.stop();
  }, [value, duration]);

  if (isCurrency) {
    return <>{`$${safeToLocaleString(displayValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</>;
  }

  return <>{safeToLocaleString(displayValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}
