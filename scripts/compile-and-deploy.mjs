/**
 * compile-and-deploy.mjs
 * 
 * Step 1: Compiles CoreDots.sol + CoreLedger.sol using the solc package
 *         from node_modules (no Hardhat runtime, no WASM issues).
 * Step 2: Deploys both contracts to Base Mainnet via ethers v6.
 * Step 3: Verifies the genesis allocation on-chain.
 * Step 4: Prints the env vars to set in Railway + .env
 *
 * Usage: node scripts/compile-and-deploy.mjs
 * 
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";

const require  = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, "..");

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
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const ENV = loadEnv();

//  Configuration 
const RPC_URL = ENV.BASE_MAINNET_RPC || ENV.BASE_MAINNET_RPC_URL ||
                ENV.GB_BASE_RPC_1   || "https://mainnet.base.org";

const RAW_KEY = ENV.PRIVATE_KEY;
if (!RAW_KEY) { console.error("[ABORT] PRIVATE_KEY missing from .env"); process.exit(1); }
const PRIVATE_KEY = RAW_KEY.startsWith("0x") ? RAW_KEY : `0x${RAW_KEY}`;

const SOVEREIGN_VAULT = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
const EXPECTED_GENESIS = 5_000_000n * 10n ** 18n;

//  Solidity source paths 
const QD_PATH     = join(ROOT, "contracts/core/CoreDots.sol");
const LEDGER_PATH = join(ROOT, "contracts/core/CoreLedger.sol");

//  Compile using solc (node_modules) 
function compileSolidity() {
  console.log("\n[1/5] Compiling contracts with solc...");
  const solc = require("solc");

  const qdSrc     = readFileSync(QD_PATH, "utf8");
  const ledgerSrc = readFileSync(LEDGER_PATH, "utf8");

  // Collect all @openzeppelin imports needed
  const ozBase = join(ROOT, "node_modules/@openzeppelin/contracts");

  function findImports(importPath) {
    // Handle @openzeppelin paths
    if (importPath.startsWith("@openzeppelin/")) {
      const resolved = join(ROOT, "node_modules", importPath);
      try {
        return { contents: readFileSync(resolved, "utf8") };
      } catch {
        return { error: `File not found: ${resolved}` };
      }
    }
    // Relative imports
    return { error: "Unsupported import: " + importPath };
  }

  const input = {
    language: "Solidity",
    sources: {
      "CoreDots.sol":   { content: qdSrc },
      "CoreLedger.sol": { content: ledgerSrc },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );

  // Check for errors
  const errors = (output.errors || []).filter(e => e.severity === "error");
  if (errors.length > 0) {
    console.error("\n[COMPILE ERROR]");
    for (const e of errors) console.error(" ", e.formattedMessage || e.message);
    process.exit(1);
  }

  // Log warnings
  const warnings = (output.errors || []).filter(e => e.severity === "warning");
  if (warnings.length > 0) {
    console.log(`  ${warnings.length} warning(s) (non-fatal).`);
  }

  const qdOut     = output.contracts["CoreDots.sol"]["CoreDots"];
  const ledgerOut = output.contracts["CoreLedger.sol"]["CoreLedger"];

  if (!qdOut || !ledgerOut) {
    console.error("[ABORT] Compilation did not produce expected contracts.");
    console.error("Available:", Object.keys(output.contracts));
    process.exit(1);
  }

  console.log("  CoreDots    compiled ");
  console.log("  CoreLedger  compiled ");

  return {
    qd: {
      abi:      qdOut.abi,
      bytecode: "0x" + qdOut.evm.bytecode.object,
    },
    ledger: {
      abi:      ledgerOut.abi,
      bytecode: "0x" + ledgerOut.evm.bytecode.object,
    },
  };
}

//  Deploy 
async function main() {
  console.log("\n");
  console.log("  CoreDots (210M QDs) + CoreLedger  Base Mainnet      ");
  console.log("");

  // 1. Compile
  const { qd, ledger } = compileSolidity();

  // 2. Connect
  console.log("\n[2/5] Connecting to Base Mainnet...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

  const [network, balance] = await Promise.all([
    provider.getNetwork(),
    provider.getBalance(wallet.address),
  ]);

  console.log(`  Network  : ${network.name || "base"} (chainId ${network.chainId})`);
  console.log(`  Deployer : ${wallet.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} ETH`);

  if (network.chainId !== 8453n) {
    console.error(`[ABORT] Expected Base Mainnet (8453), got ${network.chainId}`);
    process.exit(1);
  }
  if (balance === 0n) {
    console.error("[ABORT] Deployer wallet has 0 ETH. Fund it first.");
    process.exit(1);
  }

  // 3. Deploy CoreDots
  console.log("\n[3/5] Deploying CoreDots...");
  const qdFactory = new ethers.ContractFactory(qd.abi, qd.bytecode, wallet);
  const qdContract = await qdFactory.deploy(wallet.address);
  const qdDeployTx = qdContract.deploymentTransaction();
  console.log(`  Tx hash  : ${qdDeployTx?.hash}`);
  console.log("  Waiting for confirmation...");
  await qdContract.waitForDeployment();
  const QD_ADDRESS = await qdContract.getAddress();
  console.log(`  Deployed : ${QD_ADDRESS} `);

  // 4. Verify genesis
  console.log("\n[4/5] Verifying genesis allocation...");
  const qdView = new ethers.Contract(QD_ADDRESS, qd.abi, provider);
  const [totalSupply, vaultBal, maxSupply] = await Promise.all([
    qdView.totalSupply(),
    qdView.balanceOf(SOVEREIGN_VAULT),
    qdView.MAX_SUPPLY(),
  ]);

  console.log(`  MAX_SUPPLY      : ${ethers.formatEther(maxSupply)} QDs`);
  console.log(`  Total supply    : ${ethers.formatEther(totalSupply)} QDs`);
  console.log(`  ${SOVEREIGN_VAULT}`);
  console.log(`  Vault balance   : ${ethers.formatEther(vaultBal)} QDs`);

  if (vaultBal < EXPECTED_GENESIS) {
    console.error(`[ABORT] Vault has ${ethers.formatEther(vaultBal)} QDs, expected 5,000,000.`);
    process.exit(1);
  }
  console.log("  Genesis 5,000,000 QDs confirmed ");

  // 5. Deploy CoreLedger
  console.log("\n[5/5] Deploying CoreLedger v2...");
  const ledgerFactory  = new ethers.ContractFactory(ledger.abi, ledger.bytecode, wallet);
  const ledgerContract = await ledgerFactory.deploy(QD_ADDRESS);
  const ledgerDeployTx = ledgerContract.deploymentTransaction();
  console.log(`  Tx hash  : ${ledgerDeployTx?.hash}`);
  console.log("  Waiting for confirmation...");
  await ledgerContract.waitForDeployment();
  const LEDGER_ADDRESS = await ledgerContract.getAddress();
  console.log(`  Deployed : ${LEDGER_ADDRESS} `);

  //  Update .env automatically 
  console.log("\n  Patching .env with contract addresses...");
  let envContent = readFileSync(join(ROOT, ".env"), "utf8");

  // Remove existing lines if present
  envContent = envContent
    .split("\n")
    .filter(l => !l.startsWith("NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_CHAIN_ID"))
    .join("\n");

  // Append new values
  envContent += `\n#  QDs Contract Addresses (auto-generated by deploy-qd-live) \n`;
  envContent += `NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${QD_ADDRESS}\n`;
  envContent += `NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS=${LEDGER_ADDRESS}\n`;
  envContent += `NEXT_PUBLIC_CHAIN_ID=8453\n`;

  writeFileSync(join(ROOT, ".env"), envContent, "utf8");
  console.log("  .env updated ");

  //  Summary 
  console.log("\n");
  console.log("  DEPLOYMENT COMPLETE                                         ");
  console.log("");
  console.log(`  CoreDots   : ${QD_ADDRESS}`);
  console.log(`  CoreLedger : ${LEDGER_ADDRESS}`);
  console.log("");
  console.log("  Copy to Railway Dashboard  Variables:                      ");
  console.log(`  NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${QD_ADDRESS}`);
  console.log(`  NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS=${LEDGER_ADDRESS}`);
  console.log("  NEXT_PUBLIC_CHAIN_ID=8453                                   ");
  console.log("\n");
  console.log("  BaseScan verification:");
  console.log(`  https://basescan.org/address/${QD_ADDRESS}`);
  console.log(`  https://basescan.org/address/${LEDGER_ADDRESS}\n`);
}

main().catch(err => {
  console.error("\n[FATAL]", err.message || err);
  process.exit(1);
});
