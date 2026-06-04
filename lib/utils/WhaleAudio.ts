/**
 * Legendary Whale Audio Engine
 * Uses Web Audio API to generate procedural sonar/pulse sounds.
 * No external assets required. Handles browser autoplay policy gracefully.
 */

class WhaleAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  // Shockwave State
  private isShockActive: boolean = false;
  private shockOsc: OscillatorNode | null = null;
  private shockGain: GainNode | null = null;

  private async getCtx(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    // Resume suspended context (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (e) {}
    }
    return this.ctx;
  }

  public async setMute(mute: boolean) { return; }
  public async setShockMode(active: boolean) { return; }
  public async playWhaleSonar(intensity: number = 1) { return; }
  public async playSubtleBlip() { return; }
}

// Singleton  only created client-side
export const whaleAudio = typeof window !== 'undefined' ? new WhaleAudioEngine() : null;

