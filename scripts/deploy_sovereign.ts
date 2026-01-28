const { ethers, upgrades } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    // Fallback to deployer if additional accounts are missing (Single Key Mode for Testnet)
    const multisig = signers[1] || deployer;
    const compliance = signers[2] || deployer;
    const treasuryAdmin = signers[3] || deployer;

    console.log("----------------------------------------------------");
    console.log("🚀 Starting HUMANID.FI Sovereign Deployment");
    console.log("----------------------------------------------------");
    console.log("Deployer:", deployer.address);
    console.log("Multisig (Beta Owner):", multisig.address);

    // =========================================================================
    // PHASE 1: ALPHA DEPLOYMENT (Hot Wallet Controlled)
    // =========================================================================
    console.log("\n📦 PHASE 1: ALPHA DEPLOYMENT (Hot Wallet Controlled)");

    // 1. Deploy Treasury (UUPS)
    const Treasury = await ethers.getContractFactory("HumanFiTreasury");
    console.log("   - Deploying Treasury Proxy...");
    const treasury = await upgrades.deployProxy(Treasury, [
        deployer.address, // Admin (Initial)
        deployer.address  // Upgrader (Initial)
    ], { initializer: 'initialize', kind: 'uups' });

    await treasury.waitForDeployment();
    console.log("✅ Treasury Deployed at:", await treasury.getAddress());

    // 2. Deploy Governance (UUPS)
    // Mock external addresses for this script, in prod use real ones
    const WLD_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"; // Base Sepolia WLD Mock
    const WORLD_ID_ROUTER = "0x4200000000000000000000000000000000000021"; // Base Sepolia Router
    const APP_ID = "app_staging_12345";

    const Governance = await ethers.getContractFactory("HumanFiGovernance");
    console.log("   - Deploying Governance Proxy...");
    const governance = await upgrades.deployProxy(Governance, [
        WLD_ADDRESS,
        WORLD_ID_ROUTER,
        APP_ID,
        await treasury.getAddress(),
        deployer.address, // Admin (Initial)
        deployer.address  // Upgrader (Initial)
    ], { initializer: 'initialize', kind: 'uups' });

    await governance.waitForDeployment();
    console.log("✅ Governance Deployed at:", await governance.getAddress());

    // =========================================================================
    // PHASE 2: BETA TRANSITION (Multisig Guardrails)
    // =========================================================================
    console.log("\n🛡️  PHASE 2: BETA TRANSITION (Transferring to Multisig)");

    // Transfer Ownership of Treasury
    console.log("   - Transferring Treasury Roles...");
    await treasury.grantRole(await treasury.DEFAULT_ADMIN_ROLE(), multisig.address);
    await treasury.grantRole(await treasury.UPGRADER_ROLE(), multisig.address);

    // Renounce Deployer roles only if distinct addresses
    if (multisig.address.toLowerCase() !== deployer.address.toLowerCase()) {
        await treasury.renounceRole(await treasury.DEFAULT_ADMIN_ROLE(), deployer.address);
        await treasury.renounceRole(await treasury.UPGRADER_ROLE(), deployer.address);
        console.log("   ✅ Treasury is now controlled by Multisig.");
    } else {
        console.log("   ⚠️  Deployer IS Multisig (Single Key). Skipping Renounce to prevent lockout.");
    }

    // Transfer Ownership of Governance
    console.log("   - Transferring Governance Roles...");
    await governance.grantRole(await governance.DEFAULT_ADMIN_ROLE(), multisig.address);
    await governance.grantRole(await governance.UPGRADER_ROLE(), multisig.address);

    if (multisig.address.toLowerCase() !== deployer.address.toLowerCase()) {
        await governance.renounceRole(await governance.DEFAULT_ADMIN_ROLE(), deployer.address);
        await governance.renounceRole(await governance.UPGRADER_ROLE(), deployer.address);
        console.log("   ✅ Governance is now controlled by Multisig.");
    } else {
        console.log("   ⚠️  Deployer IS Multisig (Single Key). Skipping Renounce to prevent lockout.");
    }

    // =========================================================================
    // PHASE 3: SOVEREIGN (Governance Takes Over)
    // =========================================================================
    console.log("\n🏛️  PHASE 3: SOVEREIGN (Future State)");
    console.log("   To execute Phase 3, the Multisig would call grantRole(DEFAULT_ADMIN_ROLE, governanceAddress)");
    console.log("   and renounce its own roles, completing the circle of decentralization.");
    console.log("   (This step is manual and triggered by DAO vote later).");

    console.log("\n----------------------------------------------------");
    console.log("🎉 Deployment & Rights Transition Complete.");
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
