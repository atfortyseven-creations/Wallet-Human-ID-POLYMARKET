export type EntityTier = 'NARWHAL' | 'KRAKEN' | 'LEVIATHAN' | 'MEGALODON';

export type GeneratorType = 'COSMIC_ART' | 'LIVING_MUSIC' | 'AUTO_CONTRACT' | 'WORLD_SIM' | 'BIOTECH_DNA' | 'HIVE_AGENT' | 'RECURSIVE_SUBFORGE';

export type EntityStatus = 'DORMANT' | 'ACTIVE' | 'HIBERNATING' | 'EXTINCT' | 'MERGED';

export interface CosmicSeed {
  seedHash: string; // Deterministic SHA-256 of the origin whale event
  eventId: string;  // Original Whale Event ID
  amountUSD: number;
  chain: string;
  tier: EntityTier;
  timestamp: number;
}

export interface ArtMetadata {
  prompt: string;
  colorSeed: string; // e.g. #050505
  shaderParams: {
    complexity: number;
    speed: number;
    entropy: number;
  };
}

export interface MusicMetadata {
  bpm: number;
  scale: string; // e.g., 'C minor pentatonic'
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  key: string;
}

export interface BiotechMetadata {
  dnaSequence: string; // e.g., 'ATCG...'
  traits: string[];
}

export interface WorldSimMetadata {
  populationSeed: number;
  resources: number;
  entropy: number;
  gridSize: number;
}

export interface AgentMetadata {
  observerMode: boolean;
  targetChains: string[];
  maxSlippageThreshold: number;
}

export interface CosmicEntityBase {
  id: string;
  seedHash: string;
  whaleEventId?: string;
  tier: EntityTier;
  amountUSD: number;
  chain: string;
  generatorType: GeneratorType;
  status: EntityStatus;
  
  artMetadata?: ArtMetadata;
  musicMetadata?: MusicMetadata;
  biotechMetadata?: BiotechMetadata;
  worldSimMetadata?: WorldSimMetadata;
  agentMetadata?: AgentMetadata;
  
  contractAddress?: string;
  hiveEnergyAtBirth: number;
  evolutionCount: number;
  parentEntityId?: string;
  beneficiaryAddr?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface HiveState {
  totalEnergyUSD: number;
  activeEntities: number;
  status: 'AWAKENING' | 'THRIVING' | 'HIBERNATING';
  lastPulseAt: Date;
}
