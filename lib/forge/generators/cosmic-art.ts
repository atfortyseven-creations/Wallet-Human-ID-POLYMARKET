import { CosmicSeed, ArtMetadata } from '../types';

export class CosmicArtGenerator {
  /**
   * Procedurally generates visual metadata based on the Whale Event's deterministic hash.
   * This drives the WebGL shaders in the frontend without relying on external image APIs.
   */
  static generate(seed: CosmicSeed): ArtMetadata {
    // Use segments of the SHA-256 hash to determine parameters
    const colorHex = '#' + seed.seedHash.substring(0, 6);
    const speedSegment = parseInt(seed.seedHash.substring(6, 8), 16);
    const entropySegment = parseInt(seed.seedHash.substring(8, 12), 16);
    const complexitySegment = parseInt(seed.seedHash.substring(12, 14), 16);

    const speed = 0.1 + (speedSegment / 255) * 2.0;       // Range: 0.1 to 2.1
    const entropy = (entropySegment / 65535) * 100;         // Range: 0.0 to 100.0
    const complexity = 1 + Math.floor((complexitySegment / 255) * 8); // Range: 1 to 9

    const prompt = `A ${seed.tier.toLowerCase()} cosmic entity born on ${seed.chain}, vibrating at frequency ${speed.toFixed(2)} with entropy ${entropy.toFixed(1)}%.`;

    return {
      prompt,
      colorSeed: colorHex,
      shaderParams: {
        complexity,
        speed,
        entropy
      }
    };
  }
}
