const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirs = [
    path.join(__dirname, 'components'),
    path.join(__dirname, 'app'),
    path.join(__dirname, 'hooks'),
    path.join(__dirname, 'context')
];

let changed = 0;

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = walk(dir);
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        const original = content;
        
        // Match `(_, ` or `(_,` but ONLY as a parameter in a callback.
        // E.g. `(_, i)` -> `(_idx, i)`
        // `(_, reject)` -> `(_idx, reject)`
        // `(_, dt)` -> `(_idx, dt)`
        content = content.replace(/\(\_\, /g, '(_idx, ');
        content = content.replace(/\(\_\,/g, '(_idx,');
        content = content.replace(/\(\_\) =>/g, '(_idx) =>');
        content = content.replace(/catch \(\_\)/g, 'catch (_err)');
        
        if (content !== original) {
            fs.writeFileSync(file, content);
            changed++;
            console.log('Fixed:', file);
        }
    });
});

console.log('Total fixed:', changed);
