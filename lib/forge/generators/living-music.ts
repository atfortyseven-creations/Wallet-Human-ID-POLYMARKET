import { CosmicSeed, MusicMetadata } from '../types';

export class LivingMusicGenerator {
  static generate(seed: CosmicSeed): MusicMetadata {
    // Determine BPM based on the USD amount (e.g. 1M = 60 BPM, 100M = 160 BPM)
    // Capped between 40 and 200 BPM
    const rawBpm = Math.floor(40 + (seed.amountUSD / 1_000_000) * 0.5);
    const bpm = Math.min(Math.max(rawBpm, 40), 200);

    // Key derived logically
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = parseInt(seed.seedHash.substring(10, 11), 16) % 12;
    const key = keys[keyIndex];

    // Scale depends on Chain Ecosystem
    let scale = 'minor';
    if (seed.chain.toLowerCase() === 'ethereum') scale = 'lydian';
    if (seed.chain.toLowerCase() === 'solana') scale = 'mixolydian';
    if (seed.chain.toLowerCase() === 'bitcoin') scale = 'phrygian dominant';

    // Waveform depends on Tier
    let waveform: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine';
    if (seed.tier === 'KRAKEN') waveform = 'triangle';
    if (seed.tier === 'LEVIATHAN') waveform = 'square';
    if (seed.tier === 'MEGALODON') waveform = 'sawtooth';

    return {
      bpm,
      scale: `${key} ${scale}`,
      waveform,
      key
    };
  }
}
