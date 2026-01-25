'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from '../styles/GlobalBackground.module.css';

const GlobalBackground = () => {
    const pathname = usePathname();

    // Rutas donde se mostrará el globo
    // Adding /wallet and /news (and /noticias as alt)
    const rutasConGlobo = ['/wallet', '/news', '/noticias'];

    // Check if current path starts with any of the allowed routes to handle sub-paths if necessary, 
    console.log("[GlobalBackground] Current path:", pathname);
    // DEBUG: FORCE SHOW
    const mostrarGlobo = true; // pathname ? rutasConGlobo.some(ruta => pathname.includes(ruta)) : false;
    console.log("[GlobalBackground] Show Globe (FORCED):", mostrarGlobo);

    if (!mostrarGlobo) {
        return null;
    }

    return (
        <div className={styles.backgroundContainer}>
            {/* DEBUG OVERLAY */}
            <div style={{ position: 'absolute', top: 100, left: 20, color: 'red', zIndex: 9999, background: 'white' }}>
                DEBUG MODE: Path: {pathname} | Show: {mostrarGlobo.toString()}
            </div>
            <video
                autoPlay
                loop
                muted
                playsInline
                src="/globe-background.mp4"
                className={styles.globeVideo}
            />
        </div>
    );
};

export default GlobalBackground;
