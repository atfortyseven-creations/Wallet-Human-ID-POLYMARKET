const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./components').concat(walk('./app'));
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('<Shield') || content.includes('Shield ')) {
        const hasLucide = content.includes('lucide-react');
        const hasImport = content.includes('Shield');
        if (!hasLucide) {
            console.log("Missing lucide-react import completely: ", f);
        } else {
            // Check if Shield is inside the lucide-react import
            const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
            if (importMatch) {
                const importedItems = importMatch[1].split(',').map(s => s.trim());
                if (!importedItems.includes('Shield')) {
                    console.log("Missing Shield in lucide-react import: ", f);
                }
            } else {
                console.log("Has lucide-react but couldn't parse import: ", f);
            }
        }
    }
});
