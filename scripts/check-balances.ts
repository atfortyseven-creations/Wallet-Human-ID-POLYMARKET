const { ethers } = require("ethers");

async function main() {
    const address = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
    console.log("️ Checking Balances for:", address);

    const networks = [
        { name: "Base", url: "https://mainnet.base.org" },
        { name: "Optimism", url: "https://mainnet.optimism.io" },
        { name: "World Chain", url: "https://worldchain-mainnet.g.alchemy.com/public" },
        { name: "Base Sepolia", url: "https://base-sepolia.infura.io/v3/7a5d3c17767c414c8734e6fdb0a6638b" }
    ];

    for (const net of networks) {
        try {
            const provider = new ethers.JsonRpcProvider(net.url);
            const balance = await provider.getBalance(address);
            console.log(` ${net.name}: ${ethers.formatEther(balance)} ETH`);
        } catch (e: any) {
            console.log(`️ ${net.name}: Error connecting (${e.message})`);
        }
    }
}

main();
