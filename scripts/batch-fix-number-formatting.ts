/**
 * Batch fix script to update all remaining components with safe number formatting
 * Run this with: npx ts-node scripts/batch-fix-number-formatting.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const COMPONENTS_DIR = path.join(__dirname, '../components');
const HOOKS_DIR = path.join(__dirname, '../hooks');
const LIB_DIR = path.join(__dirname, '../lib');

// Patterns to replace
const REPLACEMENTS = [
  // toFixed patterns
  {
    pattern: /(\w+)\.toFixed\((\d+)\)/g,
    replacement: (match: string, varName: string, decimals: string) => {
      return `safeToFixed(${varName}, ${decimals})`;
    }
  },
  {
    pattern: /\(([^)]+)\)\.toFixed\((\d+)\)/g,
    replacement: (match: string, expr: string, decimals: string) => {
      return `safeToFixed((${expr}), ${decimals})`;
    }
  },
  // toLocaleString patterns  
  {
    pattern: /(\w+)\.toLocaleString\(\)/g,
    replacement: (match: string, varName: string) => {
      return `safeToLocaleString(${varName})`;
    }
  },
  {
    pattern: /(\w+)\.toLocaleString\((.*?)\)/g,
    replacement: (match: string, varName: string, args: string) => {
      // Handle undefined as first arg
      if (args.startsWith('undefined,')) {
        const options = args.substring('undefined,'.length).trim();
        return `safeToLocaleString(${varName}, ${options})`;
      }
      return `safeToLocaleString(${varName}, ${args})`;
    }
  }
];

const IMPORT_STATEMENT = `import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';`;

async function processFile(filePath: string): Promise<boolean> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Check if file uses toFixed or toLocaleString
  const needsUpdate = /\.toFixed\(|\.toLocaleString\(/.test(content);
  
  if (!needsUpdate) {
    return false;
  }

  // Check if already has import
  const hasImport = content.includes('safeToFixed') || content.includes('safeToLocaleString');
  
  if (hasImport) {
    console.log(`️  Skipping ${path.relative(process.cwd(), filePath)} (already updated)`);
    return false;
  }

  // Add import statement after the last import
  const importRegex = /^import .+ from ['"@].+['"];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    content = content.slice(0, insertPosition) + '\n' + IMPORT_STATEMENT + content.slice(insertPosition);
    modified = true;
  }

  // Apply replacements
  for (const { pattern, replacement } of REPLACEMENTS) {
    const newContent = content.replace(pattern, replacement as any);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(` Fixed ${path.relative(process.cwd(), filePath)}`);
    return true;
  }

  return false;
}

async function main() {
  console.log(' Batch fixing number formatting across codebase...\n');

  const patterns = [
    `${COMPONENTS_DIR}/**/*.tsx`,
    `${COMPONENTS_DIR}/**/*.ts`,
    `${HOOKS_DIR}/**/*.ts`,
    `${HOOKS_DIR}/**/*.tsx`,
    `${LIB_DIR}/**/*.ts`,
    `${LIB_DIR}/**/*.tsx`,
  ];

  let totalFixed = 0;
  let totalScanned = 0;

  for (const pattern of patterns) {
    const files = await glob(pattern, { 
      ignore: ['**/ node_modules/**', '**/dist/**', '**/.next/**'],
      absolute: true 
    });

    for (const file of files) {
      totalScanned++;
      const fixed = await processFile(file);
      if (fixed) {
        totalFixed++;
      }
    }
  }

  console.log(`\n Summary:`);
  console.log(`   Scanned: ${totalScanned} files`);
  console.log(`   Fixed: ${totalFixed} files`);
  console.log(`   Skipped: ${totalScanned - totalFixed} files`);
}

main().catch(console.error);
