const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.d.ts')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.toLowerCase().includes('pxeclient')) {
                results.push(file);
            }
        }
    });
    return results;
}
console.log(walk(path.join(__dirname, 'node_modules', '@aztec')));
