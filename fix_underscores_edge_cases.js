const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return results;
    
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

let changed = 0;
const files = walk(__dirname);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Destructuring in array: [_, item]
    content = content.replace(/\[\_,/g, '[_idx,');
    content = content.replace(/\[\_\, /g, '[_idx, ');
    
    // Single arg arrow func: _ =>
    content = content.replace(/ \_ \=\>/g, ' _idx =>');
    content = content.replace(/^\_ \=\>/g, '_idx =>');
    content = content.replace(/\(\_\) \=\>/g, '(_idx) =>');
    
    // catch block
    content = content.replace(/catch\(\_\)/g, 'catch(_err)');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log('Fixed:', file);
    }
});

console.log('Total edge cases fixed:', changed);
