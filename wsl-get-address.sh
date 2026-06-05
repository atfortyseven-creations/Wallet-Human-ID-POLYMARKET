#!/bin/bash
# Script de derivacion de address - con node path explicito
export NODE_PATH=/home/atfortyseven/.nvm/versions/node/v24.12.0/bin
export PATH=$NODE_PATH:$PATH

SECRET="${1:-0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f}"

cd /home/atfortyseven/.aztec-devtools

$NODE_PATH/node --input-type=module <<'NODEOF'
process.env.LOG_LEVEL = "silent";
import { createRequire } from "module";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const devtoolsDir = join(homedir(), ".aztec-devtools");
const _req = createRequire(new URL("file://" + devtoolsDir + "/claim-fee-juice.mjs"));

const walletsEntry = _req.resolve("@aztec-rc/wallets/embedded");
const walletsRoot = walletsEntry.slice(0, walletsEntry.indexOf("/node_modules/@aztec-rc/wallets/") +
  "/node_modules/@aztec-rc/wallets/".length);
const internalFieldsPath = walletsRoot + "node_modules/@aztec/aztec.js/dest/api/fields.js";

let Fr;
if (existsSync(internalFieldsPath)) {
  const m = await import(internalFieldsPath);
  Fr = m.Fr;
} else {
  const m = await import("@aztec-rc/aztec.js/fields");
  Fr = m.Fr;
}

const { EmbeddedWallet } = await import("@aztec-rc/wallets/embedded");
const wallet = await EmbeddedWallet.create("https://rpc.testnet.aztec-labs.com", {
  ephemeral: true,
  pxeConfig: { proverEnabled: false }
});

const SECRET_KEY = process.env.AZTEC_SECRET || "0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f";
const sk = Fr.fromHexString(SECRET_KEY);
const mgr = await wallet.createSchnorrAccount(sk, Fr.ZERO);
console.log("\n╔══════════════════════════════════════════════════════════════════╗");
console.log("║  AZTEC ADDRESS CORRECTA (para el faucet):                        ║");
console.log("╠══════════════════════════════════════════════════════════════════╣");
console.log("║  " + mgr.address.toString() + "  ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");
await wallet.stop();
NODEOF
