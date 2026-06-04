import { ethers } from 'ethers';
import { executeOnChainApproval, ERC20_ABI } from './onchain-engine';

// -----------------------------------------------------------------------------
// STRICT ON-CHAIN DEX ENGINE (UNISWAP V3)
// WARNING: NO SIMULATIONS. DIRECT INTERACTION WITH LIVE DEX ROUTERS.
// -----------------------------------------------------------------------------

export const UNISWAP_V3_ROUTER_ABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function exactInput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum) params) payable returns (uint256 amountOut)",
  "function multicall(bytes[] data) payable returns (bytes[] results)",
  "function unwrapWETH9(uint256 amountMinimum, address recipient) payable",
  "function refundETH() payable",
  "function sweepToken(address token, uint256 amountMinimum, address recipient) payable"
];

export const UNISWAP_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)"
];

// Universal Router / SwapRouter02 Addresses
export const DEX_CONTRACTS = {
  ethereum: {
    ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // SwapRouter02
    QUOTER: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", // QuoterV2
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    WMATIC: ""
  },
  polygon: {
    ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", 
    QUOTER: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", 
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    WETH: ""
  }
};

/**
 * Calculates cryptographic slippage bounds directly in BigInt to prevent JS precision loss.
 */
export function calculateSlippage(amountOutExpected: bigint, slippageBps: bigint): bigint {
  // slippageBps: 100 = 1%
  const tolerance = (amountOutExpected * slippageBps) / 10000n;
  return amountOutExpected - tolerance;
}

/**
 * Executes a strictly on-chain Uniswap V3 Quote request to determine market exchange rates.
 */
export async function fetchOnChainQuote(
  provider: ethers.Provider,
  tokenIn: string,
  tokenOut: string,
  amountInWei: bigint,
  feeTier: number = 3000,
  chainId: number = 1
): Promise<bigint> {
  const contracts = chainId === 137 ? DEX_CONTRACTS.polygon : DEX_CONTRACTS.ethereum;
  
  // If native token, route to Wrapped equivalent for quote
  const tIn = tokenIn === ethers.ZeroAddress ? (chainId === 137 ? contracts.WMATIC : contracts.WETH) : tokenIn;
  const tOut = tokenOut === ethers.ZeroAddress ? (chainId === 137 ? contracts.WMATIC : contracts.WETH) : tokenOut;

  const quoter = new ethers.Contract(contracts.QUOTER, UNISWAP_QUOTER_ABI, provider);
  
  try {
    const amountOut = await quoter.quoteExactInputSingle(tIn, tOut, feeTier, amountInWei, 0);
    return amountOut;
  } catch (err) {
    console.error("[DEX-ENGINE] Quoter execution reverted. Pool may not exist or lacks liquidity.", err);
    throw new Error("DEX Liquidity Pool not found or quote reverted on-chain.");
  }
}

/**
 * Compiles and broadcasts a complex exactInputSingle transaction directly to the Uniswap V3 Router.
 * Handles Native Token wrapping/unwrapping multicalls inherently.
 */
export async function executeStrictSwap(
  wallet: ethers.Wallet,
  tokenIn: string,
  tokenOut: string,
  amountInWei: bigint,
  amountOutMinimumWei: bigint,
  feeTier: number = 3000,
  gasPriority: 'low' | 'medium' | 'high' = 'medium'
) {
  if (!wallet.provider) throw new Error("Cryptographic provider disconnected.");
  
  const network = await wallet.provider.getNetwork();
  const chainId = Number(network.chainId);
  const contracts = chainId === 137 ? DEX_CONTRACTS.polygon : DEX_CONTRACTS.ethereum;
  
  const router = new ethers.Contract(contracts.ROUTER, UNISWAP_V3_ROUTER_ABI, wallet);
  
  const isNativeIn = tokenIn === ethers.ZeroAddress;
  const isNativeOut = tokenOut === ethers.ZeroAddress;
  
  const tIn = isNativeIn ? (chainId === 137 ? contracts.WMATIC : contracts.WETH) : tokenIn;
  const tOut = isNativeOut ? (chainId === 137 ? contracts.WMATIC : contracts.WETH) : tokenOut;

  // 1. ERC-20 Allowance Check (If not native)
  if (!isNativeIn) {
    const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, wallet);
    const allowance: bigint = await tokenContract.allowance(wallet.address, contracts.ROUTER);
    if (allowance < amountInWei) {
      console.log("[DEX-ENGINE] Triggering EIP-20 Approval to Uniswap Router...");
      await executeOnChainApproval(wallet, tokenIn, contracts.ROUTER, ethers.MaxUint256);
    }
  }

  // 2. Build Swap Parameters
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes
  
  const params = {
    tokenIn: tIn,
    tokenOut: tOut,
    fee: feeTier,
    recipient: isNativeOut ? ethers.ZeroAddress : wallet.address, // If native out, router holds temporarily to unwrap
    deadline,
    amountIn: amountInWei,
    amountOutMinimum: amountOutMinimumWei,
    sqrtPriceLimitX96: 0n
  };

  // 3. Construct EIP-1559 Fee Market Data
  const feeData = await wallet.provider.getFeeData();
  const priorityMultiplier = gasPriority === 'high' ? 2.0 : gasPriority === 'low' ? 0.8 : 1.2;
  const maxPriorityFeePerGas = BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas || 1000000000) * priorityMultiplier));
  let maxFeePerGas = feeData.maxFeePerGas || (maxPriorityFeePerGas * 2n);
  
  if (gasPriority === 'high') {
     maxFeePerGas = maxFeePerGas * 3n / 2n;
  }

  const txOptions: any = {
    maxFeePerGas,
    maxPriorityFeePerGas,
    type: 2
  };

  if (isNativeIn) {
    txOptions.value = amountInWei;
  }

  // 4. Execution Logic (Single vs Multicall for Native unwrapping)
  let tx;
  
  if (isNativeOut) {
    // Requires Multicall: exactInputSingle -> unwrapWETH9
    console.log("[DEX-ENGINE] Compiling Multicall (Swap + Unwrap)...");
    const swapData = router.interface.encodeFunctionData("exactInputSingle", [params]);
    const unwrapData = router.interface.encodeFunctionData("unwrapWETH9", [amountOutMinimumWei, wallet.address]);
    
    tx = await router.multicall([swapData, unwrapData], txOptions);
  } else {
    // Standard ERC20 -> ERC20 execution
    console.log("[DEX-ENGINE] Executing exactInputSingle on-chain...");
    tx = await router.exactInputSingle(params, txOptions);
  }

  console.log(`[DEX-ENGINE] Transaction Broadcasted: ${tx.hash}`);
  return await tx.wait(1);
}
