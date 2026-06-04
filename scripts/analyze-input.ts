const { ethers } = require("ethers");

async function main() {
    const input = "5RrrdEJt48gpfxDiyL6Hjhq2BtwCaO1raE13ixaKI0drn/PKxM6qSw";
    console.log("Analyzing Input:", input);

    // 1. Check if it's a valid Hex Private Key
    try {
        const wallet = new ethers.Wallet(input);
        console.log(" It is a valid Hex Private Key!");
        console.log("Address:", wallet.address);
        return;
    } catch (e) {
        console.log(" Not a valid Hex Private Key.");
    }

    // 2. Check if it's Base64 Encoded Key
    try {
        const buffer = Buffer.from(input, 'base64');
        console.log("Base64 Decoded Length:", buffer.length);
        if (buffer.length === 32) {
             const hex = "0x" + buffer.toString('hex');
             const wallet = new ethers.Wallet(hex);
             console.log(" It is a valid Base64 Private Key!");
             console.log("Address:", wallet.address);
             return;
        } else {
            console.log(" Base64 decoded length is not 32 bytes (got " + buffer.length + ").");
        }
    } catch (e) {
        console.log(" Not a valid Base64 string.");
    }

    // 3. Heuristic for RPC
    if (input.includes("/")) {
        console.log("️ Input contains slash. Likely an API Key or URL Path.");
    } else {
        console.log(" Unknown format.");
    }
}

main();
