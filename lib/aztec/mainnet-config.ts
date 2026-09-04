/**
 * AZTEC MAINNET CONFIGURATION
 * Switch to Aztec mainnet for January launch.
 * 
 * HOW TO SWITCH TO MAINNET:
 * Set AZTEC_NETWORK=mainnet in your Railway environment variables.
 */

export const AZTEC_NETWORK = process.env.AZTEC_NETWORK || 'mainnet';
export const IS_MAINNET = AZTEC_NETWORK === 'mainnet';

export const AZTEC_CONFIG = IS_MAINNET ? {
  pxeUrl: process.env.AZTEC_PXE_URL || 'https://pxe.aztec.network',
  nodeUrl: process.env.AZTEC_NODE_URL || 'https://node.aztec.network',
  explorerUrl: 'https://aztecscan.xyz',
  chainId: 2151908,
  networkName: 'Aztec Mainnet',
} : {
  pxeUrl: process.env.AZTEC_PXE_URL || 'https://node.aztec.network',
  nodeUrl: process.env.AZTEC_NODE_URL || 'https://node.aztec.network',
  explorerUrl: 'https://aztecscan.xyz',
  chainId: 2151908,
  networkName: 'Aztec Mainnet',
};

/** 
 * Token contract address — must be deployed to mainnet before January launch.
 * Set AZTEC_TOKEN_CONTRACT_ADDRESS in Railway env vars after deployment.
 */
export const TOKEN_CONTRACT_ADDRESS = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS || 'PENDING_DEPLOY';
export const IS_TOKEN_DEPLOYED = TOKEN_CONTRACT_ADDRESS !== 'PENDING_DEPLOY';

/** QD Token economics */
export const QD_DECIMALS = 6;
export const QD_GENESIS_BALANCE = 2500;
export const QD_AIRDROP_AMOUNT = 1000;
export const QD_MIN_TRANSFER_FEE = 1;
export const QD_TRANSFER_FEE_BPS = 100; // 1%

export function getExplorerTxUrl(txHash: string): string {
  return `${AZTEC_CONFIG.explorerUrl}/tx-effect/${txHash.replace('0x', '')}`;
}
