const fs = require('fs');
const path = require('path');

const UNIVERSAL_FILE = path.join(__dirname, '../config/universal-tokens.ts');
const LOGOS_FILE = path.join(__dirname, '../lib/data/allowed-tokens.ts');

function run() {
    // Read the ALLOWED_TOKEN_LOGOS mapping
    const logosContent = fs.readFileSync(LOGOS_FILE, 'utf8');
    const logosMatch = logosContent.match(/export const ALLOWED_TOKEN_LOGOS: Record<string, { path: string; name: string }> = ({[\s\S]*?});/);
    if (!logosMatch) return console.error('Could not find ALLOWED_TOKEN_LOGOS');
    
    const logoMap = JSON.parse(logosMatch[1]);
    
    // Read UNIVERSAL_TOKENS
    const univContent = fs.readFileSync(UNIVERSAL_FILE, 'utf8');
    const univMatch = univContent.match(/export const UNIVERSAL_TOKENS: UniversalToken\[\] = (\[[\s\S]*?\]);/);
    if (!univMatch) return console.error('Could not find UNIVERSAL_TOKENS');
    
    const allTokens = eval(univMatch[1]);
    
    // Filter
    const filteredTokens = allTokens.filter(t => !!logoMap[t.symbol.toUpperCase()]);
    
    // Update logoPaths for existing ones to the verified paths, and names!
    const finalTokens = filteredTokens.map(t => {
        const logoData = logoMap[t.symbol.toUpperCase()];
        return {
            ...t,
            name: logoData.name || t.name,
            logoPath: logoData.path
        };
    });

    const newContent = `// SYSTEM GENERATED - ALL VALIDATED TOKENS WITH LOGOS
export interface UniversalToken {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoPath: string;
}

export const UNIVERSAL_TOKENS: UniversalToken[] = ${JSON.stringify(finalTokens, null, 4)};
`;

    fs.writeFileSync(UNIVERSAL_FILE, newContent, 'utf8');
    console.log(`Filtered universal tokens from ${allTokens.length} to ${finalTokens.length}.`);
}

run();
