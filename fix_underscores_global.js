const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    // exclude node_modules, .next, .git
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

const rootDir = __dirname;
let changed = 0;

const files = walk(rootDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // The previous regexes:
    content = content.replace(/\(\_\, /g, '(_idx, ');
    content = content.replace(/\(\_\,/g, '(_idx,');
    content = content.replace(/\(\_\) =>/g, '(_idx) =>');
    content = content.replace(/catch \(\_\)/g, 'catch (_err)');
    
    // Let's also catch things like:
    // `function(_, `
    // `function(_,`
    // `(_, `
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log('Fixed:', file);
    }
});

console.log('Total additional files fixed:', changed);
