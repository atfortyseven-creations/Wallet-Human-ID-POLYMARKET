async function checkMethod(url, method) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: "2.0", method: method, params: [1], id: 1 })
    });
    const data = await res.json();
    console.log(`[${method}]`, data);
  } catch (err) {
    console.error(`[${method}] Error:`, err.message);
  }
}

const u = 'https://node.aztec.network';
checkMethod(u, 'node_getBlockNumber');
checkMethod(u, 'node_getBlockHeader');
checkMethod(u, 'node_getBlock');
