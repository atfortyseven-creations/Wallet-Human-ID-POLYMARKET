import { ethers } from "hardhat";

async function main() {
    console.log("👑 OPERATION OMEGA // CROWN TRANSFER");

    // CONFIGURATION
    const TARGET_CONTRACT_ADDRESS = "0x..."; // Replace with Deployed Address
    const GNOSIS_SAFE_ADDRESS = "0x..."; // Replace with Real Multisig

    const [deployer] = await ethers.getSigners();

    console.log(`Target: ${TARGET_CONTRACT_ADDRESS}`);
    console.log(`New King: ${GNOSIS_SAFE_ADDRESS}`);

    // Get Contract Interface (Using SafeContracts interface)
    const accessControl = await ethers.getContractAt("AccessControl", TARGET_CONTRACT_ADDRESS);

    // Roles
    const DEFAULT_ADMIN_ROLE = await accessControl.DEFAULT_ADMIN_ROLE();
    const EMERGENCY_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EMERGENCY_ADMIN_ROLE"));

    // 1. Grant Roles to Safe
    console.log("1. Granting Admin Role to Safe...");
    let tx = await accessControl.grantRole(DEFAULT_ADMIN_ROLE, GNOSIS_SAFE_ADDRESS);
    await tx.wait();
    console.log("   ✅ Granted.");

    console.log("2. Granting Emergency Role to Safe...");
    tx = await accessControl.grantRole(EMERGENCY_ADMIN_ROLE, GNOSIS_SAFE_ADDRESS);
    await tx.wait();
    console.log("   ✅ Granted.");

    // 2. Renounce Roles from Deployer (Burn the bridges)
    console.log("3. Renouncing Deployer Roles...");
    tx = await accessControl.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address);
    await tx.wait();

    // Verify
    const isDeployerAdmin = await accessControl.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    if (!isDeployerAdmin) {
        console.log("   ✅ Renounced. Deployer is no longer Admin.");
    } else {
        console.error("   ❌ ERROR: Deployer still has admin rights!");
    }

    console.log("---------------------------------------------------");
    console.log("Crown Transferred. Long live the Safe.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
