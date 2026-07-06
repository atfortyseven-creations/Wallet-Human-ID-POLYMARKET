import fs from 'fs';
import path from 'path';

const aztecDir = 'node_modules/@aztec';
const packages = fs.readdirSync(aztecDir);

for (const pkg of packages) {
  const pkgJsonPath = path.join(aztecDir, pkg, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (pkgJson.exports) {
      console.log(`\n=== ${pkg} ===`);
      for (const [key, value] of Object.entries(pkgJson.exports)) {
        console.log(`  ${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
      }
    }
  }
}
