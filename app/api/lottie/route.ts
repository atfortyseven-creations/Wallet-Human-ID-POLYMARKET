import { NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Lottie file server  resolves files from multiple locations in priority order:
 *
 *  1. public/            files placed directly in /public (current user setup)
 *  2. public/lotties/    subfolder inside public
 *  3. lotties/           project-root subfolder
 *  4. C:\Users\admin\Desktop\lottifile\   original dev desktop path
 *  5. C:\Users\admin\Downloads\           common Windows download location
 *  6. C:\Users\admin\Documents\           common Windows documents
 *
 * IMPORTANT: Next.js serves every file inside /public as a static asset at the
 * root URL path. That means /public/Ball playing.json is available at
 * fetch('/Ball%20playing.json'). The OptimizedLocalLottie component already
 * tries this static path first; this API route is the fallback.
 */

// Windows: must use 'C:\\' (not 'C:') so path.join produces absolute paths.
// path.join('C:', 'Users')  'C:Users' (relative  WRONG)
// path.join('C:\\', 'Users')  'C:\Users' (absolute  correct)
const WIN_DRIVE = 'C:\\';

const SEARCH_DIRS: string[] = [
  // 1. public root  files dropped directly here
  join(process.cwd(), 'public'),
  // 2. public/lotties subfolder
  join(process.cwd(), 'public', 'lotties'),
  // 3. project root /lotties
  join(process.cwd(), 'lotties'),
  // 4. Desktop root  user reported files are here
  join(WIN_DRIVE, 'Users', 'admin', 'Desktop'),
  // 5. Desktop/lottifile subfolder  original path
  join(WIN_DRIVE, 'Users', 'admin', 'Desktop', 'lottifile'),
  // 6. Downloads
  join(WIN_DRIVE, 'Users', 'admin', 'Downloads'),
  // 7. Documents
  join(WIN_DRIVE, 'Users', 'admin', 'Documents'),
];

function resolveLottiePath(safeFilename: string): string | null {
  for (const dir of SEARCH_DIRS) {
    const candidate = join(dir, safeFilename);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function listAllLottieFiles() {
  const found = new Map<string, number>();
  for (const dir of SEARCH_DIRS) {
    try {
      if (!existsSync(dir)) continue;
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.json')) continue;
        if (
          entry.name === 'manifest.json' ||
          entry.name === 'package.json' ||
          entry.name === 'tsconfig.json' ||
          entry.name === 'sample-system-signal.json'
        ) continue;
        
        const stats = statSync(join(dir, entry.name));
        found.set(entry.name, stats.mtimeMs);
      }
    } catch {
      // Directory not accessible  skip silently
    }
  }
  return Array.from(found.entries()).map(([name, mtime]) => ({ name, mtime })).sort((a, b) => b.mtime - a.mtime);
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    // Special endpoint: list all available lottie files for debugging
    if (filename === '__list__') {
      const files = listAllLottieFiles();
      return NextResponse.json({
        files: files.map(f => f.name),
        searchDirs: SEARCH_DIRS,
        count: files.length,
      });
    }

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Sanitize: strip any directory traversal, keep only the basename
    const safeFilename = filename.replace(/\\/g, '/').split('/').pop() || '';
    if (!safeFilename.endsWith('.json')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = resolveLottiePath(safeFilename);

    if (!filePath) {
      console.error('[LOTTIE API] File not found:', safeFilename);
      console.error('[LOTTIE API] Searched in:', SEARCH_DIRS.join(', '));
      return NextResponse.json(
        { error: 'File not found', file: safeFilename },
        { status: 404 }
      );
    }

    const data = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[LOTTIE API] Error:', error);
    return NextResponse.json({ error: 'Failed to process Lottie file' }, { status: 500 });
  }
}
