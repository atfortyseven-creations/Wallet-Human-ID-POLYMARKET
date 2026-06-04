const fs = require('fs');
['app/legal/terms/page.tsx', 'app/legal/privacy/page.tsx', 'app/legal/security/page.tsx', 'app/legal/compliance/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<p><\/p>/g, '');
    content = content.replace(/<\/p><p><\/p>/g, '</p>');
    // Also fix any stray <p> tags at the end of sections
    content = content.replace(/<p>\s*$/g, '');
    content = content.replace(/<p>\s*<\/div>/g, '</div>');
    content = content.replace(/<p>\s*<\/section>/g, '</section>');
    fs.writeFileSync(file, content);
});
console.log('Fixed pages');
