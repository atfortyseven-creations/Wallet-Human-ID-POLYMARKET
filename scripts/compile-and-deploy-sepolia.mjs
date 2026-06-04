/**
 * compile-and-deploy-sepolia.mjs
 * 
 * Deploys CoreDots + CoreLedger to BASE SEPOLIA (testnet).
 * Uses free faucet ETH. Identical logic to mainnet deploy  just different RPC.
 *
 * Steps:
 *   1. Get free testnet ETH from: https://faucet.quicknode.com/base/sepolia
 *      (paste address: 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a)
 *   2. Run: node scripts/compile-and-deploy-sepolia.mjs
 *   3. Contracts deploy, .env gets updated automatically.
 * 
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";

const require   = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

//  Load .env 
function loadEnv() {
  const lines = readFileSync(join(ROOT, ".env"), "utf8").split("\n");
  const env   = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val   = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const ENV         = loadEnv();
const RAW_KEY     = ENV.PRIVATE_KEY;
if (!RAW_KEY) { console.error("[ABORT] PRIVATE_KEY missing from .env"); process.exit(1); }
const PRIVATE_KEY = RAW_KEY.startsWith("0x") ? RAW_KEY : `0x${RAW_KEY}`;

// Base Sepolia public RPC  no API key needed
const RPC_URL        = "https://sepolia.base.org";
const CHAIN_ID       = 84532n;
const SOVEREIGN_VAULT = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
const EXPECTED_GENESIS = 5_000_000n * 10n ** 18n;

//  Compile 
function compileSolidity() {
  console.log("\n[1/5] Compiling with solc@0.8.26...");
  const solc = require("solc");

  const findImports = (importPath) => {
    if (importPath.startsWith("@openzeppelin/")) {
      try {
        return { contents: readFileSync(join(ROOT, "node_modules", importPath), "utf8") };
      } catch { return { error: `Not found: ${importPath}` }; }
    }
    return { error: "Unknown import: " + importPath };
  };

  const input = {
    language: "Solidity",
    sources: {
      "CoreDots.sol":   { content: readFileSync(join(ROOT, "contracts/core/CoreDots.sol"), "utf8") },
      "CoreLedger.sol": { content: readFileSync(join(ROOT, "contracts/core/CoreLedger.sol"), "utf8") },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const errors = (output.errors || []).filter(e => e.severity === "error");
  if (errors.length) {
    for (const e of errors) console.error(e.formattedMessage);
    process.exit(1);
  }

  console.log("  CoreDots    compiled ");
  console.log("  CoreLedger  compiled ");

  return {
    qd: {
      abi:      output.contracts["CoreDots.sol"]["CoreDots"].abi,
      bytecode: "0x" + output.contracts["CoreDots.sol"]["CoreDots"].evm.bytecode.object,
    },
    ledger: {
      abi:      output.contracts["CoreLedger.sol"]["CoreLedger"].abi,
      bytecode: "0x" + output.contracts["CoreLedger.sol"]["CoreLedger"].evm.bytecode.object,
    },
  };
}

//  Main 
async function main() {
  console.log("\n");
  console.log("  CoreDots + CoreLedger  BASE SEPOLIA (Testnet)        ");
  console.log("");

  const { qd, ledger } = compileSolidity();

  // Connect
  console.log("\n[2/5] Connecting to Base Sepolia...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
  const [network, balance] = await Promise.all([provider.getNetwork(), provider.getBalance(wallet.address)]);

  console.log(`  Network  : Base Sepolia (chainId ${network.chainId})`);
  console.log(`  Deployer : ${wallet.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} ETH`);

  if (network.chainId !== CHAIN_ID) {
    console.error(`[ABORT] Expected Base Sepolia (84532), got ${network.chainId}`);
    process.exit(1);
  }
  if (balance === 0n) {
    console.error("\n[ABORT] Wallet has 0 testnet ETH.");
    console.error("  Get free Base Sepolia ETH from ONE of these faucets:");
    console.error("  1. https://faucet.quicknode.com/base/sepolia");
    console.error("     (no account needed, paste: 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a)");
    console.error("  2. https://faucets.alchemy.com/faucets/base-sepolia");
    console.error("     (free Alchemy account, gives 0.1 ETH/day)");
    console.error("  3. https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    console.error("     (Coinbase Wallet required)\n");
    process.exit(1);
  }

  // Deploy CoreDots
  console.log("\n[3/5] Deploying CoreDots (QDs)...");
  const qdFactory  = new ethers.ContractFactory(qd.abi, qd.bytecode, wallet);
  const qdContract = await qdFactory.deploy(wallet.address);
  console.log(`  Tx: ${qdContract.deploymentTransaction()?.hash}`);
  await qdContract.waitForDeployment();
  const QD_ADDRESS = await qdContract.getAddress();
  console.log(`    ${QD_ADDRESS}`);

  // Verify genesis
  console.log("\n[4/5] Verifying genesis allocation...");
  const qdView = new ethers.Contract(QD_ADDRESS, qd.abi, provider);
  const [ts, vaultBal, maxS] = await Promise.all([
    qdView.totalSupply(), qdView.balanceOf(SOVEREIGN_VAULT), qdView.MAX_SUPPLY()
  ]);
  console.log(`  MAX_SUPPLY  : ${ethers.formatEther(maxS)} QDs`);
  console.log(`  totalSupply : ${ethers.formatEther(ts)} QDs`);
  console.log(`  Vault (${SOVEREIGN_VAULT.slice(0,10)}...) : ${ethers.formatEther(vaultBal)} QDs`);

  if (vaultBal < EXPECTED_GENESIS) {
    console.error(`[ABORT] Expected 5,000,000 QDs in vault, got ${ethers.formatEther(vaultBal)}`);
    process.exit(1);
  }
  console.log("  5,000,000 QDs in System Vault ");

  // Deploy CoreLedger
  console.log("\n[5/5] Deploying CoreLedger v2...");
  const lFactory   = new ethers.ContractFactory(ledger.abi, ledger.bytecode, wallet);
  const lContract  = await lFactory.deploy(QD_ADDRESS);
  console.log(`  Tx: ${lContract.deploymentTransaction()?.hash}`);
  await lContract.waitForDeployment();
  const LEDGER_ADDRESS = await lContract.getAddress();
  console.log(`    ${LEDGER_ADDRESS}`);

  // Patch .env
  console.log("\n  Updating .env...");
  let content = readFileSync(join(ROOT, ".env"), "utf8");
  content = content.split("\n")
    .filter(l => !l.startsWith("NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_CHAIN_ID"))
    .join("\n");
  content += `\n#  QDs Testnet (Base Sepolia 84532)  generated ${new Date().toISOString()}\n`;
  content += `NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${QD_ADDRESS}\n`;
  content += `NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS=${LEDGER_ADDRESS}\n`;
  content += `NEXT_PUBLIC_CHAIN_ID=84532\n`;
  writeFileSync(join(ROOT, ".env"), content, "utf8");
  console.log("  .env updated ");

  console.log("\n");
  console.log("  TESTNET DEPLOY COMPLETE                                    ");
  console.log("");
  console.log(`  CoreDots   : ${QD_ADDRESS}`);
  console.log(`  CoreLedger : ${LEDGER_ADDRESS}`);
  console.log("");
  console.log("  Add these to Railway:                                       ");
  console.log(`  NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${QD_ADDRESS}`);
  console.log(`  NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS=${LEDGER_ADDRESS}`);
  console.log("  NEXT_PUBLIC_CHAIN_ID=84532                                  ");
  console.log("\n");
  console.log(`  BaseScan Sepolia: https://sepolia.basescan.org/address/${QD_ADDRESS}`);
  console.log(`  Ledger Sepolia  : https://sepolia.basescan.org/address/${LEDGER_ADDRESS}\n`);
}

main().catch(err => {
  console.error("\n[FATAL]", err.message || err);
  process.exit(1);
});
