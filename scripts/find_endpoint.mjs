// Test different endpoints for wallet vs PXE
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';
const endpoints = ['', '/pxe', '/wallet', '/node'];

for (const ep of endpoints) {
  const url = `${baseUrl}${ep}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getChainInfo', params: [] }),
    });
    const data = await res.json();
    console.log(`${url}: status=${res.status}`, JSON.stringify(data).substring(0, 200));
  } catch(e) {
    console.log(`${url}: error - ${e.message}`);
  }
}
