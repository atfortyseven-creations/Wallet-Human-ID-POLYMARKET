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
let fixed = 0;

files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    let codeStarted = false;
    let hasMisplacedImports = false;
    let importLines = [];
    let otherLines = [];
    let directives = []; // e.g. "use client"
    
    // First pass: detect if there are misplaced imports
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
            continue;
        }
        if (line === '"use client";' || line === "'use client';") {
            continue;
        }
        if (line.startsWith('import ')) {
            if (codeStarted) {
                hasMisplacedImports = true;
                break;
            }
        } else if (line.startsWith('export ') || line.startsWith('const ') || line.startsWith('let ') || line.startsWith('var ') || line.startsWith('function ') || line.startsWith('class ')) {
            codeStarted = true;
        }
    }
    
    if (hasMisplacedImports) {
        let insideImport = false;
        let currentImportBuffer = [];
        
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            
            if (line === '"use client";' || line === "'use client';") {
                directives.push(rawLine);
                continue;
            }
            
            // Handle multiline imports
            if (insideImport) {
                currentImportBuffer.push(rawLine);
                if (line.includes(';') || line.endsWith('} from') || line.includes('from "') || line.includes("from '")) {
                    insideImport = false;
                    importLines.push(...currentImportBuffer);
                    currentImportBuffer = [];
                }
                continue;
            }
            
            if (line.startsWith('import ')) {
                currentImportBuffer.push(rawLine);
                if (!line.includes(';') && !line.includes('from "') && !line.includes("from '")) {
                    insideImport = true;
                } else {
                    importLines.push(...currentImportBuffer);
                    currentImportBuffer = [];
                }
            } else {
                otherLines.push(rawLine);
            }
        }
        
        const newContent = [...directives, ...importLines, ...otherLines].join('\n');
        fs.writeFileSync(file, newContent);
        fixed++;
        console.log(`Fixed imports in: ${file.replace(__dirname, '')}`);
    }
});

console.log(`Total files fixed: ${fixed}`);
