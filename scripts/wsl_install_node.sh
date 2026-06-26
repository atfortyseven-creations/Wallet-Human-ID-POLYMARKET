#!/bin/sh
export NVM_DIR="/home/atfortyseven/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
node --version
npm --version
echo DONE_NODE_INSTALL
