import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSession } from '@/lib/session';

// Maximum attachment size: 3MB for forum documents
const MAX_SIZE_BYTES = 3 * 1024 * 1024;

// [SECURITY] Allowlist of permitted MIME types for forum attachments.
// SVG and HTML are EXPLICITLY BLOCKED — they execute JavaScript in browsers.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
]);

// [SECURITY] Magic byte signatures for server-side MIME verification.
// Client-supplied file.type is UNTRUSTED and trivially spoofed.
const MAGIC_BYTES: Array<{ magic: Buffer; mime: string }> = [
  { magic: Buffer.from([0xFF, 0xD8, 0xFF]),             mime: 'image/jpeg' },
  { magic: Buffer.from([0x89, 0x50, 0x4E, 0x47]),      mime: 'image/png'  },
  { magic: Buffer.from([0x47, 0x49, 0x46]),             mime: 'image/gif'  },
  { magic: Buffer.from([0x52, 0x49, 0x46, 0x46]),       mime: 'image/webp' }, // RIFF header
  { magic: Buffer.from([0x25, 0x50, 0x44, 0x46]),       mime: 'application/pdf' },
];

function detectMime(buf: Buffer): string | null {
  for (const { magic, mime } of MAGIC_BYTES) {
    if (buf.slice(0, magic.length).equals(magic)) return mime;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // [SECURITY HARDENING] Require authentication before accepting any file upload.
    // Previously fully unauthenticated — anyone could spam the server with files.
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required to upload files.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'NO SECURE DOCUMENT PROVIDED' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE_BYTES / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // [SECURITY] Detect MIME from magic bytes — never trust client-reported type.
    // This prevents SVG/HTML upload disguised as image/png (stored XSS vector).
    const detectedMime = detectMime(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return NextResponse.json(
        { error: 'File type not permitted. Allowed: JPEG, PNG, GIF, WebP, PDF.' },
        { status: 415 }
      );
    }

    // Cryptographic hash for integrity verification
    const hash = createHash('sha256').update(buffer).digest('hex');

    // Build a data URL using the SERVER-VERIFIED mime type, not the client-supplied one
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${detectedMime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      hash,
      fileName: file.name,
      mimeType: detectedMime,
      sizeBytes: file.size,
    });

  } catch (error) {
    console.error('[Forum Upload] Error:', error);
    return NextResponse.json({ error: 'UPLOAD FAILED' }, { status: 500 });
  }
}
