const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://opt-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU");
  const contractAddress = "0x4b0AC3fEC5032fF82D352376B896c1aDe8e7d693";
  const targetAddress = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a";
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function mint(address to, uint256 amount) public"
  ];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    const balance = await contract.balanceOf(targetAddress);
    console.log("Balance of", targetAddress, ":", ethers.formatEther(balance));
    
    if (balance === 0n) {
      console.log("Balance is 0. Minting 5,000,000 QDs...");
      const privateKey = "[REDACTED_PRIVATE_KEY]";
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);
      const tx = await contractWithSigner.mint(targetAddress, ethers.parseEther("5000000"));
      console.log("Mint tx sent:", tx.hash);
      await tx.wait();
      console.log("Mint complete!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
