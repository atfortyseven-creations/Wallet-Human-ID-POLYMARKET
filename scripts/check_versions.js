const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dep = Object.assign({}, pkg.dependencies, pkg.devDependencies);
const keys = ['next','next-auth','vitest','axios','@auth/core','@auth/prisma-adapter','ethers','@flashbots/ethers-provider-bundle'];
keys.forEach(k => console.log(k + ':', dep[k] || 'NOT_FOUND'));
