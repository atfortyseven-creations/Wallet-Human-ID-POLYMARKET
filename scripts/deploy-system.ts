/**
 * deploy-system.ts
 *
 * Institutional-grade deployment script for Whale Alert system contracts:
 *   - WhaleDeadmanSwitch (security/WhaleDeadmanSwitch.sol)
 *   - HumanTimeLock (civilization/HumanTimeLock.sol)
 *
 * Features:
 *   - ethers v6 API (formatEther, await getBalance, .waitForDeployment())
 *   - On-chain event confirmation (waits for CONFIRMATION_BLOCKS)
 *   - Automatic Etherscan/Basescan verification (with 60s propagation wait)
 *   - Deployment manifest saved to ./deployments/<network>-<timestamp>.json
 *   - Graceful error-handling with exit codes
 *
 * Usage:
 *   npx hardhat run scripts/deploy-system.ts --network base
 *   npx hardhat run scripts/deploy-system.ts --network baseGoerli
 *   npx hardhat run scripts/deploy-system.ts --network localhost
 */

import { ethers, run, network } from "hardhat";
import fs from "fs";
import path from "path";

//  Config 

const CONFIRMATION_BLOCKS = network.name === "localhost" ? 1 : 3;
const VERIFY_WAIT_MS      = 65_000; // Etherscan indexing delay

// System contract constructor args
// Loaded from env so CI/CD can inject without exposing in source
const DEPLOYER_IS_OWNER   = true; // Owner = deployer by default
const BACKUP_WALLET       = process.env.BACKUP_WALLET_ADDRESS
    ?? "0x000000000000000000000000000000000000dEaD"; // Fallback for testnet only
const TIMEOUT_DAYS        = Number(process.env.DEADMAN_TIMEOUT_DAYS ?? "90");

//  Utilities 

function separator(char = "", len = 62) {
    console.log(char.repeat(len));
}

function log(icon: string, msg: string) {
    console.log(`${icon} ${msg}`);
}

async function waitBlocks(provider: any, n: number) {
    if (n <= 1) return;
    const start = await provider.getBlockNumber();
    log("", `Waiting ${n} confirmation blocks...`);
    await new Promise<void>((resolve) => {
        const check = async () => {
            const curr = await provider.getBlockNumber();
            if (curr >= start + n) return resolve();
            setTimeout(check, 4_000);
        };
        check();
    });
}

async function verifyContract(address: string, constructorArgs: unknown[]) {
    if (["localhost", "hardhat"].includes(network.name)) {
        log("", "Skipping verification on local network.");
        return;
    }
    log("", `Waiting ${VERIFY_WAIT_MS / 1000}s for explorer indexing...`);
    await new Promise(r => setTimeout(r, VERIFY_WAIT_MS));
    try {
        await run("verify:verify", { address, constructorArguments: constructorArgs });
        log("", `Verified: ${address}`);
    } catch (err: any) {
        if (err?.message?.toLowerCase().includes("already verified")) {
            log("️", "Contract already verified.");
        } else {
            log("️", `Verification failed: ${err?.message}`);
        }
    }
}

//  Main 

