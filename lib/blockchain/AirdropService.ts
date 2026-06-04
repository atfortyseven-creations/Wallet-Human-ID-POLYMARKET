import { ethers } from 'ethers';

const coreDotsAbi = [
    "function mint(address to, uint256 amount) public"
];

export async function airdropWelcomeQDs(walletAddress: string) {
    if (!walletAddress) return;
    
    try {
        const privateKey = process.env.PRIVATE_KEY;
        // Provide fallbacks to ensure it works across configurations
        const rpcUrl = process.env.BASE_RPC_URL || process.env.ARBITRUM_RPC_URL || "https://mainnet.base.org";
        const contractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;

        // Skip if not properly configured or if using the dummy placeholder address from earlier
        if (!privateKey || !contractAddress || contractAddress === '0x1111111111111111111111111111111111111111') {
            console.log(`[CoreAirdrop] Skipped 500 QDs for ${walletAddress}. Not connected to live Mainnet config.`);
            return;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, coreDotsAbi, wallet);

        // 500 QDs
        const amount = ethers.parseEther("500");

        console.log(`[CoreAirdrop]  Executing Genesis 500 QDs drop to ${walletAddress}...`);
        
        // Fire transaction
        const tx = await contract.mint(walletAddress, amount);
        console.log(`[CoreAirdrop]  Tx Sent: ${tx.hash}`);
        
        // Wait for confirmation in the background so we don't block
        tx.wait().then(() => {
            console.log(`[CoreAirdrop]  500 QDs Genesis Confirmed for ${walletAddress}.`);
        }).catch((e: any) => {
            console.error(`[CoreAirdrop]  Tx failed to mine for ${walletAddress}:`, e.message);
        });

    } catch (error: any) {
        console.error(`[CoreAirdrop]  Fatal Error during airdrop to ${walletAddress}:`, error.message);
    }
}
