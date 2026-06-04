
// Simple IndexedDB wrapper

function openPersistenceDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WhaleQuantumPersistence', 1);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate a non-extractable AES-GCM key and save to IDB
async function getOrCreateHardwareKey(): Promise<CryptoKey> {
  const db = await openPersistenceDB();
  return new Promise(async (resolve, reject) => {
    try {
      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const getReq = store.get('master_hw_key');
      getReq.onsuccess = async () => {
        if (getReq.result) {
          resolve(getReq.result);
        } else {
          // Generate new
          const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false, // non-extractable!
            ['encrypt', 'decrypt']
          );
          const writeTx = db.transaction('keys', 'readwrite');
          const writeStore = writeTx.objectStore('keys');
          const putReq = writeStore.put(key, 'master_hw_key');
          putReq.onsuccess = () => resolve(key);
          putReq.onerror = () => reject(putReq.error);
        }
      };
      getReq.onerror = () => reject(getReq.error);
    } catch (err) {
      reject(err);
    }
  });
}

// Encrypt the user's password (or a session encryption key) using the hardware key
export async function sealSessionKey(sessionEncryptionKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const hwKey = await getOrCreateHardwareKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(sessionEncryptionKey);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      hwKey,
      encoded
    );
    
    // Store IV + Ciphertext in localStorage as Base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(combined)));
    localStorage.setItem('whale_hw_session_token', base64);
  } catch (error) {
    console.error('[Persistence] Failed to seal session', error);
  }
}

// Decrypt the session key on page load to auto-unlock the wallet
export async function unsealSessionKey(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const base64 = localStorage.getItem('whale_hw_session_token');
    if (!base64) return null;

    const binaryString = atob(base64);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const hwKey = await getOrCreateHardwareKey();
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      hwKey,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    // If decryption fails (e.g. IDB was cleared but localStorage wasn't), clear the broken token
    localStorage.removeItem('whale_hw_session_token');
    return null;
  }
}

export async function clearSessionKey() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('whale_hw_session_token');
    }
}
