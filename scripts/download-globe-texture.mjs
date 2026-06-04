/**
 * scripts/download-globe-texture.mjs
 * 
 * One-time setup: downloads earth-water.png into /public/textures/
 * so the SystemGlobe3D can use it locally (zero CDN dependency).
 *
 * Run once: node scripts/download-globe-texture.mjs
 * 
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const outputDir  = join(__dirname, '..', 'public', 'textures');
const outputPath = join(outputDir, 'earth-water.png');
const SOURCE_URL = 'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-water.png';

if (existsSync(outputPath)) {
  console.log('  earth-water.png already exists  skipping download.');
  process.exit(0);
}

mkdirSync(outputDir, { recursive: true });

console.log('⬇️   Downloading earth-water.png...');

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`HTTP ${res.status}  ${SOURCE_URL}`);

await pipeline(res.body, createWriteStream(outputPath));

console.log(`  Saved to: ${outputPath}`);
console.log('   The SystemGlobe3D will now serve the texture locally.');
