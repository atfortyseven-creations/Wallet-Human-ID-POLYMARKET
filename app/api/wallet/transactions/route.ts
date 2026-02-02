import { NextRequest, NextResponse } from 'next/server';
// Imports removed
import { 
  exportTransactionsToCSV,
  type TransactionType 
} from '@/lib/wallet/transactions';
import { 
  getTransactionHistory, 
  getTransactionStats
} from '@/lib/wallet/transactions-server';

/**
 * GET /api/wallet/transactions
 * Get transaction history for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get('authUserId');
    const chainId = searchParams.get('chainId');
    const type = searchParams.get('type') as TransactionType | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const format = searchParams.get('format'); // 'json' or 'csv'

    // We allow fetching public transaction data for any "address" (authUserId)
    // In a real app, you might want to verify if the requestor owns the address via Clerk
    if (!authUserId) {
        return NextResponse.json({ error: 'Missing authUserId (wallet address)' }, { status: 400 });
    }

    const transactions = await getTransactionHistory(authUserId, {
      chainId: chainId ? parseInt(chainId) : undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    // Export as CSV if requested
    if (format === 'csv') {
      const csv = exportTransactionsToCSV(transactions);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/transactions/stats
 * Get transaction statistics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authUserId } = body;

    if (!authUserId) {
        return NextResponse.json({ error: 'Missing authUserId' }, { status: 400 });
    }

    const stats = await getTransactionStats(authUserId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}
