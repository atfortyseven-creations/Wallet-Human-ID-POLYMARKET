/**
 * =============================================================================
 *   GETBLOCK REGISTRY — SISTEMA UNIFICADO
 * =============================================================================
 *
 *  BLOQUE A — CUENTAS EXISTENTES (1-22, formato original)
 *  Variables: GB_ETH_RPC_1, GB_ETH_WSS_1, GB_SOL_RPC_1, etc.
 *  Estado: YA CONFIGURADAS EN RAILWAY — NO TOCAR
 *
 *  BLOQUE B — NUEVAS 25 CUENTAS (formato token único)
 *  Variables: GB_TOKEN_01 ... GB_TOKEN_25
 *  Cada token genera HTTPS + WSS automáticamente:
 *    https://go.getblock.io/{TOKEN}
 *    wss://go.getblock.io/{TOKEN}
 *  Estado: PENDIENTE — el usuario pegará los tokens
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
//  CONSTRUCTOR PARA FORMATO ORIGINAL (GB_ETH_RPC_1, GB_ETH_WSS_1...)
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
//  CONSTRUCTOR PARA FORMATO NUEVO (GB_TOKEN_01 → genera HTTPS + WSS)
// =============================================================================

function epToken(
  slotBase: number,
  account:  number,
  chain:    GbChain,
  envKey:   string,
): GbEndpoint[] {
  const raw   = (process.env[envKey] ?? '').trim().replace(/^["']|["']$/g, '');
  // Acepta token puro o URL completa — extrae el token en ambos casos
  const token = raw
    .replace(/^https?:\/\/go\.getblock\.io\//i, '')
    .replace(/^wss?:\/\/go\.getblock\.io\//i, '');
  const isActive = token.length > 10 && !token.includes(' ') && !token.includes('PEGA_');

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
//  BLOQUE A — CUENTAS EXISTENTES (22 cuentas | formato original)
//  YA CONFIGURADAS EN RAILWAY — NO MODIFICAR NOMBRES DE VARIABLES
// =============================================================================

export const GB_REGISTRY_EXISTING: GbEndpoint[] = [
  // CUENTA 1 — ETH primario
  ep( 1,  1, 'eth', 'rpc', 'GB_ETH_RPC_1'),
  ep( 2,  1, 'eth', 'wss', 'GB_ETH_WSS_1'),
  // CUENTA 2 — ETH secundario
  ep( 3,  2, 'eth', 'rpc', 'GB_ETH_RPC_2'),
  ep( 4,  2, 'eth', 'wss', 'GB_ETH_WSS_2'),
  // CUENTA 3 — ETH terciario (2x HTTP)
  ep( 5,  3, 'eth', 'rpc', 'GB_ETH_RPC_3'),
  ep( 6,  3, 'eth', 'rpc', 'GB_ETH_RPC_4'),
  // CUENTA 4 — SOL primario
  ep( 7,  4, 'sol', 'rpc', 'GB_SOL_RPC_1'),
  ep( 8,  4, 'sol', 'rpc', 'GB_SOL_RPC_EXTRA'),
  ep( 9,  4, 'sol', 'wss', 'GB_SOL_WSS_1'),
  // CUENTA 5 — SOL redundancia
  ep(10,  5, 'sol', 'rpc', 'GB_SOL_RPC_2'),
  ep(11,  5, 'sol', 'rpc', 'GB_SOL_RPC_3'),
  // CUENTA 6 — POLYGON primario
  ep(12,  6, 'polygon', 'rpc', 'GB_POL_RPC_1'),
  ep(13,  6, 'polygon', 'rpc', 'GB_POL_RPC_EXTRA'),
  ep(14,  6, 'polygon', 'wss', 'GB_POL_WSS_1'),
  // CUENTA 7 — POLYGON redundancia
  ep(15,  7, 'polygon', 'rpc', 'GB_POL_RPC_2'),
  ep(16,  7, 'polygon', 'rpc', 'GB_POL_RPC_3'),
  // CUENTA 8 — BSC primario
  ep(17,  8, 'bsc', 'rpc', 'GB_BSC_RPC_1'),
  ep(18,  8, 'bsc', 'wss', 'GB_BSC_WSS_1'),
  // CUENTA 9 — BSC redundancia
  ep(19,  9, 'bsc', 'rpc', 'GB_BSC_RPC_2'),
  ep(20,  9, 'bsc', 'rpc', 'GB_BSC_RPC_3'),
  // CUENTA 10 — ARBITRUM
  ep(21, 10, 'arb', 'rpc', 'GB_ARB_RPC_1'),
  ep(22, 10, 'arb', 'wss', 'GB_ARB_WSS_1'),
  // CUENTA 11 — BASE
  ep(23, 11, 'base', 'rpc', 'GB_BASE_RPC_1'),
  ep(24, 11, 'base', 'wss', 'GB_BASE_WSS_1'),
  // CUENTAS ÚNICAS (101-105)
  ep(25, 101, 'op',       'rpc', 'GB_OP_RPC_1'),
  ep(26, 102, 'avax',     'rpc', 'GB_AVAX_RPC_1'),
  ep(27, 103, 'world',    'rpc', 'GB_WORLD_RPC_1'),
  ep(28, 104, 'hyperevm', 'rpc', 'GB_HYPEREVM_RPC_1'),
  ep(29, 105, 'bera',     'rpc', 'GB_BERA_RPC_1'),
  // SEGUNDA BATERÍA — CUENTAS 12-22 (backup)
  ep(30, 12, 'eth', 'rpc', 'GB_ETH_RPC_B1'),
  ep(31, 12, 'eth', 'wss', 'GB_ETH_WSS_B1'),
  ep(32, 13, 'eth', 'rpc', 'GB_ETH_RPC_B2'),
  ep(33, 13, 'eth', 'wss', 'GB_ETH_WSS_B2'),
  ep(34, 14, 'eth', 'rpc', 'GB_ETH_RPC_B3'),
  ep(35, 14, 'eth', 'rpc', 'GB_ETH_RPC_B4'),
  ep(36, 15, 'sol', 'rpc', 'GB_SOL_RPC_B1'),
  ep(37, 15, 'sol', 'wss', 'GB_SOL_WSS_B1'),
  ep(38, 16, 'sol', 'rpc', 'GB_SOL_RPC_B2'),
  ep(39, 16, 'sol', 'rpc', 'GB_SOL_RPC_B3'),
  ep(40, 17, 'polygon', 'rpc', 'GB_POL_RPC_B1'),
  ep(41, 17, 'polygon', 'wss', 'GB_POL_WSS_B1'),
  ep(42, 18, 'polygon', 'rpc', 'GB_POL_RPC_B2'),
  ep(43, 18, 'polygon', 'rpc', 'GB_POL_RPC_B3'),
  ep(44, 19, 'bsc', 'rpc', 'GB_BSC_RPC_B1'),
  ep(45, 19, 'bsc', 'wss', 'GB_BSC_WSS_B1'),
  ep(46, 20, 'bsc', 'rpc', 'GB_BSC_RPC_B2'),
  ep(47, 20, 'bsc', 'rpc', 'GB_BSC_RPC_B3'),
  ep(48, 21, 'arb', 'rpc', 'GB_ARB_RPC_B1'),
  ep(49, 21, 'arb', 'wss', 'GB_ARB_WSS_B1'),
  ep(50, 22, 'base', 'rpc', 'GB_BASE_RPC_B1'),
  ep(51, 22, 'base', 'wss', 'GB_BASE_WSS_B1'),
];

// =============================================================================
//  BLOQUE B — NUEVAS 25 CUENTAS (slots 200-249)
//  PENDIENTE: el usuario pegará los tokens en GB_TOKEN_01...GB_TOKEN_25
//  Formato: un solo token → genera HTTPS + WSS automáticamente
// =============================================================================

export const GB_REGISTRY_NEW: GbEndpoint[] = [
  // ── SLOT 200-249: Pendiente configuración ──────────────────────────────────
  // El usuario definirá la cadena de cada token cuando envíe el listado
  // Por ahora todos apuntan a 'eth' como placeholder hasta asignación definitiva
  ...epToken(200, 201, 'eth',     'GB_TOKEN_01'),
  ...epToken(202, 202, 'eth',     'GB_TOKEN_02'),
  ...epToken(204, 203, 'eth',     'GB_TOKEN_03'),
  ...epToken(206, 204, 'eth',     'GB_TOKEN_04'),
  ...epToken(208, 205, 'eth',     'GB_TOKEN_05'),
  ...epToken(210, 206, 'base',    'GB_TOKEN_06'),
  ...epToken(212, 207, 'base',    'GB_TOKEN_07'),
  ...epToken(214, 208, 'base',    'GB_TOKEN_08'),
  ...epToken(216, 209, 'base',    'GB_TOKEN_09'),
  ...epToken(218, 210, 'base',    'GB_TOKEN_10'),
  ...epToken(220, 211, 'polygon', 'GB_TOKEN_11'),
  ...epToken(222, 212, 'polygon', 'GB_TOKEN_12'),
  ...epToken(224, 213, 'polygon', 'GB_TOKEN_13'),
  ...epToken(226, 214, 'arb',     'GB_TOKEN_14'),
  ...epToken(228, 215, 'arb',     'GB_TOKEN_15'),
  ...epToken(230, 216, 'arb',     'GB_TOKEN_16'),
  ...epToken(232, 217, 'bsc',     'GB_TOKEN_17'),
  ...epToken(234, 218, 'bsc',     'GB_TOKEN_18'),
  ...epToken(236, 219, 'bsc',     'GB_TOKEN_19'),
  ...epToken(238, 220, 'op',      'GB_TOKEN_20'),
  ...epToken(240, 221, 'op',      'GB_TOKEN_21'),
  ...epToken(242, 222, 'avax',    'GB_TOKEN_22'),
  ...epToken(244, 223, 'world',   'GB_TOKEN_23'),
  ...epToken(246, 224, 'sol',     'GB_TOKEN_24'),
  ...epToken(248, 225, 'spare',   'GB_TOKEN_25'),
];

// =============================================================================
//  REGISTRY UNIFICADO — Existing + New
// =============================================================================

export const GB_REGISTRY: GbEndpoint[] = [
  ...GB_REGISTRY_EXISTING,
  ...GB_REGISTRY_NEW,
];

// =============================================================================
//  CU CIRCUIT BREAKER — Anti-Ban (auto-reset a 00:00 UTC)
// =============================================================================

export const GB_PRIMARY_SLOTS = GB_REGISTRY_EXISTING.filter(e => e.account <= 11 || (e.account >= 101 && e.account <= 105));
export const GB_BACKUP_SLOTS  = GB_REGISTRY_EXISTING.filter(e => e.account >= 12 && e.account <= 99);

interface CuState {
  exhausted:     boolean;
  exhaustedAt:   number;
  quota402Count: number;
}

const cuState = new Map<string, CuState>();

function msUntilMidnightUtc(): number {
  const now      = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return midnight.getTime() - now.getTime();
}

function getOrCreateCuState(url: string): CuState {
  if (!cuState.has(url)) {
    cuState.set(url, { exhausted: false, exhaustedAt: 0, quota402Count: 0 });
  }
  return cuState.get(url)!;
}

export function markCuExhausted(url: string): void {
  const state = getOrCreateCuState(url);
  state.exhausted     = true;
  state.exhaustedAt   = Date.now();
  state.quota402Count += 1;

  const resetIn = Math.round(msUntilMidnightUtc() / 60000);
  console.warn(
    `[GetBlock CB] CU AGOTADO ${url.slice(0, 52)}... | Reset en ~${resetIn} min (00:00 UTC) | Rotando.`
  );

  setTimeout(() => {
    const s = cuState.get(url);
    if (s) {
      s.exhausted = false;
      console.info(`[GetBlock CB] CU RESET ${url.slice(0, 52)}...`);
    }
  }, msUntilMidnightUtc());
}

export function isCuAvailable(url: string): boolean {
  if (!url) return false;
  return !getOrCreateCuState(url).exhausted;
}

// =============================================================================
//  GETTERS CON CIRCUIT BREAKER
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

export function getGbRpc(chain: GbChain): string {
  return getGbAllRpc(chain)[0] ?? '';
}

export function getGbWss(chain: GbChain): string {
  return getGbAllWss(chain)[0] ?? '';
}

// =============================================================================
//  PRESUPUESTO CU
// =============================================================================

export const CU_BUDGET: Record<GbChain, number> = {
  eth:      6 * 550_000,
  sol:      4 * 550_000,
  polygon:  4 * 550_000,
  bsc:      4 * 550_000,
  arb:      2 * 550_000,
  base:     2 * 550_000,
  op:       1 * 550_000,
  avax:     1 * 550_000,
  world:    1 * 550_000,
  hyperevm: 1 * 550_000,
  bera:     1 * 550_000,
  spare:    1 * 550_000,
};

export function getTotalCuBudget(): number {
  const existingCu = 22 * 550_000;
  const newCu      = GB_REGISTRY_NEW.filter(e => e.isActive && e.protocol === 'rpc').length * 550_000;
  return existingCu + newCu;
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
    urlMasked:   ep.isActive
      ? ep.url.replace(/\/([a-f0-9A-F]{12,})/, '/****')
      : 'NOT_CONFIGURED',
    tier: existingKeys.has(ep.envKey) ? 'existing' : 'new',
  }));
}

export function getActiveCount(): number {
  return GB_REGISTRY.filter(e => e.isActive).length;
}

export function getAvailableCount(): number {
  return GB_REGISTRY.filter(e => e.isActive && isCuAvailable(e.url)).length;
}

export function getCoveredChains(): GbChain[] {
  return [...new Set(
    GB_REGISTRY
      .filter(e => e.isActive && e.protocol === 'rpc' && isCuAvailable(e.url))
      .map(e => e.chain)
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
  const totalSlots     = GB_REGISTRY.length;
  const chains         = getCoveredChains();
  const missing        = getMissingNewTokens();

  console.log(
    `[GetBlock] ${existingActive + newActive}/${totalSlots} slots activos | ` +
    `Existentes: ${existingActive} | Nuevos: ${newActive}/50 | ` +
    `Chains: ${chains.join(', ')}`
  );

  if (missing.length > 0) {
    console.log(`[GetBlock] Nuevos tokens pendientes (${missing.length}): ${missing.join(', ')}`);
  }
}
