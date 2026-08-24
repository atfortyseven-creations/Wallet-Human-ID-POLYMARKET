const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const pkgs = lock.packages;
const keys = [
  'node_modules/next',
  'node_modules/next-auth',
  'node_modules/vitest',
  'node_modules/@auth/prisma-adapter',
  'node_modules/@auth/core',
  'node_modules/axios'
];
keys.forEach(k => {
  const p = pkgs[k];
  console.log(k.replace('node_modules/', '') + ': installed=' + (p ? p.version : 'NOT_FOUND'));
});
