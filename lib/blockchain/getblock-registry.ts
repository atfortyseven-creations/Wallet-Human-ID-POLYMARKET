/**
 * =============================================================================
 *   GETBLOCK REGISTRY — SISTEMA UNIFICADO
 * =============================================================================
 *
 *  BLOQUE A — CUENTAS EXISTENTES (22 cuentas | formato original)
 *  Variables: GB_ETH_RPC_1, GB_ETH_WSS_1, etc.
 *  Estado: YA CONFIGURADAS EN RAILWAY — NO TOCAR
 *
 *  BLOQUE B — 40 CUENTAS NUEVAS (formato token único)
 *  Variables: GB_TOKEN_01 ... GB_TOKEN_40
 *  Cada token → https://go.getblock.io/{TOKEN} + wss://go.getblock.io/{TOKEN}
 *
 *  DISTRIBUCION DE LAS 40 NUEVAS CUENTAS:
 *    BASE    → GB_TOKEN_01-15  (15 cuentas | 8,250,000 CU/dia) ← CADENA CRÍTICA
 *    ETH     → GB_TOKEN_16-30  (15 cuentas | 8,250,000 CU/dia) ← MÁS CARA EN CU
 *    POLYGON → GB_TOKEN_31-34  ( 4 cuentas | 2,200,000 CU/dia)
 *    ARB     → GB_TOKEN_35-37  ( 3 cuentas | 1,650,000 CU/dia)
 *    BSC     → GB_TOKEN_38-39  ( 2 cuentas | 1,100,000 CU/dia)
 *    OP      → GB_TOKEN_40     ( 1 cuenta  |   550,000 CU/dia)
 *
 *  TOTAL NUEVO: 40 × 550,000 = 22,000,000 CU/dia adicionales
 *  TOTAL SISTEMA: 22 (existentes) + 40 (nuevas) = 62 cuentas
 *  TOTAL CU:      12,100,000 + 22,000,000 = 34,100,000 CU/dia
 *
 * =============================================================================
 */

export type GbChain = 'eth' | 'sol' | 'polygon' | 'bsc' | 'arb' | 'base' | 'op' | 'world' | 'avax' | 'hyperevm' | 'bera' | 'spare';
export type GbProtocol = 'rpc' | 'wss';

export interface GbEndpoint {
  slot:      number;
  account:   number;
  chain:     GbChain;
  protocol:  GbProtocol;
  isActive:  boolean;
  envKey:    string;
  url:       string;
}

// =============================================================================
//  CONSTRUCTOR FORMATO ORIGINAL (GB_ETH_RPC_1...)
// =============================================================================

