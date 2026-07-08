const fs = require('fs');
const path = require('path');

function search(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Neither apiKey nor config.authenticator provided')) {
                console.log('FOUND IN:', fullPath);
            }
        }
    }
}

search('node_modules');
