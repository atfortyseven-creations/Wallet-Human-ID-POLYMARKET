import { prisma } from '@/lib/prisma';
import { 
  TransactionStatus, 
  type TransactionType, 
  type CreateTransactionData, 
  type TransactionMetadata 
} from './transactions';

/**
 * Create a new transaction record
 */
export async function createTransaction(data: CreateTransactionData) {
  return prisma.transaction.create({
    data: {
      authUserId: data.authUserId,
      hash: data.hash,
      chainId: data.chainId,
      type: data.type,
      status: data.status,
      from: data.from,
      to: data.to,
      value: data.value,
      tokenAddress: data.tokenAddress,
      tokenSymbol: data.tokenSymbol,
      timestamp: new Date(),
      metadata: data.metadata as any,
    },
  });
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(
  authUserId: string,
  options?: {
    chainId?: number;
    type?: TransactionType;
    limit?: number;
    offset?: number;
  }
) {
  const where: any = { authUserId };
  
  if (options?.chainId) {
    where.chainId = options.chainId;
  }
  
  if (options?.type) {
    where.type = options.type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  return transactions;
}

/**
 * Get transaction by hash
 */
export async function getTransactionByHash(hash: string) {
  return prisma.transaction.findUnique({
    where: { hash },
  });
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  hash: string,
  status: TransactionStatus,
  metadata?: Partial<TransactionMetadata>
) {
  const existingTx = await getTransactionByHash(hash);
  
  const updatedMetadata = metadata
    ? { ...(existingTx?.metadata as any), ...metadata }
    : existingTx?.metadata;

  return prisma.transaction.update({
    where: { hash },
    data: {
      status,
      metadata: updatedMetadata as any,
    },
  });
}

/**
 * Get pending transactions
 */
export async function getPendingTransactions(authUserId: string) {
  return prisma.transaction.findMany({
    where: {
      authUserId,
      status: TransactionStatus.PENDING,
    },
    orderBy: { timestamp: 'desc' },
  });
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(authUserId: string) {
  const [total, pending, confirmed, failed] = await Promise.all([
    prisma.transaction.count({ where: { authUserId } }),
    prisma.transaction.count({ where: { authUserId, status: TransactionStatus.PENDING } }),
    prisma.transaction.count({ where: { authUserId, status: TransactionStatus.CONFIRMED } }),
    prisma.transaction.count({ where: { authUserId, status: TransactionStatus.FAILED } }),
  ]);

  return {
    total,
    pending,
    confirmed,
    failed,
  };
}
