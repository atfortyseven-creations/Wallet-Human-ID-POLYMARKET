"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 1,
  className = "",
  style,
  format = (val: number) => val.toString(),
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  format?: (val: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration,
    bounce: 0,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
  }, [springValue, format]);

  return <span ref={ref} className={className} style={style}>{format(value)}</span>;
}
