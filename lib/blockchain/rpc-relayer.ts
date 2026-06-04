// lib/blockchain/rpc-relayer.ts
/**
 * RpcRelayerManager  Multi-Chain RPC Load Balancer
 *
 * Distribuye requests entre todos los endpoints GetBlock del registry
 * usando Round-Robin con cooldown automático en caso de 429/500.
 *
 * Clusters soportados:
 *   ETH_RPC (6 endpoints), ETH_WSS (4), ETH_MEV
 *   SOL_RPC (4 endpoints), SOL_WSS (2)
 *   BASE_RPC (2 endpoints), BASE_WSS (2)
 *   POL_RPC (4 endpoints), POL_WSS (2)
 *   BSC_RPC (4 endpoints), BSC_WSS (2)
 *   ARB_RPC (2 endpoints), ARB_WSS (2)
 *   OP_RPC, WORLD_RPC, BTC_RPC, AVAX_RPC, HYPEREVM_RPC, BERA_RPC
 *
 * ANTI-BAN: Los backups solo entran en juego cuando el primario falla.
 * El cooldown es de 5 min para 429/500 antes de reintentar.
 */

export type NetworkTag =
  | 'ETH'
  | 'SOL'
  | 'BASE'
  | 'POL'
  | 'BSC'
  | 'ARB'
  | 'OP'
  | 'WORLD'
  | 'BTC'
  | 'AVAX'
  | 'HYPEREVM'
  | 'BERA';

export type ProtocolType = 'RPC' | 'WSS' | 'MEV';

interface Endpoint {
  url: string;
  failures: number;
  lastFailedAt: number | null;
  backoffFactor: number; //  INHUMAN OPTIMIZATION: Exponential Backoff Multiplier 
}

// Fallbacks públicos por red, usados si el cluster GetBlock está vacío
const PUBLIC_FALLBACKS: Partial<Record<string, string[]>> = {
  ETH_RPC: [
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
    'https://ethereum-rpc.publicnode.com',
    'https://eth-mainnet.public.blastapi.io'
  ],
  ETH_WSS: [
    'wss://ethereum-rpc.publicnode.com',
    'wss://eth.llamarpc.com'
  ],
  SOL_RPC: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.public.blastapi.io'
  ],
  SOL_WSS: [
    'wss://api.mainnet-beta.solana.com'
  ],
  BASE_RPC: [
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://base.llamarpc.com'
  ],
  BASE_WSS: [
    'wss://base-rpc.publicnode.com'
  ],
  POL_RPC: [
    'https://polygon-rpc.com',
    'https://polygon.llamarpc.com',
    'https://polygon-bor-rpc.publicnode.com'
  ],
  POL_WSS: [
    'wss://polygon-bor-rpc.publicnode.com'
  ],
  BSC_RPC: [
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc.publicnode.com'
  ],
  BSC_WSS: [
    'wss://bsc-rpc.publicnode.com'
  ],
  ARB_RPC: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.llamarpc.com'
  ],
  ARB_WSS: [
    'wss://arbitrum-one-rpc.publicnode.com'
  ],
  OP_RPC:       ['https://mainnet.optimism.io'],
  WORLD_RPC:    ['https://worldchain-mainnet.g.alchemy.com/public'],
  BTC_RPC:      ['https://mempool.space/api'],
  AVAX_RPC:     ['https://api.avax.network/ext/bc/C/rpc'],
  HYPEREVM_RPC: ['https://rpc.hyperliquid.xyz/evm'],
  BERA_RPC:     ['https://rpc.berachain.com'],
};

export class RpcRelayerManager {
  private static endpoints: Record<string, Endpoint[]> = {};
  private static indices: Record<string, number> = {};

  /** Base Cooldown de 5 min antes de reintentar. Se multiplica por backoffFactor */
  private static readonly BASE_COOLDOWN_MS = 5 * 60 * 1000;
  private static readonly MAX_BACKOFF = 16; // Max 16 × 5min = ~80 min

  static {
    this.initialize();
  }

