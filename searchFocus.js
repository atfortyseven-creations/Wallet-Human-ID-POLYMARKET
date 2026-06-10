const fs = require('fs');
const content1 = fs.readFileSync('components/portfolio/AztecPXEVisualizer.tsx', 'utf8');
const content2 = fs.readFileSync('components/portfolio/AztecShieldingTerminal.tsx', 'utf8');
if(content1.match(/autoFocus/i)) console.log('autoFocus in PXE');
if(content2.match(/autoFocus/i)) console.log('autoFocus in ShieldingTerminal');
