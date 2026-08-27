// lib/wallet/localAddressBook.ts
// Sovereign Local Address Book - 100% Client Side, Zero-Knowledge

export interface LocalContact {
  id: string;
  peerAddress: string;
  name: string;
  avatar?: string;
  createdAt: number;
}

const getStorageKey = (walletAddress: string) => `ledger_contacts_${walletAddress.toLowerCase()}`;

export const getLocalContacts = (walletAddress: string): LocalContact[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(walletAddress));
    if (!raw) return [];
    return JSON.parse(raw) as LocalContact[];
  } catch (e) {
    console.error("Failed to parse local contacts", e);
    return [];
  }
};

export const saveLocalContact = (walletAddress: string, contact: Omit<LocalContact, 'id' | 'createdAt'>): LocalContact => {
  const contacts = getLocalContacts(walletAddress);
  const existingIndex = contacts.findIndex(c => c.peerAddress.toLowerCase() === contact.peerAddress.toLowerCase());
  
  const newContact: LocalContact = {
    id: existingIndex >= 0 ? contacts[existingIndex].id : crypto.randomUUID(),
    peerAddress: contact.peerAddress.toLowerCase(),
    name: contact.name,
    avatar: contact.avatar,
    createdAt: existingIndex >= 0 ? contacts[existingIndex].createdAt : Date.now(),
  };

  if (existingIndex >= 0) {
    contacts[existingIndex] = newContact;
  } else {
    contacts.push(newContact);
  }

  localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(contacts));
  
  // Dispatch a custom event so the UI can update instantly across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ledger_contacts_updated', { detail: { walletAddress, contacts } }));
  }
  
  return newContact;
};

export const resolveContactName = (walletAddress: string, peerAddress: string): string | null => {
  if (!peerAddress) return null;
  const contacts = getLocalContacts(walletAddress);
  const found = contacts.find(c => c.peerAddress.toLowerCase() === peerAddress.toLowerCase());
  return found ? found.name : null;
};

export const deleteLocalContact = (walletAddress: string, peerAddress: string): void => {
  const contacts = getLocalContacts(walletAddress);
  const filtered = contacts.filter(c => c.peerAddress.toLowerCase() !== peerAddress.toLowerCase());
  localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ledger_contacts_updated', { detail: { walletAddress, contacts: filtered } }));
  }
};
