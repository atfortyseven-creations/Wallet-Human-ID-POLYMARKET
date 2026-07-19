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
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(__dirname);
let found = 0;

files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    let codeStarted = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty, comments, and 'use client'/'use strict'
        if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === '"use client";' || line === "'use client';") {
            continue;
        }
        
        if (line.startsWith('import ')) {
            if (codeStarted) {
                console.log(`Misplaced import in ${file.replace(__dirname, '')} at line ${i + 1}: ${line}`);
                found++;
            }
        } else if (line.startsWith('export ') || line.startsWith('const ') || line.startsWith('let ') || line.startsWith('var ') || line.startsWith('function ') || line.startsWith('class ')) {
            codeStarted = true;
        }
    }
});

console.log(`Total misplaced imports found: ${found}`);
