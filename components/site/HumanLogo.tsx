import React from 'react';

export function HumanLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
      >
        {/* Main Hexagon Background */}
        <path
          d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
          fill="#8B5CF6"
        />
        {/* Stylized "H" Cutout / Overlay */}
        <path
          d="M35 30V70M65 30V70M35 50H65"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
          strokeOpacity="0.2"
        />
        {/* More Accurate Geometric "H" from Image */}
        <path
          d="M45 25L25 45V75L45 55V25Z"
          fill="black"
          fillOpacity="0.15"
        />
        <path
          d="M75 45L55 25V55L75 75V45Z"
          fill="black"
          fillOpacity="0.15"
        />
        <rect x="45" y="42" width="10" height="16" fill="black" fillOpacity="0.15" />
      </svg>
    </div>
  );
}

