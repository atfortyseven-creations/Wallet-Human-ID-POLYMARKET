"use client";

import { useCallback } from 'react';

type SoundType = 'whale-alert' | 'activity' | 'achievement' | 'level-up' | 'notification';

export function useSound() {
  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    if (typeof Audio === 'undefined') return;

    try {
      const sounds: Record<SoundType, string> = {
        'whale-alert': '/sounds/whale-alert.mp3',
        'activity': '/sounds/activity.mp3',
        'achievement': '/sounds/achievement.mp3',
        'level-up': '/sounds/level-up.mp3',
        'notification': '/sounds/notification.mp3',
      };

      const audio = new Audio(sounds[type]);
      audio.volume = volume;
      audio.play().catch(() => {
        console.warn(`Failed to play sound: ${type}`);
      });
    } catch (error) {
      console.error('Sound playback error:', error);
    }
  }, []);

  return { playSound };
}
