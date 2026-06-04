/**
 * Transaction Types & Client Utilities
 * Safe for client-side imports
 */

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SWAP = 'SWAP',
  CONTRACT = 'CONTRACT',
  NFT_TRANSFER = 'NFT_TRANSFER',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface TransactionMetadata {
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenLogo?: string;
  swapFrom?: string;
  swapTo?: string;
  nftName?: string;
  nftImage?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  nonce?: number;
}

export interface CreateTransactionData {
  authUserId: string;
  hash: string;
  chainId: number;
  type: TransactionType;
  baseType?: string; // e.g. 'TRANSFER', 'SWAP'
  status: TransactionStatus;
  from: string;
  to: string;
  value: string; // in wei or decimal string
  tokenAddress?: string;
  tokenSymbol?: string;
  metadata?: TransactionMetadata;
  //  INSTITUTIONAL INTELLIGENCE 
  isWhale?: boolean;
  institutional?: boolean;
  valueBTC?: string;
  logo?: string;
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(transactions: any[]): string {
  const headers = [
    'Date',
    'Type',
    'Chain',
    'From',
    'To',
    'Amount',
    'Token',
    'Status',
    'Transaction Hash',
  ];

  const rows = transactions.map(tx => [
    new Date(tx.timestamp).toISOString(),
    tx.type,
    tx.chainId,
    tx.from,
    tx.to,
    tx.value,
    tx.tokenSymbol || 'ETH',
    tx.status,
    tx.hash,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

