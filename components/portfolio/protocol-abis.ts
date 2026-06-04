// ============================================================
// PROTOCOL ABI REGISTRY — Advanced Architecture QUANTUM ENGINE
// Full production ABIs for on-chain multicall interrogation
// ============================================================

// AAVE V3 Pool — Full getUserAccountData + supply + borrow
export const AAVE_V3_POOL_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserAccountData",
    "outputs": [
      { "internalType": "uint256", "name": "totalCollateralBase", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDebtBase", "type": "uint256" },
      { "internalType": "uint256", "name": "availableBorrowsBase", "type": "uint256" },
      { "internalType": "uint256", "name": "currentLiquidationThreshold", "type": "uint256" },
      { "internalType": "uint256", "name": "ltv", "type": "uint256" },
      { "internalType": "uint256", "name": "healthFactor", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" },
      { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRateMode", "type": "uint256" },
      { "internalType": "uint16", "name": "referralCode", "type": "uint16" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" }
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Compound V3 Comet
export const COMPOUND_V3_COMET_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "borrowBalanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Lido stETH
export const LIDO_STETH_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getTotalPooledEther",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getTotalShares",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// MakerDAO Vat
export const MAKER_VAT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "ilk", "type": "bytes32" },
      { "internalType": "address", "name": "urn", "type": "address" }
    ],
    "name": "urns",
    "outputs": [
      { "internalType": "uint256", "name": "ink", "type": "uint256" },
      { "internalType": "uint256", "name": "art", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Uniswap V3 Router
export const UNISWAP_V3_ROUTER_ABI = [
    {
      "inputs": [
        {
          "components": [
            { "internalType": "bytes", "name": "path", "type": "bytes" },
            { "internalType": "address", "name": "recipient", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" }
          ],
          "internalType": "struct ISwapRouter.ExactInputParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "exactInput",
      "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
      "stateMutability": "payable",
      "type": "function"
    }
];



export const PROTOCOL_ADDRESSES = {
    AAVE_V3_POOL: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    COMET_USDC: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
    LIDO_STETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    MAKER_VAT: "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B"
} as const;
