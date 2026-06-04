import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";

const require   = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const PRIVATE_KEY = "0x[REDACTED_PRIVATE_KEY]";
const RPC_URL = "https://opt-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU"; // Fast Alchemy node for OP
const CHAIN_ID = 10n; // Optimism Mainnet
const SOVEREIGN_VAULT = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
const EXPECTED_GENESIS = 5_000_000n * 10n ** 18n;

function compileSolidity() {
  console.log("\n[1/5] Compiling with solc...");
  const solc = require("solc");
  const findImports = (importPath) => {
    if (importPath.startsWith("@openzeppelin/")) {
      try { return { contents: readFileSync(join(ROOT, "node_modules", importPath), "utf8") }; }
      catch { return { error: `Not found: ${importPath}` }; }
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
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === "error");
    if (errors.length) {
      for (const e of errors) console.error(e.formattedMessage);
      process.exit(1);
    }
  }

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

async function main() {
  console.log("\n");
  console.log("  CoreDots + CoreLedger  OPTIMISM MAINNET DEPLOY       ");
  console.log("");

  const { qd, ledger } = compileSolidity();

  console.log("\n[2/5] Connecting to Optimism...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
  const balance = await provider.getBalance(wallet.address);

  console.log(`  Deployer : ${wallet.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} ETH`);

  console.log("\n[3/5] Deploying CoreDots (QDs)...");
  const qdFactory  = new ethers.ContractFactory(qd.abi, qd.bytecode, wallet);
  const qdContract = await qdFactory.deploy(wallet.address);
  console.log(`  Tx: ${qdContract.deploymentTransaction()?.hash}`);
  await qdContract.waitForDeployment();
  const QD_ADDRESS = await qdContract.getAddress();
  console.log(`    ${QD_ADDRESS}`);

  console.log("\n[4/5] Verifying genesis allocation...");
  const qdView = new ethers.Contract(QD_ADDRESS, qd.abi, provider);
  const [vaultBal] = await Promise.all([qdView.balanceOf(SOVEREIGN_VAULT)]);
  console.log(`  Vault (${SOVEREIGN_VAULT.slice(0,10)}...) : ${ethers.formatEther(vaultBal)} QDs`);
  
  console.log("\n[5/5] Deploying CoreLedger v2...");
  const lFactory   = new ethers.ContractFactory(ledger.abi, ledger.bytecode, wallet);
  const lContract  = await lFactory.deploy(QD_ADDRESS);
  console.log(`  Tx: ${lContract.deploymentTransaction()?.hash}`);
  await lContract.waitForDeployment();
  const LEDGER_ADDRESS = await lContract.getAddress();
  console.log(`    ${LEDGER_ADDRESS}`);

  console.log("\n  Updating .env...");
  let content = readFileSync(join(ROOT, ".env"), "utf8");
  content = content.split("\n")
    .filter(l => !l.startsWith("NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS") &&
                 !l.startsWith("NEXT_PUBLIC_CHAIN_ID"))
    .join("\n");
  content += `\n#  QDs Optimism Mainnet \n`;
  content += `NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${QD_ADDRESS}\n`;
  content += `NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS=${LEDGER_ADDRESS}\n`;
  content += `NEXT_PUBLIC_CHAIN_ID=10\n`;
  writeFileSync(join(ROOT, ".env"), content, "utf8");
  
  console.log("\n");
  console.log("  OPTIMISM MAINNET DEPLOY COMPLETE                           ");
  console.log("");
  console.log(`  CoreDots   : ${QD_ADDRESS}`);
  console.log(`  CoreLedger : ${LEDGER_ADDRESS}`);
  console.log("\n");
  console.log(`  Optimism Scan: https://optimistic.etherscan.io/address/${QD_ADDRESS}`);
}

main().catch(console.error);
