/**
 * Deployment Script for Human-Fi Smart Contracts
 * 
 * Deploys ZapContract and MarketGovernance to Optimism
 * 
 * Usage:
 * - Testnet: npx hardhat run scripts/deploy.ts --network optimism-goerli
 * - Mainnet: npx hardhat run scripts/deploy.ts --network optimism
 */

import { ethers } from "hardhat";

// ============================================================================
// OPTIMISM MAINNET ADDRESSES
// ============================================================================

const OPTIMISM_MAINNET = {
    WLD_TOKEN: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
    USDC_TOKEN: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC.e
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    POLYMARKET_CTF: "0x0000000000000000000000000000000000000000", // TODO: Add actual address
};

// ============================================================================
// OPTIMISM GOERLI (TESTNET) ADDRESSES
// ============================================================================

const OPTIMISM_GOERLI = {
    WLD_TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Deploy mock
    USDC_TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Deploy mock
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    POLYMARKET_CTF: "0x0000000000000000000000000000000000000000", // TODO: Deploy mock
};

async function main() {
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("🚀 Deploying Human-Fi Smart Contracts");
    console.log("━".repeat(50));
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log("━".repeat(50));

    // Select addresses based on network
    const isMainnet = network.chainId === 10; // Optimism mainnet
    const addresses = isMainnet ? OPTIMISM_MAINNET : OPTIMISM_GOERLI;

    // Treasury address (deployer for now, should be multisig in production)
    const treasury = deployer.address;

    // ============================================================================
    // DEPLOY ZAP CONTRACT
    // ============================================================================

    console.log("\n📦 Deploying ZapContract...");

    const ZapContract = await ethers.getContractFactory("ZapContract");
    const zapContract = await ZapContract.deploy(
        addresses.WLD_TOKEN,
        addresses.USDC_TOKEN,
        addresses.POLYMARKET_CTF,
        addresses.UNISWAP_V3_ROUTER,
        addresses.PERMIT2,
        treasury
    );

    await zapContract.deployed();

    console.log(`✅ ZapContract deployed to: ${zapContract.address}`);
    console.log(`   - WLD Token: ${addresses.WLD_TOKEN}`);
    console.log(`   - USDC Token: ${addresses.USDC_TOKEN}`);
    console.log(`   - CTF Exchange: ${addresses.POLYMARKET_CTF}`);
    console.log(`   - Swap Router: ${addresses.UNISWAP_V3_ROUTER}`);
    console.log(`   - Permit2: ${addresses.PERMIT2}`);
    console.log(`   - Treasury: ${treasury}`);

    // ============================================================================
    // DEPLOY MARKET GOVERNANCE CONTRACT
    // ============================================================================

    console.log("\n📦 Deploying MarketGovernance...");

    const MarketGovernance = await ethers.getContractFactory("MarketGovernance");
    const marketGovernance = await MarketGovernance.deploy(addresses.USDC_TOKEN);

    await marketGovernance.deployed();

    console.log(`✅ MarketGovernance deployed to: ${marketGovernance.address}`);
    console.log(`   - USDC Token: ${addresses.USDC_TOKEN}`);

    // ============================================================================
    // VERIFICATION INSTRUCTIONS
    // ============================================================================

    console.log("\n🔍 Contract Verification Commands:");
    console.log("━".repeat(50));

    console.log("\nZapContract:");
    console.log(`npx hardhat verify --network ${network.name} ${zapContract.address} \\`);
    console.log(`  "${addresses.WLD_TOKEN}" \\`);
    console.log(`  "${addresses.USDC_TOKEN}" \\`);
    console.log(`  "${addresses.POLYMARKET_CTF}" \\`);
    console.log(`  "${addresses.UNISWAP_V3_ROUTER}" \\`);
    console.log(`  "${addresses.PERMIT2}" \\`);
    console.log(`  "${treasury}"`);

    console.log("\nMarketGovernance:");
    console.log(`npx hardhat verify --network ${network.name} ${marketGovernance.address} \\`);
    console.log(`  "${addresses.USDC_TOKEN}"`);

    // ============================================================================
    // SAVE DEPLOYMENT ADDRESSES
    // ============================================================================

    const deployment = {
        network: network.name,
        chainId: network.chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ZapContract: zapContract.address,
            MarketGovernance: marketGovernance.address,
        },
        dependencies: addresses,
    };

    const fs = require("fs");
    const deploymentPath = `./deployments/${network.name}-${Date.now()}.json`;

    fs.mkdirSync("./deployments", { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

    // ============================================================================
    // SUMMARY
    // ============================================================================

    console.log("\n✨ Deployment Complete!");
    console.log("━".repeat(50));
    console.log(`ZapContract: ${zapContract.address}`);
    console.log(`MarketGovernance: ${marketGovernance.address}`);
    console.log("━".repeat(50));

    // ============================================================================
    // NEXT STEPS
    // ============================================================================

    console.log("\n📋 Next Steps:");
    console.log("1. Verify contracts on Etherscan");
    console.log("2. Transfer ownership to multisig (if applicable)");
    console.log("3. Update frontend with contract addresses");
    console.log("4. Test zap flow on testnet");
    console.log("5. Publish first Merkle root for royalties");
    console.log("6. Set up monitoring and alerts");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
