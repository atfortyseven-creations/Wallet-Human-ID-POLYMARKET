const {ethers} = require('ethers');

const wallets = [
  { name: 'System (PRIVATE_KEY)',      key: '0x[REDACTED_PRIVATE_KEY]' },
  { name: 'Relayer (RELAYER_PRIVATE_KEY)',  key: '[REDACTED_RELAYER_KEY]' },
];

const rpcs = [
  { name: 'Base Mainnet',  url: 'https://mainnet.base.org' },
  { name: 'Base Sepolia',  url: 'https://sepolia.base.org' },
  { name: 'Ethereum',      url: 'https://eth-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU' },
  { name: 'Optimism',      url: 'https://opt-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU' },
];

async function check() {
  for (const rpc of rpcs) {
    const provider = new ethers.JsonRpcProvider(rpc.url);
    for (const w of wallets) {
      try {
        const wallet = new ethers.Wallet(w.key);
        const bal = await provider.getBalance(wallet.address);
        const eth = ethers.formatEther(bal);
        const tag = bal > 0n ? '[HAS FUNDS]' : '[empty]    ';
        console.log(tag + ' ' + rpc.name.padEnd(14) + ' | ' + wallet.address + ' | ' + eth + ' ETH | ' + w.name);
      } catch(e) {
        console.log('[error]     ' + rpc.name.padEnd(14) + ' | ' + w.name + ': ' + e.message.slice(0, 60));
      }
    }
  }
}

check().catch(console.error);
