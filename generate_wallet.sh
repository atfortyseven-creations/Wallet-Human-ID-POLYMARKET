#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use node
/home/atfortyseven/.aztec/versions/4.4.0/bin/aztec-wallet create-account
