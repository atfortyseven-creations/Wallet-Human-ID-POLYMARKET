import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";

const require  = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, "..");

const PRIVATE_KEY = "0x[REDACTED_PRIVATE_KEY]";

async function checkOptimismDeploy() {
  const provider = new ethers.JsonRpcProvider("https://opt-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Optimism Balance: ${ethers.formatEther(balance)} ETH`);

  // Try to estimate gas for CoreDots
  const solc = require("solc");
  const qdSrc = readFileSync(join(ROOT, "contracts/core/CoreDots.sol"), "utf8");
  const ledgerSrc = readFileSync(join(ROOT, "contracts/core/CoreLedger.sol"), "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "CoreDots.sol":   { content: qdSrc },
      "CoreLedger.sol": { content: ledgerSrc },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };
  
  const findImports = (p) => {
    try { return { contents: readFileSync(join(ROOT, "node_modules", p), "utf8") }; }
    catch { return { error: "not found" }; }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const qd = output.contracts["CoreDots.sol"]["CoreDots"];
  
  const factory = new ethers.ContractFactory(qd.abi, "0x" + qd.evm.bytecode.object, wallet);
  try {
    const tx = await factory.getDeployTransaction(wallet.address);
    const gasEstimate = await provider.estimateGas(tx);
    const feeData = await provider.getFeeData();
    const cost = gasEstimate * feeData.gasPrice;
    console.log(`Gas limit: ${gasEstimate}`);
    console.log(`Gas price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    console.log(`Deploy cost: ${ethers.formatEther(cost)} ETH`);
    
    if (balance >= cost) {
      console.log("SUFFICIENT FUNDS TO DEPLOY ON OPTIMISM!");
    } else {
      console.log("INSUFFICIENT FUNDS ON OPTIMISM.");
    }
  } catch (e) {
    console.error("Estimation failed:", e.message);
  }
}

checkOptimismDeploy();
