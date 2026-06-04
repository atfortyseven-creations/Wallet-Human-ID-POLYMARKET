import { useEffect, useState } from 'react';
import { Howl } from 'howler';

// Requires: npm install howler
export function useGodView() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Institutional Sound Effects
    const playOrderSound = () => {
        try {
            const sound = new Howl({
                src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // High tech confirmation
                volume: 0.15
            });
            sound.play();
        } catch(e) {}
    }

    const playAlertSound = () => {
        try {
           const sound = new Howl({
               src: ['https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'], // Danger sweep
               volume: 0.2
           });
           sound.play();
        } catch(e) {}
    }

    // God View Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Cmd+K or Ctrl+K for God View (Fullscreen Dashboard mode)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch((err) => {
                        console.error(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (document.fullscreenElement) playAlertSound();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return { isFullscreen, playOrderSound, playAlertSound };
}
