

export const TRADING_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 
  'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 
  'LTCUSDT', 'SHIBUSDT', 'TRXUSDT', 'UNIUSDT', 'LINKUSDT', 
  'ATOMUSDT', 'XLMUSDT', 'BCHUSDT', 'NEARUSDT', 'FILUSDT', 
  'APEUSDT', 'ALGOUSDT', 'ICPUSDT', 'ETCUSDT', 'VETUSDT', 
  'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'THETAUSDT', 'AAVEUSDT',
  'AUTHUSDT' //  Identity Support
];

export interface PairMetadata {
  displayName: string;
  baseAsset: string;
  category: string;
}

export const PAIR_METADATA: Record<string, PairMetadata> = {
  'BTCUSDT': { displayName: 'Bitcoin', baseAsset: 'BTC', category: 'Layer 1' },
  'ETHUSDT': { displayName: 'Ethereum', baseAsset: 'ETH', category: 'Layer 1' },
  'SOLUSDT': { displayName: 'Solana', baseAsset: 'SOL', category: 'Layer 1' },
  'BNBUSDT': { displayName: 'BNB', baseAsset: 'BNB', category: 'Exchange' },
  'XRPUSDT': { displayName: 'XRP', baseAsset: 'XRP', category: 'Payment' },
  'ADAUSDT': { displayName: 'Cardano', baseAsset: 'ADA', category: 'Layer 1' },
  'AVAXUSDT': { displayName: 'Avalanche', baseAsset: 'AVAX', category: 'Layer 1' },
  'DOGEUSDT': { displayName: 'Dogecoin', baseAsset: 'DOGE', category: 'Meme' },
  'DOTUSDT': { displayName: 'Polkadot', baseAsset: 'DOT', category: 'Layer 1' },
  'MATICUSDT': { displayName: 'Polygon', baseAsset: 'MATIC', category: 'Layer 2' },
  'LTCUSDT': { displayName: 'Litecoin', baseAsset: 'LTC', category: 'Payment' },
  'SHIBUSDT': { displayName: 'Shiba Inu', baseAsset: 'SHIB', category: 'Meme' },
  'TRXUSDT': { displayName: 'TRON', baseAsset: 'TRX', category: 'Layer 1' },
  'UNIUSDT': { displayName: 'Uniswap', baseAsset: 'UNI', category: 'DeFi' },
  'LINKUSDT': { displayName: 'Chainlink', baseAsset: 'LINK', category: 'Infrastructure' },
  'ATOMUSDT': { displayName: 'Cosmos', baseAsset: 'ATOM', category: 'Layer 1' },
  'XLMUSDT': { displayName: 'Stellar', baseAsset: 'XLM', category: 'Payment' },
  'BCHUSDT': { displayName: 'Bitcoin Cash', baseAsset: 'BCH', category: 'Payment' },
  'NEARUSDT': { displayName: 'NEAR', baseAsset: 'NEAR', category: 'Layer 1' },
  'FILUSDT': { displayName: 'Filecoin', baseAsset: 'FIL', category: 'Storage' },
  'APEUSDT': { displayName: 'ApeCoin', baseAsset: 'APE', category: 'Metaverse' },
  'ALGOUSDT': { displayName: 'Algorand', baseAsset: 'ALGO', category: 'Layer 1' },
  'ICPUSDT': { displayName: 'Internet Computer', baseAsset: 'ICP', category: 'Layer 1' },
  'ETCUSDT': { displayName: 'Ethereum Classic', baseAsset: 'ETC', category: 'Layer 1' },
  'VETUSDT': { displayName: 'VeChain', baseAsset: 'VET', category: 'Supply Chain' },
  'SANDUSDT': { displayName: 'The Sandbox', baseAsset: 'SAND', category: 'Metaverse' },
  'MANAUSDT': { displayName: 'Decentraland', baseAsset: 'MANA', category: 'Metaverse' },
  'AXSUSDT': { displayName: 'Axie Infinity', baseAsset: 'AXS', category: 'Gaming' },
  'THETAUSDT': { displayName: 'Theta', baseAsset: 'THETA', category: 'Infrastructure' },
  'AAVEUSDT': { displayName: 'Aave', baseAsset: 'AAVE', category: 'DeFi' },
  'AUTHUSDT': { displayName: 'Identity', baseAsset: 'AUTH', category: 'Identity' } //  Whale Alert IDentity Token
};

