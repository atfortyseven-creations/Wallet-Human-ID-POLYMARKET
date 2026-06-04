import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
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

    // Generate base64 data URL
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = buffer.toString('base64');
    
    // Format required by WhaleChat message parser: __IMAGE__data:... or __VIDEO__data:...
    // Using standard data URL, client can determine type
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    const originalName = file.name || 'attachment';

    return NextResponse.json({
      url: dataUrl,
      name: originalName,
      type: mimeType,
      size: buffer.length
    });

  } catch (error: any) {
    console.error('[Upload] Error processing attachment:', error);
    return NextResponse.json({ error: 'Failed to process attachment' }, { status: 500 });
  }
}

// Removed GET method to completely eliminate filesystem dependencies
