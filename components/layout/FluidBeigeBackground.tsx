import React from 'react';

// FluidBeigeBackground  GPU-optimised version
//  Removed mix-blend-multiply (forces per-pixel read of underlying layer, kills mobile FPS)
//  Removed feTurbulence SVG noise (re-evaluated every frame by CPU)
//  Blobs throttled via CSS animation  no JS loop needed
//  transform: translate3d(0,0,0) hoists each blob onto its own GPU layer
export default function FluidBeigeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F5F5DC]">
      <div className="absolute inset-0 opacity-70 transform-gpu">
        {/* Organic Blobs  radial gradients only, no blend modes */}
        <div
          className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] animate-blob animation-delay-2000 will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(227,220,210,0.75) 0%, rgba(227,220,210,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] animate-blob animation-delay-4000 will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(243,229,171,0.75) 0%, rgba(243,229,171,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />
        <div
          className="absolute bottom-[20%] left-[30%] w-[50vw] h-[50vw] animate-blob will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(234,221,207,0.75) 0%, rgba(234,221,207,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />
      </div>

      {/* Static CSS noise  single alpha layer, NO svg filter, NO blend mode */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4t5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92ZxPLCEkrUT3sAfdlrtCu1HATN1LF+EbrKEcmI9KXrUCPdE9GpDqHxsRTLNBms5otRFSIFnBBe5CZmvWH3M+f/BvbBrFzBUQ/YpPmxNRPf35rNlnPHMnJxE7y9bM4P7fHtFG+n2nRORulF5bfHnFBu6dGdqGbFQoLR6N5HG6OotcMAAFtf+X7h5x4GFUAAAAASUVORK5CYII=")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '96px 96px',
        }}
      />
    </div>
  );
}
