import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function findPXE() {
    const dir = path.join(__dirname, 'node_modules', '@aztec', 'pxe', 'dest', 'entrypoints');
    function walk(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) { 
                results = results.concat(walk(file));
            } else if (file.endsWith('.js')) {
                results.push(file);
            }
        });
        return results;
    }
    const files = walk(dir);
    for (const file of files) {
        try {
            const mod = await import('file://' + file);
            for (const key of Object.keys(mod)) {
                if (key.toLowerCase().includes('client') || key.toLowerCase().includes('schema')) {
                    console.log(`Found ${key} in ${file}`);
                }
            }
        } catch (e) {}
    }
}
findPXE();
