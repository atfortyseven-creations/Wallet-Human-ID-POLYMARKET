import { ethers, network } from "hardhat";

async function main() {
    console.log("🐋 OPERATION OMEGA // WHALE SIMULATION INITIATED");

    // 1. Target Configuration
    // A known Binance Hot Wallet on Base (or any top holder) containing USDC
    // Note: If this execution fails due to Mainnet state changes, update the address.
    const WHALE_ADDRESS = "0x3304E22DDaa22bCdC5fD29a87a109CdFe8DC7B64";
    const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base native USDC
    const AMOUNT_TO_STEAL = ethers.parseUnits("100000", 6); // 100k USDC

    const [deployer] = await ethers.getSigners();
    console.log(`🕵️  Impersonating Whale: ${WHALE_ADDRESS}`);
    console.log(`🏦  Beneficiary: ${deployer.address}`);

    // 2. Impersonate Account
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [WHALE_ADDRESS],
    });

    const whaleSigner = await ethers.getSigner(WHALE_ADDRESS);

    // 3. Fund Whale with ETH (Gas)
    // We need to give the whale some ETH so it can pay for the transfer transaction
    await network.provider.send("hardhat_setBalance", [
        WHALE_ADDRESS,
        "0x1000000000000000000", // 1 ETH
    ]);

    // 4. Steal the Funds (Simulated)
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    console.log("💸  Transferring 100,000 USDC...");

    const tx = await usdcContract.connect(whaleSigner).transfer(deployer.address, AMOUNT_TO_STEAL);
    await tx.wait();

    // 5. Verify Balance
    const balance = await usdcContract.balanceOf(deployer.address);
    console.log(`✅  Success! New Balance: ${ethers.formatUnits(balance, 6)} USDC`);

    console.log("---------------------------------------------------");
    console.log("Reality Simulation Complete. You are now a Whale.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

interface IERC20 {
    transfer(to: string, amount: bigint): Promise<any>;
    balanceOf(account: string): Promise<bigint>;
}