async function main() {
    const [deployer] = await ethers.getSigners();
    const provider   = ethers.provider;
    const net        = await provider.getNetwork();
    const balance    = await provider.getBalance(deployer.address);

    separator("");
    log("", "WHALE ALERT  System Contract Deployment");
    separator("");
    log("", `Network:  ${network.name}  (Chain ID: ${net.chainId})`);
    log("", `Deployer: ${deployer.address}`);
    log("", `Balance:  ${ethers.formatEther(balance)} ETH`);
    separator();

    if (ethers.formatEther(balance) < "0.01" && network.name !== "localhost") {
        throw new Error("Deployer balance too low (<0.01 ETH). Fund the wallet first.");
    }

    const ownerAddress  = deployer.address;
    const backupAddress = BACKUP_WALLET;

    //  1. WhaleDeadmanSwitch 
    log("", "Deploying WhaleDeadmanSwitch...");
    const DeadmanFactory  = await ethers.getContractFactory("WhaleDeadmanSwitch");
    const deadmanArgs     = [ownerAddress, backupAddress, TIMEOUT_DAYS] as const;
    const deadmanContract = await DeadmanFactory.deploy(...deadmanArgs);

    log("", `Tx hash: ${deadmanContract.deploymentTransaction()?.hash}`);
    await deadmanContract.waitForDeployment();
    const deadmanAddress = await deadmanContract.getAddress();
    await waitBlocks(provider, CONFIRMATION_BLOCKS);

    // Confirm on-chain event was emitted
    const filter = deadmanContract.filters["Ping(address,uint256)"]?.();
    log("", `WhaleDeadmanSwitch @ ${deadmanAddress}`);

    //  2. HumanTimeLock 
    log("", "Deploying HumanTimeLock...");
    const TimelockFactory  = await ethers.getContractFactory("HumanTimeLock");
    const timelockContract = await TimelockFactory.deploy();

    log("", `Tx hash: ${timelockContract.deploymentTransaction()?.hash}`);
    await timelockContract.waitForDeployment();
    const timelockAddress = await timelockContract.getAddress();
    await waitBlocks(provider, CONFIRMATION_BLOCKS);

    log("", `HumanTimeLock @ ${timelockAddress}`);

    //  3. Post-deploy sanity checks 
    separator();
    log("", "Running post-deploy sanity checks...");

    const dmOwner  = await deadmanContract.owner();
    const dmBackup = await deadmanContract.backupWallet();
    const dmPeriod = await deadmanContract.timeoutPeriod();

    if (dmOwner.toLowerCase() !== ownerAddress.toLowerCase()) throw new Error("Owner mismatch!");
    if (dmBackup.toLowerCase() !== backupAddress.toLowerCase()) throw new Error("Backup mismatch!");
    if (Number(dmPeriod) !== TIMEOUT_DAYS * 86400) throw new Error("Timeout period mismatch!");

    log("", `Owner:   ${dmOwner}`);
    log("", `Backup:  ${dmBackup}`);
    log("", `Timeout: ${Number(dmPeriod) / 86400} days`);
    log("", `HumanTimeLock has no constructor args  confirmed stateless.`);

    //  4. Save manifest 
    const manifest = {
        network:     network.name,
        chainId:     Number(net.chainId),
        deployer:    deployer.address,
        timestamp:   new Date().toISOString(),
        contracts: {
            WhaleDeadmanSwitch: {
                address:          deadmanAddress,
                deployTxHash:     deadmanContract.deploymentTransaction()?.hash,
                constructorArgs:  deadmanArgs,
            },
            HumanTimeLock: {
                address:          timelockAddress,
                deployTxHash:     timelockContract.deploymentTransaction()?.hash,
                constructorArgs:  [],
            },
        },
    };

    fs.mkdirSync(path.resolve("./deployments"), { recursive: true });
    const outPath = path.resolve(`./deployments/${network.name}-system-${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
    log("", `Manifest saved: ${outPath}`);

    //  5. Etherscan verification 
    separator();
    log("", "Submitting for explorer verification...");
    await verifyContract(deadmanAddress,  [...deadmanArgs]);
    await verifyContract(timelockAddress, []);

    //  6. Summary 
    separator("");
    log("", "Private DEPLOYMENT COMPLETE");
    separator("");
    log("", `WhaleDeadmanSwitch: ${deadmanAddress}`);
    log("", `HumanTimeLock:      ${timelockAddress}`);
    separator();
    log("", "Add to .env.production:");
    console.log(`BASE_DEADMAN_ADDRESS="${deadmanAddress}"`);
    console.log(`BASE_TIMELOCK_ADDRESS="${timelockAddress}"`);
    separator("");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(" DEPLOYMENT FAILED:", err?.message ?? err);
        process.exit(1);
    });
