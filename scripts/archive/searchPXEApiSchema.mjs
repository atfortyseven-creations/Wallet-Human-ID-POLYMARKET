// Look for PXEApiSchema in the pxe package entrypoints
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Search all .js files in pxe/dest for 'ApiSchema'
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.d.ts')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('ApiSchema')) {
                results.push({ file, lines: content.split('\n').filter(l => l.includes('ApiSchema')).slice(0, 5) });
            }
        }
    });
    return results;
}

const hits = walk(path.join(__dirname, 'node_modules', '@aztec', 'pxe', 'dest'));
for (const hit of hits) {
    console.log('\n' + hit.file);
    hit.lines.forEach(l => console.log('  ', l));
}
