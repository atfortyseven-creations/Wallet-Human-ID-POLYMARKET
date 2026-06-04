const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes("from '@prisma/client'") && content.includes("PrismaClient")) {
        content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"];?/g, "import { prisma } from '@/lib/prisma';");
        content = content.replace(/const\s+prisma\s*=\s*new\s*PrismaClient\(\);?/g, "");
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '..', 'app', 'api'));
