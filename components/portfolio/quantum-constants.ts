export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "transferFrom",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }],
    "name": "Transfer",
    "type": "event"
  }
] as const;

export const UNISWAP_V3_POOL_ABI = [
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      { "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" },
      { "internalType": "int24", "name": "tick", "type": "int24" },
      { "internalType": "uint16", "name": "observationIndex", "type": "uint16" },
      { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" },
      { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" },
      { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" },
      { "internalType": "bool", "name": "unlocked", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidity",
    "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const AAVE_POOL_DATA_PROVIDER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserReserveData",
    "outputs": [
      { "internalType": "uint256", "name": "currentATokenBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "currentStableDebt", "type": "uint256" },
      { "internalType": "uint256", "name": "currentVariableDebt", "type": "uint256" },
      { "internalType": "uint256", "name": "principalStableDebt", "type": "uint256" },
      { "internalType": "uint256", "name": "scaledVariableDebt", "type": "uint256" },
      { "internalType": "uint256", "name": "stableBorrowRate", "type": "uint256" },
      { "internalType": "uint256", "name": "liquidityRate", "type": "uint256" },
      { "internalType": "uint40", "name": "stableRateLastUpdated", "type": "uint40" },
      { "internalType": "bool", "name": "usageAsCollateralEnabled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Top 20 ERC20 Tokens by Market Cap (Mainnet Addresses)
export const MAJOR_TOKENS = [
  { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, color: "#26A17B" },
  { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, color: "#2775CA" },
  { symbol: "STETH", address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", decimals: 18, color: "#00A3FF" },
  { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, color: "#F7931A" },
  { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, color: "#2A5ADA" },
  { symbol: "UNI", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, color: "#FF007A" },
  { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, color: "#F4B731" },
  { symbol: "LDO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18, color: "#F4A4A4" },
  { symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18, color: "#B6509E" },
  { symbol: "MKR", address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", decimals: 18, color: "#1AAB9B" },
  { symbol: "SNX", address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F", decimals: 18, color: "#00D1FF" },
  { symbol: "CRV", address: "0xD533a949740bb3306d119CC777fa900bA034cd52", decimals: 18, color: "#FF0000" },
  { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18, color: "#4CA54A" },
  { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18, color: "#FFA409" },
  { symbol: "ARB", address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", decimals: 18, color: "#28A0F0" },
  { symbol: "OP", address: "0x4200000000000000000000000000000000000042", decimals: 18, color: "#FF0420" },
  { symbol: "ENS", address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", decimals: 18, color: "#5298FF" },
  { symbol: "GRT", address: "0xc944E90C64B2c07662A292be6244BDf05Cae44CE", decimals: 18, color: "#6741D9" },
  { symbol: "RNDR", address: "0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24", decimals: 18, color: "#FF0000" },
  { symbol: "MATIC", address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", decimals: 18, color: "#8247E5" }
];