  private static initialize() {
    //  ETH 
    // Primarios (cuentas 1-3): RPC_1, RPC_2, RPC_3, RPC_4  Backup (cuentas 12-14). RR natural.
    this.loadCluster('ETH_RPC', [
      process.env.GB_ETH_RPC_1,
      process.env.GB_ETH_RPC_2,
      process.env.GB_ETH_RPC_3,    // cuenta 3  2x HTTP
      process.env.GB_ETH_RPC_4,    // cuenta 3  slot adicional
      process.env.RPC_CLUSTER_ETH_RPC,  // legacy comma-separated
      //  backups (cuentas 1214)  solo entran si primarios en cooldown
      process.env.GB_ETH_RPC_B1,
      process.env.GB_ETH_RPC_B2,
      process.env.GB_ETH_RPC_B3,
      process.env.GB_ETH_RPC_B4,
    ]);
    this.loadCluster('ETH_WSS', [
      process.env.GB_ETH_WSS_1,
      process.env.GB_ETH_WSS_2,
      process.env.RPC_CLUSTER_ETH_WSS,  // legacy comma-separated
      //  backups 
      process.env.GB_ETH_WSS_B1,
      process.env.GB_ETH_WSS_B2,
    ]);
    this.loadCluster('ETH_MEV', [process.env.GB_ETH_MEV_RPC]);

    //  SOLANA 
    // Primarios (cuentas 4-5)  Backup (cuentas 15-16). RR natural.
    this.loadCluster('SOL_RPC', [
      process.env.GB_SOL_RPC_1,
      process.env.GB_SOL_RPC_EXTRA,
      process.env.GB_SOL_RPC_2,
      process.env.GB_SOL_RPC_3,
      process.env.RPC_CLUSTER_SOL_RPC,  // legacy comma-separated
      //  backups (cuentas 1516) 
      process.env.GB_SOL_RPC_B1,
      process.env.GB_SOL_RPC_B2,
      process.env.GB_SOL_RPC_B3,
    ]);
    this.loadCluster('SOL_WSS', [
      process.env.GB_SOL_WSS_1,
      //  backup 
      process.env.GB_SOL_WSS_B1,
    ]);

    //  BASE 
    // Primario (cuenta 11)  Backup (cuenta 22). RR natural.
    this.loadCluster('BASE_RPC', [
      process.env.GB_BASE_RPC_1,
      //  backup (cuenta 22) 
      process.env.GB_BASE_RPC_B1,
    ]);
    this.loadCluster('BASE_WSS', [
      process.env.GB_BASE_WSS_1,
      //  backup 
      process.env.GB_BASE_WSS_B1,
    ]);

    //  POLYGON 
    // Primarios (cuentas 6-7)  Backup (cuentas 17-18). RR natural.
    this.loadCluster('POL_RPC', [
      process.env.GB_POL_RPC_1,
      process.env.GB_POL_RPC_EXTRA,
      process.env.GB_POL_RPC_2,
      process.env.GB_POL_RPC_3,
      process.env.RPC_CLUSTER_POLYGON_RPC,
      //  backups (cuentas 1718) 
      process.env.GB_POL_RPC_B1,
      process.env.GB_POL_RPC_B2,
      process.env.GB_POL_RPC_B3,
    ]);
    this.loadCluster('POL_WSS', [
      process.env.GB_POL_WSS_1,
      process.env.RPC_CLUSTER_POLYGON_WSS,
      //  backup 
      process.env.GB_POL_WSS_B1,
    ]);

    //  BSC 
    // Primarios (cuentas 8-9)  Backup (cuentas 19-20). RR natural.
    this.loadCluster('BSC_RPC', [
      process.env.GB_BSC_RPC_1,
      process.env.GB_BSC_RPC_2,
      process.env.GB_BSC_RPC_3,
      process.env.RPC_CLUSTER_BSC_RPC,
      //  backups (cuentas 1920) 
      process.env.GB_BSC_RPC_B1,
      process.env.GB_BSC_RPC_B2,
      process.env.GB_BSC_RPC_B3,
    ]);
    this.loadCluster('BSC_WSS', [
      process.env.GB_BSC_WSS_1,
      process.env.GB_BSC_WSS_2,
      process.env.RPC_CLUSTER_BSC_WSS,
      //  backup 
      process.env.GB_BSC_WSS_B1,
    ]);

    //  ARBITRUM 
    // Primario (cuenta 10)  Backup (cuenta 21). RR natural.
    this.loadCluster('ARB_RPC', [
      process.env.GB_ARB_RPC_1,
      process.env.RPC_CLUSTER_ARB_RPC,  // legacy comma-separated (2 URLs)
      //  backup (cuenta 21) 
      process.env.GB_ARB_RPC_B1,
    ]);
    this.loadCluster('ARB_WSS', [
      process.env.GB_ARB_WSS_1,
      //  backup 
      process.env.GB_ARB_WSS_B1,
    ]);

    //  OPTIMISM 
    this.loadCluster('OP_RPC', [process.env.GB_OP_RPC_1]);

    //  WORLDCHAIN 
    this.loadCluster('WORLD_RPC', [process.env.GB_WORLD_RPC_1]);

    //  BITCOIN 
    this.loadCluster('BTC_RPC', [process.env.GB_BTC_RPC_1]);

    //  AVALANCHE 
    this.loadCluster('AVAX_RPC', [process.env.GB_AVAX_RPC_1]);

    //  META-CHAINS 2025 
    this.loadCluster('HYPEREVM_RPC', [process.env.GB_HYPEREVM_RPC_1]);
    this.loadCluster('BERA_RPC',     [process.env.GB_BERA_RPC_1]);

    //  Startup log 
    const totalActive = Object.values(this.endpoints).reduce(
      (acc, cluster) => acc + cluster.length, 0
    );
    console.log(`[RpcRelayer]  Initialized  ${totalActive} total endpoint slots loaded.`);
  }

