const fs = require('fs');
const path = require('path');
const {glob} = require('glob');

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let modified = false;

  // Fix 1: Math.abssafeToFixed((args), dec) -> safeToFixed(Math.abs(args), dec)
  // Example: Math.abssafeToFixed((size), 4)
  const absPattern = /Math\.abssafeToFixed\(\(([\s\S]+?)\),\s*(\d+)\)/g;
  if (absPattern.test(content)) {
    content = content.replace(absPattern, (match, args, dec) => {
        // args might have extra parens from previous script
        return `safeToFixed(Math.abs(${args}), ${dec})`;
    });
    modified = true;
  }

  // Fix 2: parseFloatsafeToFixed(((args), dec)) -> parseFloat(safeToFixed(args, dec))
  // Example: parseFloatsafeToFixed(((rsi || 0), 2))
  const parseFloatPattern = /parseFloatsafeToFixed\(\(\(([\s\S]+?)\),\s*(\d+)\)\)/g;
  if (parseFloatPattern.test(content)) {
    content = content.replace(parseFloatPattern, (match, args, dec) => {
        return `parseFloat(safeToFixed(${args}, ${dec}))`;
    });
    modified = true;
  }
  
  // Fix 2b: parseFloatsafeToFixed without double parens
  const parseFloatPattern2 = /parseFloatsafeToFixed\(\(([\s\S]+?)\),\s*(\d+)\)/g;
  if (parseFloatPattern2.test(content)) {
    content = content.replace(parseFloatPattern2, (match, args, dec) => {
         return `parseFloat(safeToFixed(${args}, ${dec}))`;
    });
    modified = true;
  }

  // Fix 3: mapsafeToFixed
  // pattern: .mapsafeToFixed((arg => 
  // Likely original: .map(arg => ... .toFixed(...))
  // We'll try to guess: .map(arg => safeToFixed(...))
  const mapPattern = /\.mapsafeToFixed\(\(/g;
  if (mapPattern.test(content)) {
    content = content.replace(mapPattern, '.map(');
    modified = true;
  }

  // Fix 4: safeToFixed((args), dec) -> double parens
  // Example: safeToFixed((price), 2) -> safeToFixed(price, 2)
  const doubleParenPattern = /safeToFixed\(\(([^,]+?)\),\s*(\d+)\)/g;
  if (doubleParenPattern.test(content)) {
      content = content.replace(doubleParenPattern, (match, args, dec) => {
          return `safeToFixed(${args.trim()}, ${dec})`;
      });
      modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

async function main() {
    console.log('Running repair script...');
    const files = await glob('**/*.{ts,tsx}', { 
        ignore: ['node_modules/**', '.next/**', 'dist/**'],
        cwd: process.cwd(),
        absolute: true 
    });

    for (const file of files) {
        await fixFile(file);
    }
    console.log('Done.');
}

main();
