#!/usr/bin/env node
/**
 * VERIFICACION DEFINITIVA DE DIRECCION AZTEC
 * Usa los mismos parametros que claim-fee-juice.mjs
 * Salt = Fr.ZERO (hardcoded en createSchnorrAccount)
 */
process.env.LOG_LEVEL = "silent";

const { createRequire } = await import("module");
const { existsSync } = await import("fs");
const _req = createRequire(import.meta.url);

// Mismo codigo que claim-fee-juice.mjs para encontrar Fr
const walletsEntry = _req.resolve("@aztec-rc/wallets/embedded");
const walletsRoot = walletsEntry.slice(0, walletsEntry.indexOf("/node_modules/@aztec-rc/wallets/") +
  "/node_modules/@aztec-rc/wallets/".length);
const internalFieldsPath = walletsRoot + "node_modules/@aztec/aztec.js/dest/api/fields.js";

let Fr;
if (existsSync(internalFieldsPath)) {
  ({ Fr } = await import(internalFieldsPath));
} else {
  ({ Fr } = await import("@aztec-rc/aztec.js/fields"));
}

const { EmbeddedWallet } = await import("@aztec-rc/wallets/embedded");

const accountSecret = "0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f";
const nodeUrl = "https://rpc.testnet.aztec-labs.com";

console.log("\n=== VERIFICACION DIRECCION (metodo EmbeddedWallet) ===\n");

const wallet = await EmbeddedWallet.create(nodeUrl, {
  ephemeral: true,
  pxeConfig: { proverEnabled: false },
});
const secretKey = Fr.fromHexString(accountSecret);
const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
const address = accountManager.address.toString();
console.log("Address derivada por claim script:", address);
console.log("\nESTA es la address que debes pegar en el faucet:");
console.log("  https://aztec-faucet.nethermind.io");
console.log("\nSi ya pediste Fee Juice para esta address, entonces el leaf index / claim-secret son correctos.");
await wallet.stop();
