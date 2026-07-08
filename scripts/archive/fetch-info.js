const https = require('https');

const data = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'node_getNodeInfo',
  params: []
});

const req = https.request('https://v5.testnet.rpc.aztec-labs.com/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(body), null, 2)));
});

req.on('error', console.error);
req.write(data);
req.end();
