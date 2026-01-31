import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getTransactionHistory, 
  getTransactionStats,
  exportTransactionsToCSV,
  type TransactionType 
} from '@/lib/wallet/transactions';

/**
 * GET /api/wallet/transactions
 * Get transaction history for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const type = searchParams.get('type') as TransactionType | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const format = searchParams.get('format'); // 'json' or 'csv'

    const transactions = await getTransactionHistory(session.user.id, {
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getTransactionStats(session.user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}
