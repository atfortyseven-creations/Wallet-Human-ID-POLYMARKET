"use client";

class AudioManager {
  private successSound: HTMLAudioElement | null = null;
  private errorSound: HTMLAudioElement | null = null;
  private clickSound: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.successSound = new Audio("/sounds/success.mp3"); // Ensure these files exist or use base64
      this.errorSound = new Audio("/sounds/error.mp3");
      this.clickSound = new Audio("/sounds/click.mp3");
      
      // Preload
      this.successSound.volume = 0.5;
      this.errorSound.volume = 0.5;
      this.clickSound.volume = 0.2;
    }
  }

  playSuccess() {
    this.safePlay(this.successSound);
  }

  playError() {
    this.safePlay(this.errorSound);
  }

  playClick() {
    this.safePlay(this.clickSound);
  }

  private safePlay(audio: HTMLAudioElement | null) {
      if (typeof window !== "undefined" && audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {
              // Ignore auto-play errors
          });
      }
  }
}

// Singleton
export const audio = new AudioManager();

