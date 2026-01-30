import React from 'react';

export default function FluidBeigeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F5F5DC]">
      <div className="absolute inset-0 opacity-80 mix-blend-multiply transform-gpu">
        {/* Organic Blobs with Radial Gradients (10x faster than filter: blur) */}
        <div 
            className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] animate-blob animation-delay-2000 mix-blend-multiply will-change-transform"
            style={{ background: 'radial-gradient(circle, rgba(227,220,210,0.8) 0%, rgba(227,220,210,0) 70%)' }}
        />
        <div 
            className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] animate-blob animation-delay-4000 mix-blend-multiply will-change-transform"
            style={{ background: 'radial-gradient(circle, rgba(243,229,171,0.8) 0%, rgba(243,229,171,0) 70%)' }}
        />
        <div 
            className="absolute bottom-[20%] left-[30%] w-[50vw] h-[50vw] animate-blob mix-blend-multiply will-change-transform"
            style={{ background: 'radial-gradient(circle, rgba(234,221,207,0.8) 0%, rgba(234,221,207,0) 70%)' }}
        />
      </div>
      
      {/* Noise Texture for Texture/Premium feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
    </div>
  );
}
