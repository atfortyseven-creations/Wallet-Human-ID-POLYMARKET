const { ethers } = require('ethers');

async function testRpc() {
    const httpsUrl = 'https://go.getblock.us/7ad12a6612ba4a8592ef5e1ea148c2a6';
    
    console.log("Testing ETH...");
    try {
        const ethProvider = new ethers.JsonRpcProvider(httpsUrl);
        const ethBlock = await ethProvider.getBlockNumber();
        console.log("ETH Block:", ethBlock);
    } catch (e) {
        console.log("ETH Failed:", e.message);
    }
    
    console.log("Testing BSC...");
    try {
        const bscProvider = new ethers.JsonRpcProvider(httpsUrl, 56);
        const bscBlock = await bscProvider.getBlockNumber();
        console.log("BSC Block:", bscBlock);
    } catch (e) {
        console.log("BSC Failed:", e.message);
    }

    // Try without chain ID to see what chain it actually connects to
    try {
        const provider = new ethers.JsonRpcProvider(httpsUrl);
        const network = await provider.getNetwork();
        console.log("Native Network for this RPC:", network.name, network.chainId);
    } catch (e) {
        console.log("Network test failed:", e.message);
    }
}

testRpc();
