import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// Enterprise ENDPOINT REGISTRY
// ============================================================================
// The user will inject the production on-chain endpoints here in the next step.
export const REGISTRY = {
  MARKET_DATA: {
    watchlist:      "/api/premium/watched-wallets",
    gainersLosers:  "/api/markets/stream", // Map directly to the central market stream provider
    newPairs:       "/api/market/new-pairs",
    polymarket:     "/api/polymarket/orders",
  },
  Private_INTEL: {
    massTransfers:  "/api/analytics/mass-transfers", // mapped interceptor
    entityMap:      "/api/network/evm/recent", 
    smartSignals:   "/api/whale-stream",
    eventLedger:    "/api/network/mempool/recent",
    cosmicForge:    "/api/forge/status",
  },
  VAULT_DATA: {
    portfolio:      "/api/wallet/portfolio",
    whaleWallets:   "/api/premium/watched-wallets",
    coldStorage:    "/api/wallet/onchain-balances",
    zkShield:       "/api/network/forensics",
  },
  OMNI_INFRA: {
    blockExplorer:  "/api/network/evm/recent",
    brc20:          "/api/network/mempool/recent",
    sessionLogs:    "/api/session-logs",
    news:           "/api/news",
  }
};

// ============================================================================
// BASE FETCHER WITH TITANIUM SECURITY HEADERS
// ============================================================================
const fetchSystem = async (url: string, requiresAuth: boolean = false) => {
  if (!url || url.includes('tbd-')) {
     // Suspend fetching intentionally until endpoints are provided by the user
     return new Promise(() => {}); // Infinite suspense / loading state
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    // Generate the Titanium HMAC signature (Placeholder integration point)
    const timestamp = Date.now().toString();
    headers['X-Forge-Timestamp'] = timestamp;
    headers['X-Forge-Signature'] = 'EXPECTING_INJECTION'; 
  }

  const fetchUrl = url;

  const res = await fetch(fetchUrl, { headers });
  
  if (!res.ok) {
    throw new Error(`System API Error: ${res.status}`);
  }

  const data = await res.json();
  return data;
};

// ============================================================================
// UNIVERSAL HOOKS
// ============================================================================

export function useMarketData(endpointKey: keyof typeof REGISTRY.MARKET_DATA) {
  const query = useQuery({
    queryKey: ['market', endpointKey],
    // Force auth for watchlist since it's sharing the vault endpoint
    queryFn: () => fetchSystem(REGISTRY.MARKET_DATA[endpointKey], endpointKey === 'watchlist'),
    refetchInterval: 60_000,
    staleTime: 55_000,          // prevents duplicate fetches within 55s
    retry: 2,
  });
  return {
    ...query,
    refetch: query.refetch,     // explicitly expose refetch for manual refresh buttons
  };
}

// Highly secured analytics fetches
export function useSystemIntel(endpointKey: keyof typeof REGISTRY.Private_INTEL) {
  return useQuery({
    queryKey: ['intel', endpointKey],
    queryFn: () => fetchSystem(REGISTRY.Private_INTEL[endpointKey], true),
    refetchInterval: endpointKey === 'massTransfers' ? 30_000 : 60_000,
    staleTime: endpointKey === 'massTransfers' ? 25_000 : 55_000,
  });
}

// Authenticated vault data for connected wallets
export function useVaultData(endpointKey: keyof typeof REGISTRY.VAULT_DATA) {
  return useQuery({
    queryKey: ['vault', endpointKey],
    queryFn: () => fetchSystem(REGISTRY.VAULT_DATA[endpointKey], true),
  });
}

export function useOmniInfrastructure(endpointKey: keyof typeof REGISTRY.OMNI_INFRA) {
  return useQuery({
    queryKey: ['infra', endpointKey],
    queryFn: () => fetchSystem(REGISTRY.OMNI_INFRA[endpointKey], false),
    refetchInterval: endpointKey === 'sessionLogs' ? 10000 : 120000,
  });
}
