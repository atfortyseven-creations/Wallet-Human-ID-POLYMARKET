'use client';

import React from 'react';

export type HLLogoVariant = 'mark' | 'full';
export type HLLogoTheme = 'dark' | 'light' | 'accent';

interface HLLogoProps {
  variant?: HLLogoVariant;
  theme?: HLLogoTheme;
  className?: string;
  size?: number;
  priority?: boolean;
}

export function HLLogo({ variant = 'full', theme = 'dark', className = '', size = 32 }: HLLogoProps) {
  const fg = theme === 'dark' ? '#0A0A0A' : theme === 'light' ? '#FFFFFF' : '#D4FF28';
  const strokeColor = theme === 'dark' ? '#FFFFFF' : '#0A0A0A';

  const Mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="32" height="32" rx="7" fill={fg} />
      <path
        d="M9 8V24M23 8V24M9 16H23"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={className} role="img" aria-label="Humanity Ledger">{Mark}</div>;
  }

  return (
    <div
      className={`flex items-center gap-[10px] ${className}`}
      role="img"
      aria-label="Humanity Ledger"
    >
      {Mark}
      <span
        style={{
          fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: Math.round(size * 0.5),
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: fg,
          textTransform: 'uppercase',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Humanity{' '}
        <span style={{ opacity: 0.45 }}>Ledger</span>
      </span>
    </div>
  );
}

export const HLMark = (props: Omit<HLLogoProps, 'variant'>) =>
  <HLLogo {...props} variant="mark" />;

export const WhaleLogo = HLLogo;
