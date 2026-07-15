import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const web3Address = req.headers.get('x-web3-address');
    const userId = session?.userId || web3Address;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB for system transmission.' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // [SECURITY — MED-02] Magic Bytes MIME Validation
    // Never trust client-provided file.type. Check actual file headers.
    const magic = new Uint8Array(buffer.slice(0, 12));
    const isPNG  = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47;
    const isJPEG = magic[0] === 0xFF && magic[1] === 0xD8 && magic[2] === 0xFF;
    const isGIF  = magic[0] === 0x47 && magic[1] === 0x49 && magic[2] === 0x46; // 'GIF'
    const isWebP = magic[8] === 0x57 && magic[9] === 0x45 && magic[10] === 0x42 && magic[11] === 0x50; // 'WEBP'
    
    // MP4 signature 'ftyp'
    const isMP4 = magic[4] === 0x66 && magic[5] === 0x74 && magic[6] === 0x79 && magic[7] === 0x70; 
    
    let safeMimeType = 'application/octet-stream';
    if (isPNG) safeMimeType = 'image/png';
    else if (isJPEG) safeMimeType = 'image/jpeg';
    else if (isGIF) safeMimeType = 'image/gif';
    else if (isWebP) safeMimeType = 'image/webp';
    else if (isMP4) safeMimeType = 'video/mp4';
    else {
      return NextResponse.json({ error: 'Unsupported file type. Only PNG, JPEG, GIF, WebP, and MP4 are allowed.' }, { status: 415 });
    }

    // Generate base64 data URL
    const base64Data = buffer.toString('base64');
    
    // Format required by WhaleChat message parser: __IMAGE__data:... or __VIDEO__data:...
    const dataUrl = `data:${safeMimeType};base64,${base64Data}`;
    
    const originalName = file.name || 'attachment';

    return NextResponse.json({
      url: dataUrl,
      name: originalName,
      type: safeMimeType,
      size: buffer.length
    });

  } catch (error: any) {
    console.error('[Upload] Error processing attachment:', error);
    return NextResponse.json({ error: 'Failed to process attachment' }, { status: 500 });
  }
}

// Removed GET method to completely eliminate filesystem dependencies
