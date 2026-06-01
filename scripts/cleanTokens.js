const fs = require('fs');
const file = 'c:/Users/admin/.gemini/antigravity/scratch/Wallet Human Polymarket ID/config/universal-tokens.ts';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('export const UNIVERSAL_TOKENS: UniversalToken[] = [') + 'export const UNIVERSAL_TOKENS: UniversalToken[] = '.length;
const endIdx = content.lastIndexOf('];');
const arrayStr = content.substring(startIdx, endIdx + 1);

try {
    const tokens = JSON.parse(arrayStr);
    const filtered = tokens.filter(t => t.address !== '0x0000000000000000000000000000000000000000');
    const newContent = content.substring(0, startIdx) + JSON.stringify(filtered, null, 4) + content.substring(endIdx + 1);
    fs.writeFileSync(file, newContent);
    console.log('Successfully cleaned mock tokens. Remaining: ' + filtered.length);
} catch (e) {
    console.error('Error parsing JSON:', e);
}