  /**
   * Carga un cluster desde un array de strings o variables env.
   * Soporta valores con comas (legacy RPC_CLUSTER_*="url1,url2").
   * Filtra duplicados y placeholders vacíos.
   */
  private static loadCluster(key: string, sources: (string | undefined)[]) {
    const urls = new Set<string>();

    for (const source of sources) {
      if (!source) continue;
      // Soporta comas (legacy formato RPC_CLUSTER_*)
      source.split(',').forEach(u => {
        const clean = u.trim().replace(/^["']|["']$/g, '');
        if (clean.length > 10) urls.add(clean);
      });
    }

    this.endpoints[key] = Array.from(urls).map(url => ({
      url,
      failures: 0,
      lastFailedAt: null,
      backoffFactor: 1,
    }));
    this.indices[key] = 0;

    if (this.endpoints[key].length > 0) {
      console.log(`[RpcRelayer]  ${key}: ${this.endpoints[key].length} endpoint(s)`);
    }
  }

  /**
   * Obtiene el siguiente URL disponible (Round-Robin).
   * Salta endpoints en cooldown por 429/500.
   * Si todos están caídos, devuelve el fallback público.
   */
  static getRpcUrl(network: NetworkTag, protocol: ProtocolType = 'RPC'): string {
    const key = `${network}_${protocol}`;
    const cluster = this.endpoints[key];
    const fallbacks = PUBLIC_FALLBACKS[key] ?? [];

    if (!cluster || cluster.length === 0) {
      if (fallbacks.length > 0) {
        // Round-robin through fallbacks if cluster is empty
        const fIdx = (this.indices[key] || 0) % fallbacks.length;
        this.indices[key] = (fIdx + 1) % fallbacks.length;
        return fallbacks[fIdx];
      }
      return '';
    }

    const now = Date.now();
    const startIndex = this.indices[key];

    for (let i = 0; i < cluster.length; i++) {
      const idx = (startIndex + i) % cluster.length;
      const ep = cluster[idx];

      const currentCooldown = this.BASE_COOLDOWN_MS * ep.backoffFactor;

      if (ep.lastFailedAt && now - ep.lastFailedAt < currentCooldown) {
        continue; // Aún en cooldown exponencial
      }

      if (ep.lastFailedAt) {
        // Cooldown expirado  recuperar endpoint (mantener backoff para castigar reincidencia lenta)
        ep.lastFailedAt = null;
      }

      // Avanzar índice Round-Robin para la próxima llamada
      this.indices[key] = (idx + 1) % cluster.length;
      return ep.url;
    }

    // Todos en cooldown  intentar con el primero de todos modos o saltar a fallbacks
    if (fallbacks.length > 0) {
      const fIdx = (this.indices[key] || 0) % fallbacks.length;
      this.indices[key] = (fIdx + 1) % fallbacks.length;
      return fallbacks[fIdx];
    }

    console.error(`[RpcRelayer] ️ ALL nodes cooling down for ${key}  forcing primary.`);
    return cluster[0].url;
  }

  static reportFailure(network: NetworkTag, protocol: ProtocolType, url: string): void {
    const key = `${network}_${protocol}`;
    const cluster = this.endpoints[key];
    if (!cluster) return;

    const ep = cluster.find(e => e.url === url);
    if (ep) {
      ep.failures += 1;
      ep.lastFailedAt = Date.now();
      ep.backoffFactor = Math.min(ep.backoffFactor * 2, this.MAX_BACKOFF); // Inhuman Optimization
      console.warn(`[RpcRelayer]  EXPONENTIAL COOLDOWN  ${url.slice(0, 50)} | Fails: ${ep.failures} | Backoff: ${ep.backoffFactor}x`);
    }
  }

  /**
   * Estado completo de todos los clusters para el dashboard de monitorización.
   */
  static getClusterStatus(): Record<string, { total: number; healthy: number; endpoints: { url: string; failures: number; inCooldown: boolean }[] }> {
    const now = Date.now();
    const result: ReturnType<typeof this.getClusterStatus> = {};

    for (const [key, cluster] of Object.entries(this.endpoints)) {
      const endpoints = cluster.map(ep => ({
        url: ep.url.replace(/\/([a-f0-9]{20,})/, '/****'),
        failures: ep.failures,
        inCooldown: ep.lastFailedAt !== null && now - ep.lastFailedAt < (this.BASE_COOLDOWN_MS * ep.backoffFactor),
      }));
      result[key] = {
        total: cluster.length,
        healthy: endpoints.filter(e => !e.inCooldown).length,
        endpoints,
      };
    }

    return result;
  }
}
