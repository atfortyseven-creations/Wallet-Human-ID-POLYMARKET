// scripts/deploy-deadman-switch.js
// Deploy SystemDeadmanSwitch to Polygon Amoy (testnet) then verify on PolygonScan.
//
// Usage:
//   npx hardhat run scripts/deploy-deadman-switch.js --network polygonAmoy
//
// Required .env vars:
//   PRIVATE_KEY           deployer (= owner) private key, no 0x prefix
//   BACKUP_WALLET         the wallet address that inherits assets
//   TIMEOUT_DAYS          default 180
//   POLYGONSCAN_API_KEY   for automatic source verification

const { ethers, run, network } = require("hardhat");

async function main() {
  //  Config 
  const [deployer] = await ethers.getSigners();

  const backupWallet  = process.env.BACKUP_WALLET;
  const timeoutDays   = parseInt(process.env.TIMEOUT_DAYS || "180", 10);

  if (!backupWallet) {
    throw new Error("  BACKUP_WALLET env var not set. Aborting.");
  }

  console.log("");
  console.log("   SOVEREIGN DEADMAN'S SWITCH  DEPLOYMENT ENGINE");
  console.log("");
  console.log(`Network:       ${network.name}`);
  console.log(`Deployer:      ${deployer.address}`);
  console.log(`Backup Wallet: ${backupWallet}`);
  console.log(`Timeout:       ${timeoutDays} days`);
  console.log("");

  //  Deploy 
  const Switch = await ethers.getContractFactory("SystemDeadmanSwitch");

  console.log("\n  Broadcasting deployment transaction...");
  const switchContract = await Switch.deploy(
    deployer.address,
    backupWallet,
    timeoutDays
  );

  await switchContract.waitForDeployment();
  const address = await switchContract.getAddress();

  console.log(`\n  Contract deployed at: ${address}`);
  console.log(`    Block: ${switchContract.deploymentTransaction()?.blockNumber}`);
  console.log(`    Tx:    ${switchContract.deploymentTransaction()?.hash}`);

  //  Verify 
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n  Waiting 6 blocks for PolygonScan to index the contract...");
    // Give PolygonScan ~30 s to index the new contract
    await new Promise(r => setTimeout(r, 30_000));

    console.log("  Verifying source code on PolygonScan...");
    try {
      await run("verify:verify", {
        address,
        constructorArguments: [deployer.address, backupWallet, timeoutDays],
        contract: "contracts/security/SystemDeadmanSwitch.sol:SystemDeadmanSwitch",
      });
      console.log("  Source verified on PolygonScan!");
    } catch (err) {
      console.warn("️  Verification failed (may already be verified):", err.message);
    }
  }

  //  Export ABI & address for the frontend 
  const fs = require("fs");
  const path = require("path");

  const artifact  = await artifacts.readArtifact("SystemDeadmanSwitch");
  const outputDir = path.join(__dirname, "../lib/blockchain/abi");
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "SystemDeadmanSwitch.json"),
    JSON.stringify({ address, abi: artifact.abi, network: network.name }, null, 2)
  );

  console.log(`\n  ABI + address exported to lib/blockchain/abi/SystemDeadmanSwitch.json`);
  console.log("\n");
  console.log(`  PolygonScan (Amoy): https://amoy.polygonscan.com/address/${address}`);
  console.log("\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
