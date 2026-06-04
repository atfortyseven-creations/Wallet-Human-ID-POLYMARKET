const { ethers } = require('ethers');

async function testWss() {
    const wssUrl = 'wss://go.getblock.us/082ce3ac4682462c872445983d75426f';
    try {
        const provider = new ethers.WebSocketProvider(wssUrl);
        const network = await provider.getNetwork();
        console.log("WSS Network:", network.name, network.chainId);
        provider.destroy();
    } catch (e) {
        console.log("WSS Failed:", e.message);
    }
}
testWss();
