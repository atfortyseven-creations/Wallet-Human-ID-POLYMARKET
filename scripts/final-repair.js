const fs = require('fs');
const path = require('path');
const {glob} = require('glob');

async function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Fix parseFloatsafeToFixed -> parseFloat(safeToFixed
    const pfPattern = /parseFloatsafeToFixed\(/g;
    if (pfPattern.test(content)) {
        content = content.replace(pfPattern, 'parseFloat(safeToFixed(');
        modified = true;
    }

    // 2. Fix toast.successsafeToFixed -> toast.success(safeToFixed
    const tsPattern = /toast\.successsafeToFixed\(/g;
    if (tsPattern.test(content)) {
        content = content.replace(tsPattern, 'toast.success(safeToFixed(');
        modified = true;
    }

    // 3. Fix map return wrapped in safeToFixed
    // pattern: .map((...) => safeToFixed((
    const mapSafePattern = /\.map\(([^)]+)\)\s*=>\s*safeToFixed\(\(/g;
    if (mapSafePattern.test(content)) {
        content = content.replace(mapSafePattern, '.map(($1) => (');
        modified = true;
    }

    // 4. Fix corrupted JSX expression {(expr), dec)}
    // pattern: {(block.size / 1000000), 2)}
    const corruptedJsx = /\{(\([^,]+?\)),\s*(\d+)\)\}/g;
    if (corruptedJsx.test(content)) {
        content = content.replace(corruptedJsx, '{safeToFixed($1, $2)}');
        modified = true;
    }

    // 5. Fix double parens in safeToFixed
    // pattern: safeToFixed(((expr)), dec)
    const doubleParen = /safeToFixed\(\(\(([\s\S]+?)\)\),\s*(\d+)\)/g;
    if (doubleParen.test(content)) {
        content = content.replace(doubleParen, 'safeToFixed($1, $2)');
        modified = true;
    }
    
    // Fix single extra paren: safeToFixed((expr), dec)
    const singleExtraParen = /safeToFixed\(\(([^,]+?)\),\s*(\d+)\)/g;
    if (singleExtraParen.test(content)) {
        content = content.replace(singleExtraParen, (match, expr, dec) => {
            // Only fix if it's actually wrapped in extra parens that don't belong to a function call
            if (expr.trim().startsWith('(') && expr.trim().endsWith(')')) {
                return `safeToFixed(${expr.trim().slice(1, -1)}, ${dec})`;
            }
            return `safeToFixed(${expr}, ${dec})`;
        });
        modified = true;
    }

    // 6. Fix method-like calls: block.safeToLocaleString(var) -> safeToLocaleString(block.extras?.var)
    // This is specific to LatestBlocks.tsx but might be in others.
    // Simplifying to: object.safeToLocaleString(tx_count) -> safeToLocaleString(something)
    if (content.includes('safeToLocaleString(tx_count)')) {
        content = content.replace(/block\.safeToLocaleString\(tx_count\)/g, 'safeToLocaleString(block.extras?.tx_count || 0)');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Repaired: ${path.relative(process.cwd(), filePath)}`);
    }
}

async function main() {
    const files = await glob('**/*.{ts,tsx}', { 
        ignore: ['node_modules/**', '.next/**', 'dist/**'],
        cwd: process.cwd(),
        absolute: true 
    });

    for (const file of files) {
        await fixFile(file);
    }
    console.log('Repair complete.');
}

main().catch(console.error);
