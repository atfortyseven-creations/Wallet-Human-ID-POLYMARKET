/**
 * Fails if banned marketing jargon appears in user-facing app/components sources.
 * Run: node scripts/check-forbidden-copy.mjs
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

function walkTsx(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.next') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      walkTsx(p, out);
    } else if (ent.isFile() && p.endsWith('.tsx')) {
      out.push(p);
    }
  }
  return out;
}

const dirs = [join(root, 'components'), join(root, 'app')].filter((d) => {
  try {
    return statSync(d).isDirectory();
  } catch {
    return false;
  }
});

const files = dirs.flatMap((d) => walkTsx(d, []));

const PATTERNS = [
  { re: /System Node/gi, name: 'System Node' },
  { re: /Intelligence Matrix/gi, name: 'Intelligence Matrix' },
  { re: /SOVEREIGN SIGNAL/g, name: 'SOVEREIGN SIGNAL' },
  { re: /SOVEREIGN VAULT/g, name: 'SOVEREIGN VAULT' },
  { re: /SOVEREIGN COMMAND/g, name: 'SOVEREIGN COMMAND' },
  { re: /SOVEREIGN MESH/g, name: 'SOVEREIGN MESH' },
  { re: /SOVEREIGN NOTIFICATION/g, name: 'SOVEREIGN NOTIFICATION' },
  { re: /VERIFIED_SOVEREIGN/g, name: 'VERIFIED_SOVEREIGN' },
  { re: /Verification rejected by System Node/gi, name: 'Verification rejected by System Node' },
];

const hits = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const { re, name } of PATTERNS) {
    re.lastIndex = 0;
    if (re.test(text)) {
      hits.push(`${file}: contains "${name}"`);
    }
  }
}

if (hits.length) {
  console.error('[check-forbidden-copy] Banned jargon found:\n');
  hits.forEach((h) => console.error('  ', h));
  process.exit(1);
}

console.log('[check-forbidden-copy] OK —', files.length, 'files scanned');
