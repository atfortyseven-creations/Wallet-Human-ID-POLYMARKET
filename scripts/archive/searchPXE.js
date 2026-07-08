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
        } else if (file.endsWith('.d.ts') || file.endsWith('.js')) {
            try {
                if (fs.readFileSync(file, 'utf8').includes('createPXEClient')) {
                    results.push(file);
                }
            } catch (e) {}
        }
    });
    return results;
}
console.log(walk(path.join(__dirname, 'node_modules', '@aztec')));
