// Check @aztec/stdlib exports map
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'node_modules/@aztec/stdlib/package.json'), 'utf8'));
console.log('exports keys:', Object.keys(pkg.exports || {}).filter(k => k.toLowerCase().includes('pxe') || k.toLowerCase().includes('interface')));
