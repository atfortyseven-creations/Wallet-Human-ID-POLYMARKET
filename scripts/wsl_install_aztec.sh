#!/bin/sh
# Step 1: Install aztec using FULL PATH to nvm node/npm
# No nvm sourcing needed - just use absolute paths

NVM_NODE="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin/node"
NVM_NPM="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin/npm"

echo "Testing node: $($NVM_NODE --version)"
echo "Testing npm: $($NVM_NPM --version)"

echo "Installing @aztec/aztec@4.3.1..."
# npm needs node on PATH to run postinstall scripts
PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH" \
  $NVM_NPM install -g @aztec/aztec@4.3.1 2>&1

echo ""
echo "Done. Checking aztec:"
ls -la /home/atfortyseven/.nvm/versions/node/v20.20.2/bin/aztec* 2>/dev/null || echo "aztec binary NOT found"
