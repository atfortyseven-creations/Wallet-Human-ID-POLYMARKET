import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const content = fs.readFileSync(path.join(__dirname, 'node_modules/@aztec/stdlib/dest/interfaces/client.js'), 'utf8');
console.log('client.js exports:', content.match(/export const \w+/g));
