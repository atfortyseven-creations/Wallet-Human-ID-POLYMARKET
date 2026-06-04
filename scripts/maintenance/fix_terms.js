const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app/legal/terms/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// The file looks like:
// import DocLayout from '@/components/layout/DocLayout';
// 
// export default function TermsOfService() 
//                 {/* Generated Content Expansion */}
//                 <section>

if (content.includes('{/* Generated Content Expansion */}')) {
    content = content.replace('export default function TermsOfService() \n                {/* Generated Content Expansion */}', `export default function TermsOfService() {
    return (
        <DocLayout
            title="Terms of Service"
            description="Our Terms of Service"
            lastUpdated="May 25, 2026"
            category="Legal"
        >
            <div className="p-8 max-w-4xl mx-auto space-y-12">
                {/* Generated Content Expansion */}`);
    
    // Add the closing tags at the end
    content = content + '\n            </div>\n        </DocLayout>\n    );\n}\n';
    
    fs.writeFileSync(file, content);
    console.log('Fixed terms page structure!');
} else {
    console.log('Not found');
}
