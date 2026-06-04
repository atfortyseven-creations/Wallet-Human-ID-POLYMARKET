import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CoreDots from:", deployer.address);
  console.log("Network: Base Mainnet (chain 8453)");
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH for gas. Fund it first.");
  }

  const CoreDots = await ethers.getContractFactory("CoreDots");
  
  // Deploy with the system owner wallet that receives the 2,005,000 genesis QDs
  const systemOwner = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
  console.log("Genesis mint recipient (owner):", systemOwner);
  
  const qd = await CoreDots.deploy(systemOwner);
  await qd.waitForDeployment();
  
  const address = await qd.getAddress();
  console.log("\n===================================================");
  console.log("CoreDots (QDs) deployed to Base Mainnet:");
  console.log(address);
  console.log("===================================================");
  console.log("Genesis supply: 2,005,000 QDs minted to:", systemOwner);
  console.log("Max Supply: 21,000,000 QDs (hard cap)");
  console.log("\nSet this in Railway env vars:");
  console.log(`NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=8453`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
