import fs from 'fs';
import path from 'path';

const dir = 'node_modules/@aztec/aztec.js/dest/contract/protocol_contracts';

const files = [
  'contract-instance-registry.js',
  'multi-call-entrypoint.js',
  'gas-token.js',
  'auth-registry.js',
  'fee-juice.js' // just in case
];

for (const file of files) {
  fs.writeFileSync(path.join(dir, file), 'export const ' + file.replace(/-/g, '').replace('.js', '') + ' = { at: () => ({ methods: {} }) };\n');
  console.log('Created', file);
}
