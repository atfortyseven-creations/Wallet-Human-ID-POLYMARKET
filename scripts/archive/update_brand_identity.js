const fs = require('fs');
const path = require('path');

const directories = ['app', 'components', 'lib'];
const extensions = ['.tsx', '.ts', '.js', '.md'];

const replacements = [
    { search: /Whale Alert Network/g, replace: 'Whale Network' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            const ext = path.extname(fullPath);
            if (extensions.includes(ext)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;
                
                for (const r of replacements) {
                    if (r.search.test(content)) {
                        content = content.replace(r.search, r.replace);
                        modified = true;
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log('Updated:', fullPath);
                }
            }
        }
    }
}

directories.forEach(dir => {
    const fullDirPath = path.join(__dirname, dir);
    if (fs.existsSync(fullDirPath)) {
        processDirectory(fullDirPath);
    }
});
console.log('Whale Alert Network replaced with Whale Network successfully.');
