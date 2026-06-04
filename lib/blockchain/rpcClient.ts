import { createPublicClient, webSocket, http } from 'viem';
import { mainnet, polygon } from 'viem/chains';
import { getGbWss } from './getblock-registry';

/**
 * rpcClient  WebSocket Viem Clients
 *
 * WSS primario: GetBlock Registry (GB_ETH_WSS_1, GB_POL_WSS_1)
 * Fallback:     Alchemy  público
 *
 * Clientes lazy (se instancian solo cuando se necesitan).
 */

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;

// ETH WSS: GetBlock Registry primero, Alchemy segundo, público de emergencia
const ETH_WS_URL =
    getGbWss('eth') ||
    process.env.ETH_WS_URL ||
    (ALCHEMY_KEY ? `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'wss://ethereum-rpc.publicnode.com');

// POL WSS: GetBlock Registry primero, Alchemy segundo, público de emergencia
const POL_WS_URL =
    getGbWss('polygon') ||
    process.env.POL_WS_URL ||
    (ALCHEMY_KEY ? `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'wss://polygon-bor-rpc.publicnode.com');

//  Lazy ETH WebSocket Client 
let _ethClient: ReturnType<typeof createPublicClient> | null = null;

export const getEthWsClient = () => {
    if (!_ethClient) {
        _ethClient = createPublicClient({
            chain: mainnet,
            transport: webSocket(ETH_WS_URL, {
                retryCount: 5,
                retryDelay: 1000,
                keepAlive: true,
            }),
        });
        console.log(` [RpcClient] ETH WSS  ${ETH_WS_URL.replace(/\/([a-f0-9]{20,})/, '/****')}`);
    }
    return _ethClient;
};

//  Lazy Polygon WebSocket Client 
let _polClient: ReturnType<typeof createPublicClient> | null = null;

export const getPolWsClient = () => {
    if (!_polClient) {
        _polClient = createPublicClient({
            chain: polygon,
            transport: webSocket(POL_WS_URL, {
                retryCount: 5,
                retryDelay: 1000,
                keepAlive: true,
            }),
        });
        console.log(` [RpcClient] POL WSS  ${POL_WS_URL.replace(/\/([a-f0-9]{20,})/, '/****')}`);
    }
    return _polClient;
};

// ETH HTTP: GetBlock Registry primero, Alchemy segundo, público de emergencia
const ETH_HTTP_URL = 
    process.env.NEXT_PUBLIC_ETH_RPC_URL || 
    (ALCHEMY_KEY ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'https://cloudflare-eth.com');

//  HTTP client para fetching de bloques/receipts cuando WS pushea un hash 
export const ethHttpClient = createPublicClient({
    chain: mainnet,
    transport: http(ETH_HTTP_URL),
});
