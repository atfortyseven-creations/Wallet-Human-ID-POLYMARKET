const fs = require('fs');
const path = require('path');

const pages = ['terms', 'privacy', 'security', 'compliance'];

pages.forEach(p => {
    const file = path.join(__dirname, 'app/legal', p, 'page.tsx');
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Let's just forcefully replace the entire file with a valid React component structure if it's broken
        if (!content.includes('return (')) {
            // Find everything after the import statements
            const importEndIndex = content.lastIndexOf('import ');
            const firstExportIndex = content.indexOf('export default function');
            
            if (firstExportIndex > -1) {
                const parts = content.split('export default function');
                const imports = parts[0];
                let body = parts[1];
                // remove the function signature up to { or just first line
                body = body.replace(/^[^{]*{/, '');
                
                content = imports + '\nexport default function LegalPage() {\n  return (\n    <DocLayout>\n      <div className="p-8 max-w-4xl mx-auto">\n        ' + body + '\n      </div>\n    </DocLayout>\n  );\n}';
                fs.writeFileSync(file, content);
                console.log('Fixed', file);
            }
        }
    }
});
