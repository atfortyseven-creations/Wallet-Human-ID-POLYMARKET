import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const srcDir = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\a2f1d4fa-92f6-4bcc-ad1b-79dbec494d05';
  const destDir = path.join(process.cwd(), 'public', 'system-shots');
  
  try {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
      const copied = [];
      for (const file of files) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        copied.push(file);
      }

      return NextResponse.json({ success: true, copied, destDir });
  } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message });
  }
}
