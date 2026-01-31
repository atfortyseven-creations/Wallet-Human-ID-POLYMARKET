/**
 * Address Book Service
 * Manage wallet contacts with ENS support
 */

import { prisma } from '@/lib/prisma';
import { resolveENSName, reverseResolveENS } from './ens';

export interface AddressBookEntry {
  id: string;
  authUserId: string;
  name: string;
  address: string;
  ensName?: string | null;
  label?: string | null;
  note?: string | null;
  isFavorite: boolean;
  chainId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressBookEntry {
  authUserId: string;
  name: string;
  address: string;
  ensName?: string;
  label?: string;
  note?: string;
  isFavorite?: boolean;
  chainId?: number;
}

/**
 * Add address to address book
 */
export async function addToAddressBook(data: CreateAddressBookEntry): Promise<AddressBookEntry> {
  // Try to resolve ENS name if not provided
  let ensName = data.ensName;
  if (!ensName) {
    ensName = await reverseResolveENS(data.address) || undefined;
  }

  return prisma.addressBookEntry.create({
    data: {
      authUserId: data.authUserId,
      name: data.name,
      address: data.address.toLowerCase(),
      ensName,
      label: data.label,
      note: data.note,
      isFavorite: data.isFavorite || false,
      chainId: data.chainId,
    },
  });
}

/**
 * Get all address book entries for user
 */
export async function getAddressBook(
  authUserId: string,
  options?: {
    label?: string;
    favoritesOnly?: boolean;
    search?: string;
  }
): Promise<AddressBookEntry[]> {
  const where: any = { authUserId };

  if (options?.label) {
    where.label = options.label;
  }

  if (options?.favoritesOnly) {
    where.isFavorite = true;
  }

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { address: { contains: options.search, mode: 'insensitive' } },
      { ensName: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  return prisma.addressBookEntry.findMany({
    where,
    orderBy: [
      { isFavorite: 'desc' },
      { name: 'asc' },
    ],
  });
}

/**
 * Get address book entry by address
 */
export async function getAddressBookEntry(
  authUserId: string,
  address: string
): Promise<AddressBookEntry | null> {
  return prisma.addressBookEntry.findUnique({
    where: {
      authUserId_address: {
        authUserId,
        address: address.toLowerCase(),
      },
    },
  });
}

/**
 * Update address book entry
 */
export async function updateAddressBookEntry(
  id: string,
  updates: Partial<Omit<AddressBookEntry, 'id' | 'authUserId' | 'address' | 'createdAt' | 'updatedAt'>>
): Promise<AddressBookEntry> {
  return prisma.addressBookEntry.update({
    where: { id },
    data: updates,
  });
}

/**
 * Delete address book entry
 */
export async function deleteAddressBookEntry(id: string): Promise<void> {
  await prisma.addressBookEntry.delete({
    where: { id },
  });
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string): Promise<AddressBookEntry> {
  const entry = await prisma.addressBookEntry.findUnique({ where: { id } });
  
  if (!entry) {
    throw new Error('Address book entry not found');
  }

  return prisma.addressBookEntry.update({
    where: { id },
    data: { isFavorite: !entry.isFavorite },
  });
}

/**
 * Get favorites
 */
export async function getFavorites(authUserId: string): Promise<AddressBookEntry[]> {
  return getAddressBook(authUserId, { favoritesOnly: true });
}

/**
 * Get entries by label
 */
export async function getEntriesByLabel(
  authUserId: string,
  label: string
): Promise<AddressBookEntry[]> {
  return getAddressBook(authUserId, { label });
}

/**
 * Search address book
 */
export async function searchAddressBook(
  authUserId: string,
  query: string
): Promise<AddressBookEntry[]> {
  return getAddressBook(authUserId, { search: query });
}

/**
 * Check if address exists in address book
 */
export async function isInAddressBook(
  authUserId: string,
  address: string
): Promise<boolean> {
  const entry = await getAddressBookEntry(authUserId, address);
  return entry !== null;
}

/**
 * Bulk import addresses
 */
export async function bulkImportAddresses(
  authUserId: string,
  entries: Omit<CreateAddressBookEntry, 'authUserId'>[]
): Promise<number> {
  const results = await Promise.allSettled(
    entries.map(entry => addToAddressBook({ ...entry, authUserId }))
  );

  return results.filter(r => r.status === 'fulfilled').length;
}

/**
 * Export address book to CSV
 */
export async function exportAddressBookToCSV(authUserId: string): Promise<string> {
  const entries = await getAddressBook(authUserId);

  const headers = ['Name', 'Address', 'ENS Name', 'Label', 'Note', 'Favorite'];
  const rows = entries.map(entry => [
    entry.name,
    entry.address,
    entry.ensName || '',
    entry.label || '',
    entry.note || '',
    entry.isFavorite ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