function ep(
  slot: number,
  account: number,
  chain: GbChain,
  protocol: GbProtocol,
  envKey: string,
): GbEndpoint {
  const raw      = (process.env[envKey] ?? '').trim().replace(/^["']|["']$/g, '');
  const isActive = raw.length > 10 && (raw.startsWith('https://') || raw.startsWith('wss://'));
  return { slot, account, chain, protocol, isActive, envKey, url: raw };
}

// =============================================================================
//  CONSTRUCTOR FORMATO NUEVO (GB_TOKEN_NN → genera HTTPS + WSS)
// =============================================================================

function epToken(
  slotBase: number,
  account:  number,
  chain:    GbChain,
  envKey:   string,
): GbEndpoint[] {
  const raw   = (process.env[envKey] ?? '').trim().replace(/^["']|["']$/g, '');
  const token = raw
    .replace(/^https?:\/\/go\.getblock\.io\//i, '')
    .replace(/^wss?:\/\/go\.getblock\.io\//i, '');
  const isActive = token.length > 10 && !token.includes(' ') && !token.startsWith('PEGA_');

  return [
    {
      slot:     slotBase,
      account,
      chain,
      protocol: 'rpc',
      isActive,
      envKey,
      url: isActive ? `https://go.getblock.io/${token}` : '',
    },
    {
      slot:     slotBase + 1,
      account,
      chain,
      protocol: 'wss',
      isActive,
      envKey,
      url: isActive ? `wss://go.getblock.io/${token}` : '',
    },
  ];
}

// =============================================================================
//  BLOQUE A — 22 CUENTAS EXISTENTES (NO MODIFICAR)
// =============================================================================

export const GB_REGISTRY_EXISTING: GbEndpoint[] = [
  ep( 1,  1, 'eth',      'rpc', 'GB_ETH_RPC_1'),
  ep( 2,  1, 'eth',      'wss', 'GB_ETH_WSS_1'),
  ep( 3,  2, 'eth',      'rpc', 'GB_ETH_RPC_2'),
  ep( 4,  2, 'eth',      'wss', 'GB_ETH_WSS_2'),
  ep( 5,  3, 'eth',      'rpc', 'GB_ETH_RPC_3'),
  ep( 6,  3, 'eth',      'rpc', 'GB_ETH_RPC_4'),
  ep( 7,  4, 'sol',      'rpc', 'GB_SOL_RPC_1'),
  ep( 8,  4, 'sol',      'rpc', 'GB_SOL_RPC_EXTRA'),
  ep( 9,  4, 'sol',      'wss', 'GB_SOL_WSS_1'),
  ep(10,  5, 'sol',      'rpc', 'GB_SOL_RPC_2'),
  ep(11,  5, 'sol',      'rpc', 'GB_SOL_RPC_3'),
  ep(12,  6, 'polygon',  'rpc', 'GB_POL_RPC_1'),
  ep(13,  6, 'polygon',  'rpc', 'GB_POL_RPC_EXTRA'),
  ep(14,  6, 'polygon',  'wss', 'GB_POL_WSS_1'),
  ep(15,  7, 'polygon',  'rpc', 'GB_POL_RPC_2'),
  ep(16,  7, 'polygon',  'rpc', 'GB_POL_RPC_3'),
  ep(17,  8, 'bsc',      'rpc', 'GB_BSC_RPC_1'),
  ep(18,  8, 'bsc',      'wss', 'GB_BSC_WSS_1'),
  ep(19,  9, 'bsc',      'rpc', 'GB_BSC_RPC_2'),
  ep(20,  9, 'bsc',      'rpc', 'GB_BSC_RPC_3'),
  ep(21, 10, 'arb',      'rpc', 'GB_ARB_RPC_1'),
  ep(22, 10, 'arb',      'wss', 'GB_ARB_WSS_1'),
  ep(23, 11, 'base',     'rpc', 'GB_BASE_RPC_1'),
  ep(24, 11, 'base',     'wss', 'GB_BASE_WSS_1'),
  ep(25, 101,'op',       'rpc', 'GB_OP_RPC_1'),
  ep(26, 102,'avax',     'rpc', 'GB_AVAX_RPC_1'),
  ep(27, 103,'world',    'rpc', 'GB_WORLD_RPC_1'),
  ep(28, 104,'hyperevm', 'rpc', 'GB_HYPEREVM_RPC_1'),
  ep(29, 105,'bera',     'rpc', 'GB_BERA_RPC_1'),
  ep(30, 12, 'eth',      'rpc', 'GB_ETH_RPC_B1'),
  ep(31, 12, 'eth',      'wss', 'GB_ETH_WSS_B1'),
  ep(32, 13, 'eth',      'rpc', 'GB_ETH_RPC_B2'),
  ep(33, 13, 'eth',      'wss', 'GB_ETH_WSS_B2'),
  ep(34, 14, 'eth',      'rpc', 'GB_ETH_RPC_B3'),
  ep(35, 14, 'eth',      'rpc', 'GB_ETH_RPC_B4'),
  ep(36, 15, 'sol',      'rpc', 'GB_SOL_RPC_B1'),
  ep(37, 15, 'sol',      'wss', 'GB_SOL_WSS_B1'),
  ep(38, 16, 'sol',      'rpc', 'GB_SOL_RPC_B2'),
  ep(39, 16, 'sol',      'rpc', 'GB_SOL_RPC_B3'),
  ep(40, 17, 'polygon',  'rpc', 'GB_POL_RPC_B1'),
  ep(41, 17, 'polygon',  'wss', 'GB_POL_WSS_B1'),
  ep(42, 18, 'polygon',  'rpc', 'GB_POL_RPC_B2'),
  ep(43, 18, 'polygon',  'rpc', 'GB_POL_RPC_B3'),
  ep(44, 19, 'bsc',      'rpc', 'GB_BSC_RPC_B1'),
  ep(45, 19, 'bsc',      'wss', 'GB_BSC_WSS_B1'),
  ep(46, 20, 'bsc',      'rpc', 'GB_BSC_RPC_B2'),
  ep(47, 20, 'bsc',      'rpc', 'GB_BSC_RPC_B3'),
  ep(48, 21, 'arb',      'rpc', 'GB_ARB_RPC_B1'),
  ep(49, 21, 'arb',      'wss', 'GB_ARB_WSS_B1'),
  ep(50, 22, 'base',     'rpc', 'GB_BASE_RPC_B1'),
  ep(51, 22, 'base',     'wss', 'GB_BASE_WSS_B1'),
];

// =============================================================================
//  BLOQUE B — 40 CUENTAS NUEVAS (slots 200-279)
//  Distribucion optimizada para el sistema real
// =============================================================================

export const GB_REGISTRY_NEW: GbEndpoint[] = [

  ep(200 + 0, 300 + 0, 'base', 'rpc', 'GB_ACCOUNT_01_RPC'),
  ep(200 + 1, 300 + 0, 'base', 'wss', 'GB_ACCOUNT_01_WSS'),
  ep(200 + 2, 300 + 1, 'base', 'rpc', 'GB_ACCOUNT_02_RPC'),
  ep(200 + 3, 300 + 1, 'base', 'wss', 'GB_ACCOUNT_02_WSS'),
  ep(200 + 4, 300 + 2, 'base', 'rpc', 'GB_ACCOUNT_03_RPC'),
  ep(200 + 5, 300 + 2, 'base', 'wss', 'GB_ACCOUNT_03_WSS'),
  ep(200 + 6, 300 + 3, 'base', 'rpc', 'GB_ACCOUNT_04_RPC'),
  ep(200 + 7, 300 + 3, 'base', 'wss', 'GB_ACCOUNT_04_WSS'),
  ep(200 + 8, 300 + 4, 'base', 'rpc', 'GB_ACCOUNT_05_RPC'),
  ep(200 + 9, 300 + 4, 'base', 'wss', 'GB_ACCOUNT_05_WSS'),
  ep(200 + 10, 300 + 5, 'base', 'rpc', 'GB_ACCOUNT_06_RPC'),
  ep(200 + 11, 300 + 5, 'base', 'wss', 'GB_ACCOUNT_06_WSS'),
  ep(200 + 12, 300 + 6, 'base', 'rpc', 'GB_ACCOUNT_07_RPC'),
  ep(200 + 13, 300 + 6, 'base', 'wss', 'GB_ACCOUNT_07_WSS'),
  ep(200 + 14, 300 + 7, 'base', 'rpc', 'GB_ACCOUNT_08_RPC'),
  ep(200 + 15, 300 + 7, 'base', 'wss', 'GB_ACCOUNT_08_WSS'),
  ep(200 + 16, 300 + 8, 'base', 'rpc', 'GB_ACCOUNT_09_RPC'),
  ep(200 + 17, 300 + 8, 'base', 'wss', 'GB_ACCOUNT_09_WSS'),
  ep(200 + 18, 300 + 9, 'base', 'rpc', 'GB_ACCOUNT_10_RPC'),
  ep(200 + 19, 300 + 9, 'base', 'wss', 'GB_ACCOUNT_10_WSS'),
  ep(200 + 20, 300 + 10, 'base', 'rpc', 'GB_ACCOUNT_11_RPC'),
  ep(200 + 21, 300 + 10, 'base', 'wss', 'GB_ACCOUNT_11_WSS'),
  ep(200 + 22, 300 + 11, 'base', 'rpc', 'GB_ACCOUNT_12_RPC'),
  ep(200 + 23, 300 + 11, 'base', 'wss', 'GB_ACCOUNT_12_WSS'),
  ep(200 + 24, 300 + 12, 'base', 'rpc', 'GB_ACCOUNT_13_RPC'),
  ep(200 + 25, 300 + 12, 'base', 'wss', 'GB_ACCOUNT_13_WSS'),
  ep(200 + 26, 300 + 13, 'base', 'rpc', 'GB_ACCOUNT_14_RPC'),
  ep(200 + 27, 300 + 13, 'base', 'wss', 'GB_ACCOUNT_14_WSS'),
  ep(200 + 28, 300 + 14, 'base', 'rpc', 'GB_ACCOUNT_15_RPC'),
  ep(200 + 29, 300 + 14, 'base', 'wss', 'GB_ACCOUNT_15_WSS'),
  ep(200 + 30, 300 + 15, 'eth', 'rpc', 'GB_ACCOUNT_16_RPC'),
  ep(200 + 31, 300 + 15, 'eth', 'wss', 'GB_ACCOUNT_16_WSS'),
  ep(200 + 32, 300 + 16, 'eth', 'rpc', 'GB_ACCOUNT_17_RPC'),
  ep(200 + 33, 300 + 16, 'eth', 'wss', 'GB_ACCOUNT_17_WSS'),
  ep(200 + 34, 300 + 17, 'eth', 'rpc', 'GB_ACCOUNT_18_RPC'),
  ep(200 + 35, 300 + 17, 'eth', 'wss', 'GB_ACCOUNT_18_WSS'),
  ep(200 + 36, 300 + 18, 'eth', 'rpc', 'GB_ACCOUNT_19_RPC'),
  ep(200 + 37, 300 + 18, 'eth', 'wss', 'GB_ACCOUNT_19_WSS'),
  ep(200 + 38, 300 + 19, 'eth', 'rpc', 'GB_ACCOUNT_20_RPC'),
  ep(200 + 39, 300 + 19, 'eth', 'wss', 'GB_ACCOUNT_20_WSS'),
  ep(200 + 40, 300 + 20, 'eth', 'rpc', 'GB_ACCOUNT_21_RPC'),
  ep(200 + 41, 300 + 20, 'eth', 'wss', 'GB_ACCOUNT_21_WSS'),
  ep(200 + 42, 300 + 21, 'eth', 'rpc', 'GB_ACCOUNT_22_RPC'),
  ep(200 + 43, 300 + 21, 'eth', 'wss', 'GB_ACCOUNT_22_WSS'),
  ep(200 + 44, 300 + 22, 'eth', 'rpc', 'GB_ACCOUNT_23_RPC'),
  ep(200 + 45, 300 + 22, 'eth', 'wss', 'GB_ACCOUNT_23_WSS'),
  ep(200 + 46, 300 + 23, 'eth', 'rpc', 'GB_ACCOUNT_24_RPC'),
  ep(200 + 47, 300 + 23, 'eth', 'wss', 'GB_ACCOUNT_24_WSS'),
  ep(200 + 48, 300 + 24, 'eth', 'rpc', 'GB_ACCOUNT_25_RPC'),
  ep(200 + 49, 300 + 24, 'eth', 'wss', 'GB_ACCOUNT_25_WSS'),
  ep(200 + 50, 300 + 25, 'eth', 'rpc', 'GB_ACCOUNT_26_RPC'),
  ep(200 + 51, 300 + 25, 'eth', 'wss', 'GB_ACCOUNT_26_WSS'),
  ep(200 + 52, 300 + 26, 'eth', 'rpc', 'GB_ACCOUNT_27_RPC'),
  ep(200 + 53, 300 + 26, 'eth', 'wss', 'GB_ACCOUNT_27_WSS'),
  ep(200 + 54, 300 + 27, 'eth', 'rpc', 'GB_ACCOUNT_28_RPC'),
  ep(200 + 55, 300 + 27, 'eth', 'wss', 'GB_ACCOUNT_28_WSS'),
  ep(200 + 56, 300 + 28, 'eth', 'rpc', 'GB_ACCOUNT_29_RPC'),
  ep(200 + 57, 300 + 28, 'eth', 'wss', 'GB_ACCOUNT_29_WSS'),
  ep(200 + 58, 300 + 29, 'eth', 'rpc', 'GB_ACCOUNT_30_RPC'),
  ep(200 + 59, 300 + 29, 'eth', 'wss', 'GB_ACCOUNT_30_WSS'),
  ep(200 + 60, 300 + 30, 'polygon', 'rpc', 'GB_ACCOUNT_31_RPC'),
  ep(200 + 61, 300 + 30, 'polygon', 'wss', 'GB_ACCOUNT_31_WSS'),
  ep(200 + 62, 300 + 31, 'polygon', 'rpc', 'GB_ACCOUNT_32_RPC'),
  ep(200 + 63, 300 + 31, 'polygon', 'wss', 'GB_ACCOUNT_32_WSS'),
  ep(200 + 64, 300 + 32, 'polygon', 'rpc', 'GB_ACCOUNT_33_RPC'),
  ep(200 + 65, 300 + 32, 'polygon', 'wss', 'GB_ACCOUNT_33_WSS'),
  ep(200 + 66, 300 + 33, 'polygon', 'rpc', 'GB_ACCOUNT_34_RPC'),
  ep(200 + 67, 300 + 33, 'polygon', 'wss', 'GB_ACCOUNT_34_WSS'),
  ep(200 + 68, 300 + 34, 'arb', 'rpc', 'GB_ACCOUNT_35_RPC'),
  ep(200 + 69, 300 + 34, 'arb', 'wss', 'GB_ACCOUNT_35_WSS'),
  ep(200 + 70, 300 + 35, 'arb', 'rpc', 'GB_ACCOUNT_36_RPC'),
  ep(200 + 71, 300 + 35, 'arb', 'wss', 'GB_ACCOUNT_36_WSS'),
  ep(200 + 72, 300 + 36, 'arb', 'rpc', 'GB_ACCOUNT_37_RPC'),
  ep(200 + 73, 300 + 36, 'arb', 'wss', 'GB_ACCOUNT_37_WSS'),
  ep(200 + 74, 300 + 37, 'bsc', 'rpc', 'GB_ACCOUNT_38_RPC'),
  ep(200 + 75, 300 + 37, 'bsc', 'wss', 'GB_ACCOUNT_38_WSS'),
  ep(200 + 76, 300 + 38, 'bsc', 'rpc', 'GB_ACCOUNT_39_RPC'),
  ep(200 + 77, 300 + 38, 'bsc', 'wss', 'GB_ACCOUNT_39_WSS'),
  ep(200 + 78, 300 + 39, 'op', 'rpc', 'GB_ACCOUNT_40_RPC'),
  ep(200 + 79, 300 + 39, 'op', 'wss', 'GB_ACCOUNT_40_WSS'),
];

// =============================================================================
//  REGISTRY UNIFICADO
// =============================================================================

export const GB_REGISTRY: GbEndpoint[] = [
  ...GB_REGISTRY_EXISTING,
  ...GB_REGISTRY_NEW,
];

// Subsets para monitoreo
export const GB_PRIMARY_SLOTS = GB_REGISTRY_EXISTING.filter(e => e.account <= 11 || (e.account >= 101 && e.account <= 105));
export const GB_BACKUP_SLOTS  = GB_REGISTRY_EXISTING.filter(e => e.account >= 12 && e.account <= 99);

// =============================================================================
//  CU CIRCUIT BREAKER
// =============================================================================

interface CuState {
  exhausted:     boolean;
  exhaustedAt:   number;
  quota402Count: number;
}

const cuState = new Map<string, CuState>();

function msUntilMidnightUtc(): number {
  const now      = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
  ));
  return midnight.getTime() - now.getTime();
}

function getOrCreateCuState(url: string): CuState {
  if (!cuState.has(url)) cuState.set(url, { exhausted: false, exhaustedAt: 0, quota402Count: 0 });
  return cuState.get(url)!;
}

export function markCuExhausted(url: string): void {
  const state = getOrCreateCuState(url);
  state.exhausted     = true;
  state.exhaustedAt   = Date.now();
  state.quota402Count += 1;
  const resetIn = Math.round(msUntilMidnightUtc() / 60000);
  const ep      = GB_REGISTRY.find(e => e.url === url);
  const label   = ep ? `[${ep.envKey} | ${ep.chain.toUpperCase()} | ${ep.protocol.toUpperCase()}]` : url.slice(0, 40);
  console.warn(`[GetBlock CB] CU AGOTADO ${label} | Reset en ~${resetIn} min | Rotando al siguiente.`);
  setTimeout(() => {
    const s = cuState.get(url);
    if (s) { s.exhausted = false; console.info(`[GetBlock CB] CU RESET ${label}`); }
  }, msUntilMidnightUtc());
}

export function isCuAvailable(url: string): boolean {
  if (!url) return false;
  return !getOrCreateCuState(url).exhausted;
}

// =============================================================================
//  GETTERS
// =============================================================================

export function getGbAllRpc(chain: GbChain): string[] {
  return GB_REGISTRY
    .filter(e => e.chain === chain && e.protocol === 'rpc' && e.isActive && isCuAvailable(e.url))
    .map(e => e.url);
}

export function getGbAllWss(chain: GbChain): string[] {
  return GB_REGISTRY
    .filter(e => e.chain === chain && e.protocol === 'wss' && e.isActive && isCuAvailable(e.url))
    .map(e => e.url);
}

export function getGbRpc(chain: GbChain): string { return getGbAllRpc(chain)[0] ?? ''; }
export function getGbWss(chain: GbChain): string { return getGbAllWss(chain)[0] ?? ''; }

// =============================================================================
//  PRESUPUESTO CU
// =============================================================================

export const CU_BUDGET: Record<GbChain, number> = {
  base:     17 * 550_000,  // 2 existentes + 15 nuevas = 17 cuentas → 9,350,000 CU
  eth:      21 * 550_000,  // 6 existentes + 15 nuevas = 21 cuentas → 11,550,000 CU
  polygon:   8 * 550_000,  // 4 existentes +  4 nuevas =  8 cuentas →  4,400,000 CU
  bsc:       6 * 550_000,  // 4 existentes +  2 nuevas =  6 cuentas →  3,300,000 CU
  arb:       5 * 550_000,  // 2 existentes +  3 nuevas =  5 cuentas →  2,750,000 CU
  sol:       4 * 550_000,  // 4 existentes +  0 nuevas =  4 cuentas →  2,200,000 CU
  op:        2 * 550_000,  // 1 existente  +  1 nueva  =  2 cuentas →  1,100,000 CU
  avax:      1 * 550_000,
  world:     1 * 550_000,
  hyperevm:  1 * 550_000,
  bera:      1 * 550_000,
  spare:     0,
};

export function getTotalCuBudget(): number {
  return 62 * 550_000; // 22 existentes + 40 nuevas = 62 cuentas → 34,100,000 CU/dia
}

// =============================================================================
//  MONITORING
// =============================================================================

export interface EndpointSummary {
  slot:        number;
  account:     number;
  chain:       GbChain;
  protocol:    GbProtocol;
  isActive:    boolean;
  cuExhausted: boolean;
  envKey:      string;
  urlMasked:   string;
  tier:        'existing' | 'new';
}

export function getEndpointSummary(): EndpointSummary[] {
  const existingKeys = new Set(GB_REGISTRY_EXISTING.map(e => e.envKey));
  return GB_REGISTRY.map(ep => ({
    slot:        ep.slot,
    account:     ep.account,
    chain:       ep.chain,
    protocol:    ep.protocol,
    isActive:    ep.isActive,
    cuExhausted: !isCuAvailable(ep.url),
    envKey:      ep.envKey,
    urlMasked:   ep.isActive ? ep.url.replace(/\/([a-f0-9A-F]{12,})/, '/****') : 'NOT_CONFIGURED',
    tier:        existingKeys.has(ep.envKey) ? 'existing' : 'new',
  }));
}

export function getActiveCount(): number    { return GB_REGISTRY.filter(e => e.isActive).length; }
export function getAvailableCount(): number { return GB_REGISTRY.filter(e => e.isActive && isCuAvailable(e.url)).length; }

export function getCoveredChains(): GbChain[] {
  return [...new Set(
    GB_REGISTRY.filter(e => e.isActive && e.protocol === 'rpc' && isCuAvailable(e.url)).map(e => e.chain)
  )];
}

export function getMissingNewTokens(): string[] {
  return GB_REGISTRY_NEW
    .filter(e => !e.isActive && e.protocol === 'rpc')
    .map(e => e.envKey);
}

// =============================================================================
//  STARTUP LOG
// =============================================================================

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const existingActive = GB_REGISTRY_EXISTING.filter(e => e.isActive).length;
  const newActive      = GB_REGISTRY_NEW.filter(e => e.isActive).length;
  const missing        = getMissingNewTokens();
  const totalCu        = (getTotalCuBudget() / 1_000_000).toFixed(1);

  console.log(
    `[GetBlock] ${existingActive + newActive}/${GB_REGISTRY.length} slots activos | ` +
    `Existentes: ${existingActive} | Nuevos: ${newActive}/80 | ` +
    `CU total: ${totalCu}M/dia | Chains: ${getCoveredChains().join(', ')}`
  );
  if (missing.length > 0) {
    console.log(`[GetBlock] Tokens pendientes (${missing.length}): ${missing.join(', ')}`);
  } else {
    console.log(`[GetBlock] Todos los 40 tokens nuevos configurados. Sistema al maximo rendimiento.`);
  }
}
