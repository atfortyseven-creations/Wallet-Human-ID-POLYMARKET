import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchDirectory(fullPath);
        } else if (fullPath.endsWith('.d.ts') || fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('PXEClient')) {
                console.log(`FOUND PXEClient in ${fullPath}`);
            }
            if (content.includes('createPXE')) {
                console.log(`FOUND createPXE in ${fullPath}`);
            }
        }
    }
}

searchDirectory('./node_modules/@aztec');
