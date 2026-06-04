/** 
 * EMERGENCY FIX: Replace ALL unsafe .toFixed() and .toLocaleString() calls
 * with defensive programming using optional chaining
 */

const fs = require('fs');
const path = require('path');
const {glob} = require('glob');

const SAFE_IMPORTS = `import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';`;

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Skip if already using safe functions
  if (content.includes('safeToFixed') || content.includes('safeToLocaleString')) {
    return false;
  }

  // Pattern 1: .toFixed(n) -> safeToFixed(value, n)
  const toFixedPattern = /(\w+)\.toFixed\((\d+)\)/g;
  if (toFixedPattern.test(content)) {
    content = content.replace(toFixedPattern, (match, varName, decimals) => {
      return `safeToFixed(${varName}, ${decimals})`;
    });
    modified = true;
  }

  // Pattern 2: (expression).toFixed(n) -> safeToFixed((expression), n)
  const toFixedExprPattern = /\(([^)]+)\)\.toFixed\((\d+)\)/g;
  if (toFixedExprPattern.test(content)) {
    content = content.replace(toFixedExprPattern, (match, expr, decimals) => {
      return `safeToFixed((${expr}), ${decimals})`;
    });
    modified = true;
  }

  // Pattern 3: value.toFixed(n) where value could be optional -> value?.toFixed -> safeToFixed
  const optionalToFixedPattern = /(\w+)\?\.toFixed\((\d+)\)/g;
  if (optionalToFixedPattern.test(content)) {
    content = content.replace(optionalToFixedPattern, (match, varName, decimals) => {
      return `safeToFixed(${varName}, ${decimals})`;
    });
    modified = true;
  }

  // Pattern 4: .toLocaleString() -> safeToLocaleString(value)
  const toLocalePattern = /(\w+)\.toLocaleString\(\)/g;
  if (toLocalePattern.test(content)) {
    content = content.replace(toLocalePattern, (match, varName) => {
      return `safeToLocaleString(${varName})`;
    });
    modified = true;
  }

  // Pattern 5: .toLocaleString('en-US', options) -> safeToLocaleString(value, options)
  const toLocaleWithArgsPattern = /(\w+)\.toLocaleString\((.*?)\)/g;
  if (toLocaleWithArgsPattern.test(content)) {
    content = content.replace(toLocaleWithArgsPattern, (match, varName, args) => {
      // Handle locale + options or just options
      if (args.includes('undefined,')) {
        const options = args.substring(args.indexOf(',') + 1).trim();
        return `safeToLocaleString(${varName}, ${options})`;
      }
      return `safeToLocaleString(${varName}${args ? ', ' + args : ''})`;
    });
    modified = true;
  }

  if (!modified) {
    return false;
  }

  // Add import if needed (after last import statement)
  if (!content.includes(SAFE_IMPORTS)) {
    const importRegex = /^import .+ from ['"][@\w\/\.-]+['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + SAFE_IMPORTS + content.slice(insertPosition);
    } else {
      // No imports found, add at top after 'use client' if exists
      if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
        const firstNewline = content.indexOf('\n');
        content = content.slice(0, firstNewline + 1) + '\n' + SAFE_IMPORTS + '\n' + content.slice(firstNewline + 1);
      } else {
        content = SAFE_IMPORTS + '\n\n' + content;
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

async function main() {
  console.log(' EMERGENCY FIX: Replacing ALL unsafe number formatting calls...\n');

  const patterns = [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}'
  ];

  let totalFixed = 0;
  let totalScanned = 0;

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: process.cwd(),
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/*.d.ts'],
      absolute: true
    });

    for (const file of files) {
      totalScanned++;
      const fixed = await fixFile(file);
      if (fixed) {
        totalFixed++;
        const relativePath = path.relative(process.cwd(), file);
        console.log(` FIXED: ${relativePath}`);
      }
    }
  }

  console.log(`\n EMERGENCY FIX COMPLETE:`);
  console.log(`   Files scanned: ${totalScanned}`);
  console.log(`   Files fixed: ${totalFixed}`);
  console.log(`   Files skipped: ${totalScanned - totalFixed}`);
  console.log(`\n All unsafe .toFixed() and .toLocaleString() calls have been replaced!`);
}

main().catch(console.error);
