const fs = require('fs');
const path = require('path');

const LOGO_DIR = path.join(__dirname, '../public/system-shots/logostoken');
const OUT_FILE = path.join(__dirname, '../lib/data/allowed-tokens.ts');

function generateTokenLogos() {
    if (!fs.existsSync(LOGO_DIR)) {
        console.error('Logo directory not found!');
        return;
    }

    const files = fs.readdirSync(LOGO_DIR);
    
    // The logo format seems to be {name}-{symbol}-logo.png or just {symbol}.png.
    // Let's create a robust mapping by parsing the filename.
    const logoMap = {};
    
    files.forEach(file => {
        if (!file.endsWith('.png') && !file.endsWith('.svg')) return;
        
        let symbol = null;
        let name = null;
        
        const baseName = file.replace('.png', '').replace('.svg', '');
        const parts = baseName.split('-');
        
        const logoIndex = parts.indexOf('logo');
        if (logoIndex > 0) {
            symbol = parts[logoIndex - 1];
            // The name is everything before the symbol
            name = parts.slice(0, logoIndex - 1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        } else {
            symbol = parts.length > 1 ? parts[parts.length - 1] : parts[0];
            name = parts.slice(0, parts.length - 1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || symbol;
        }
        
        if (symbol) {
            logoMap[symbol.toUpperCase()] = {
                path: `/system-shots/logostoken/${file}`,
                name: name
            };
        }
    });

    // Special hardcodes for known mismatches if needed, but the parser is much better now.
    
    // Generate TS content
    const content = `// AUTO-GENERATED. DO NOT EDIT MANUALLY.
// Maps token symbols to their validated local logo paths and exact names.
export const ALLOWED_TOKEN_LOGOS: Record<string, { path: string; name: string }> = ${JSON.stringify(logoMap, null, 4)};

export function getValidatedLogo(symbol: string): string | null {
    if (!symbol) return null;
    const data = ALLOWED_TOKEN_LOGOS[symbol.toUpperCase()];
    return data ? data.path : null;
}

export function isTokenAllowed(symbol: string): boolean {
    if (!symbol) return false;
    return !!ALLOWED_TOKEN_LOGOS[symbol.toUpperCase()];
}

export function getValidatedName(symbol: string): string | null {
    if (!symbol) return null;
    const data = ALLOWED_TOKEN_LOGOS[symbol.toUpperCase()];
    return data ? data.name : null;
}
`;

    fs.writeFileSync(OUT_FILE, content, 'utf8');
    console.log(`Generated allowed-tokens.ts with ${Object.keys(logoMap).length} tokens.`);
}

generateTokenLogos();
