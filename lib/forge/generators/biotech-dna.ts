import { CosmicSeed, BiotechMetadata } from '../types';

export class BiotechDnaGenerator {
  static generate(seed: CosmicSeed): BiotechMetadata {
    // Generate a valid deterministic DNA sequence (A, T, C, G)
    const bases = ['A', 'T', 'C', 'G'];
    let sequence = '';
    
    // Use the hash characters to pick bases (64 hex characters -> 64 bases minimum)
    for (let i = 0; i < seed.seedHash.length; i++) {
        const val = parseInt(seed.seedHash.charAt(i), 16);
        sequence += bases[val % 4];
    }
    
    // Extend sequence slightly based on USD magnitude
    const multiplier = Math.max(1, Math.floor(Math.log10(seed.amountUSD)));
    for (let i = 0; i < multiplier * 10; i++) {
        const val = parseInt(seed.seedHash.charAt(i % 64), 16) + i;
        sequence += bases[val % 4];
    }

    const traits = [
      `Resilience: ${seed.tier}`,
      `Origin Ecosystem: ${seed.chain}`,
      `Mutations: ${multiplier}`,
      `Synthesized: ${new Date(seed.timestamp).toISOString()}`
    ];

    return {
      dnaSequence: sequence,
      traits
    };
  }
}
