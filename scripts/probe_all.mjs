// The root endpoint returns "Method not found" for everything.
// But AccountManager worked - maybe there's a different path or namespace.
// Let's check pxe_ prefix (namespaced), and also the /v1 path
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';

const paths = ['', '/pxe', '/v1', '/api', '/rpc'];
const methods = ['getNodeInfo', 'pxe_getNodeInfo', 'node_getNodeInfo'];

for (const path of paths) {
  for (const method of methods) {
    const url = baseUrl + path;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: [] }),
      });
      const text = await res.text();
      if (text.includes('Not Found') || text.includes('Cannot')) {
        // skip
      } else {
        const data = JSON.parse(text);
        if (data.error?.code === -32601) {
          // Method not found, skip
        } else {
          console.log(`  ✓ ${url} :: ${method}:`, text.substring(0, 200));
        }
      }
    } catch(e) {
      // skip
    }
  }
}

// Also check what GET endpoints exist
for (const path of ['/health', '/status', '/info', '/', '/node/info', '/l2BlockNumber']) {
  try {
    const res = await fetch(baseUrl + path);
    if (res.ok || res.status < 400) {
      const text = await res.text();
      console.log(`GET ${path}: ${res.status}`, text.substring(0, 200));
    }
  } catch(e) {}
}
