#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Checking latest @aztec SDK versions ==="
node -e "
fetch('https://registry.npmjs.org/@aztec/aztec.js')
  .then(r => r.json())
  .then(d => {
    const tags = d['dist-tags'];
    console.log('Tags:', JSON.stringify(tags, null, 2));
    // Get versions with alpha/beta/next
    const versions = Object.keys(d.versions).filter(v => v.includes('alpha') || v > '4.3.1').slice(-20);
    console.log('Recent versions:', versions.join(', '));
  })
  .catch(e => console.error('ERROR:', e.message));
"
