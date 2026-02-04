import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAddressBook, addToAddressBook, updateAddressBookEntry, deleteAddressBookEntry, toggleFavorite, exportAddressBookToCSV } from '@/lib/wallet/addressBook';

/**
 * GET /api/wallet/address-book
 * Get address book entries
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const label = searchParams.get('label');
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const format = searchParams.get('format');

    const entries = await getAddressBook(session.user.id, {
      search: search || undefined,
      label: label || undefined,
      favoritesOnly,
    });

    // Export as CSV if requested
    if (format === 'csv') {
      const csv = await exportAddressBookToCSV(session.user.id);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="address-book-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching address book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address book' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/address-book
 * Add new address book entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, ensName, label, note, isFavorite } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address' },
        { status: 400 }
      );
    }

    const entry = await addToAddressBook({
      authUserId: session.user.id,
      name,
      address,
      ensName,
      label,
      note,
      isFavorite,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error adding address book entry:', error);
    return NextResponse.json(
      { error: 'Failed to add entry' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/wallet/address-book/:id
 * Update address book entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, label, note, isFavorite, toggleFavoriteFlag } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let entry;

    if (toggleFavoriteFlag) {
      entry = await toggleFavorite(id);
    } else {
      entry = await updateAddressBookEntry(id, {
        name,
        label,
        note,
        isFavorite,
      });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating address book entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wallet/address-book/:id
 * Delete address book entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    await deleteAddressBookEntry(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address book entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
