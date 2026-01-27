import React, { memo } from 'react';

const BackgroundVideo: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
            {/* El Video: Se llama directamente desde /public/background.mp4 */}
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover opacity-100"
            >
                <source src="/background.mp4" type="video/mp4" />
                {/* Fallback por si el navegador es muy antiguo */}
                Your browser does not support the video tag.
            </video>

            {/* Capa de Legibilidad (Overlay): Lighter for visibility */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"
                aria-hidden="true"
            />

            {/* Efecto Crystalline: Un grano muy sutil para dar textura */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

// Memo evita que el video se recargue cada vez que el usuario hace un Zap
export default memo(BackgroundVideo);
