import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Maximum attachment size: 3MB for forum documents
const MAX_SIZE_BYTES = 3 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
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

    // Convert file to buffer then Base64  immortal, zero filesystem dependency
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cryptographic hash for integrity verification
    const hash = createHash('sha256').update(buffer).digest('hex');

    // Detect MIME type precisely
    const mimeType = file.type || 'application/octet-stream';

    // Build a data URL  stored and served as inline data, survives all deploys
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,        // Immortal data URL  no disk reference needed
      hash,
      fileName: file.name,
      mimeType,
      sizeBytes: file.size,
    });

  } catch (error) {
    console.error('[Forum Upload] Error:', error);
    return NextResponse.json({ error: 'UPLOAD FAILED' }, { status: 500 });
  }
}
