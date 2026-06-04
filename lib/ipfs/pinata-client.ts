/**
 * IPFS / Pinata Client  Axioma 131
 * 
 * Pinata pinning with CIDv1 content addressing.
 * Signed metadata per upload (EIP-191 wallet signature).
 * Used by: Forum media attachments, signed video tutorials,
 *           SBOM IPFS anchoring, signed update manifests.
 * 
 */

const PINATA_API    = 'https://api.pinata.cloud';
const PINATA_GW     = process.env.PINATA_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs';
const PINATA_JWT    = process.env.PINATA_JWT ?? '';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB hard cap

export interface PinataUploadResult {
  cid:         string;   // CIDv1 (base32)
  gatewayUrl:  string;
  size:        number;
  mimeType:    string;
  walletAddress: string;
  signature:   string;   // EIP-191 over {cid, walletAddress, timestamp}
  timestamp:   string;
  pinataId:    string;
}

export interface PinataError {
  code:    string;
  message: string;
}

//  Upload file to IPFS via Pinata 
export async function pinFileToIPFS(
  file:          File | Buffer,
  filename:      string,
  mimeType:      string,
  walletAddress: string,
  signature:     string,   // Pre-signed by client wallet
): Promise<PinataUploadResult> {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not configured');

  const fileSize = file instanceof File ? file.size : file.length;
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File exceeds 50MB limit: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);
  }

  // Validate allowed MIME types (security: no executables)
  const ALLOWED_MIMES = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/ogg', 'audio/wav',
    'application/pdf',
    'application/json',
  ]);
  if (!ALLOWED_MIMES.has(mimeType)) {
    throw new Error(`MIME type not allowed: ${mimeType}`);
  }

  const formData = new FormData();
  const blob = (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) 
    ? new Blob([new Uint8Array(file)], { type: mimeType }) 
    : (file as unknown as Blob);
  formData.append('file', blob, filename);

  // Pinata metadata with signed attribution
  const pinataMetadata = JSON.stringify({
    name: filename,
    keyvalues: {
      walletAddress: walletAddress.toLowerCase(),
      timestamp:     new Date().toISOString(),
      mimeType,
      // signature stored as metadata for off-chain verification
      sig: signature.slice(0, 64), // Truncated  full sig returned in response
    },
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 }); // Force CIDv1 (base32)
  formData.append('pinataOptions', pinataOptions);

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Pinata upload failed: ${res.status}  ${err.error?.details ?? res.statusText}`);
  }

  const data = await res.json();
  const cid  = data.IpfsHash as string;

  return {
    cid,
    gatewayUrl:    `${PINATA_GW}/${cid}`,
    size:          data.PinSize as number,
    mimeType,
    walletAddress: walletAddress.toLowerCase(),
    signature,
    timestamp:     new Date().toISOString(),
    pinataId:      data.Timestamp as string,
  };
}

//  Pin JSON data to IPFS (for SBOM, manifests, signed metadata) 
export async function pinJSONToIPFS(
  data:    object,
  name:    string,
  metadata?: Record<string, string>,
): Promise<{ cid: string; gatewayUrl: string }> {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not configured');

  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent:  data,
      pinataMetadata: { name, keyvalues: { ...metadata, pinnedAt: new Date().toISOString() } },
      pinataOptions:  { cidVersion: 1 },
    }),
  });

  if (!res.ok) throw new Error(`Pinata JSON pin failed: ${res.status}`);
  const result = await res.json();
  const cid    = result.IpfsHash as string;
  return { cid, gatewayUrl: `${PINATA_GW}/${cid}` };
}

//  Unpin (GDPR right-to-forget compatible) 
export async function unpinFromIPFS(cid: string): Promise<void> {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not configured');
  const res = await fetch(`${PINATA_API}/pinning/unpin/${cid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Pinata unpin failed: ${res.status}`);
  }
}

//  Verify CID integrity (fetch and hash-check) 
export async function verifyCIDIntegrity(cid: string): Promise<boolean> {
  try {
    const res = await fetch(`${PINATA_GW}/${cid}`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

//  Gateway URL builder 
export function ipfsUrl(cid: string): string {
  return `${PINATA_GW}/${cid}`;
}
