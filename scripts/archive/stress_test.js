const { spawn } = require('child_process');
const http = require('http');

const PORT = 3033;
const API_URL = `http://localhost:${PORT}`;

// We will launch the next.js server in the background
console.log('Starting Next.js Server on port', PORT, '...');
const serverProcess = spawn('npx.cmd', ['next', 'dev', '-p', PORT.toString()], {
  cwd: process.cwd(),
  shell: true,
  env: { ...process.env, PORT: PORT.toString() }
});

// Wait for server to be ready
let isReady = false;
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready in') || output.includes('started server on')) {
    if (!isReady) {
      isReady = true;
      console.log('Server is ready! Beginning 100 Quantum Stress Tests...');
      runTests();
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  // console.error(data.toString());
});

async function makeRequest(endpoint, payload, headers = {}) {
  return new Promise((resolve) => {
    const dataString = JSON.stringify(payload);
    const req = http.request(
      `${API_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString),
          ...headers
        }
      },
      (res) => {
        let responseBody = '';
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: responseBody });
        });
      }
    );
    req.on('error', (e) => resolve({ status: 500, error: e.message }));
    req.write(dataString);
    req.end();
  });
}

function generateValidPayload(index) {
  return {
    title: `Quantum Product Batch ${index}`,
    category: 'ELECTRONICS',
    payload: { description: 'High tech component', batchId: `BATCH-QX-${index}` }
  };
}

function generateObscenePayload(index) {
  return {
    title: `Bad Product ${index}`,
    category: 'OTHER',
    payload: { description: 'This is a mierda product', batchId: `B-1` }
  };
}

async function runTests() {
  const results = {
    total: 100,
    success: 0,
    profanityBlocked: 0,
    securityBlocked: 0,
    failures: 0
  };

  console.log('--- STARTING 100 TESTS ---');
  
  const promises = [];
  
  for (let i = 1; i <= 100; i++) {
    // We will test 3 scenarios randomly:
    // 60% valid passport creation + anchor flow
    // 20% obscene content (should be blocked by Blacklist)
    // 20% replay attack on premium endpoints (should be blocked by Abysmal Security)
    
    const type = i <= 60 ? 'VALID' : (i <= 80 ? 'OBSCENE' : 'REPLAY');
    
    promises.push((async () => {
      try {
        if (type === 'OBSCENE') {
          const res = await makeRequest('/api/passport', generateObscenePayload(i));
          if (res.status === 400 && res.body.includes('Inappropriate')) {
            results.profanityBlocked++;
          } else {
            results.failures++;
            console.error(`Obscenity test failed to block: ${res.status} ${res.body}`);
          }
        } 
        else if (type === 'REPLAY') {
          // Attempt a replay attack on the paymaster endpoint
          const res = await makeRequest('/api/premium/paymaster', {
            transactionPayload: { dummy: true },
            tier: 'ELITE',
            nonce: 'short', // Too weak
            timestamp: Date.now() - 600000 // 10 minutes ago (expired)
          });
          if (res.status === 403 && res.body.includes('Security Exception')) {
            results.securityBlocked++;
          } else {
            results.failures++;
            console.error(`Replay attack test failed to block: ${res.status} ${res.body}`);
          }
        }
        else { // VALID
          // 1. Create passport
          const passportRes = await makeRequest('/api/passport', generateValidPayload(i));
          if (passportRes.status !== 201) {
            results.failures++;
            console.error(`Valid passport creation failed: ${passportRes.status} ${passportRes.body}`);
            return;
          }
          const passportData = JSON.parse(passportRes.body);

          // 2. Test standard fallback anchoring
          // We will hit the anchor endpoint simulating the fallback in UI
          const anchorRes = await makeRequest('/api/aztec/anchor', {
             passportSlug: passportData.slug,
             metadata: `StudioProvenance/v1|${passportData.slug}`,
             creatorAddress: '0x123',
             proof: '0xLocalWasmProof'
          });
          
          if (anchorRes.status === 200 || anchorRes.status === 201) {
             results.success++;
          } else {
             results.failures++;
             console.error(`Anchor failed: ${anchorRes.status} ${anchorRes.body}`);
          }
        }
      } catch (e) {
        results.failures++;
        console.error('Exception during test:', e);
      }
    })());
  }

  await Promise.all(promises);

  console.log('\n--- QUANTUM STRESS TEST RESULTS ---');
  console.log(`Total Tests Executed: ${results.total}`);
  console.log(`✅ Successful Valid Anchors: ${results.success} / 60`);
  console.log(`🛡️ Profanity/Obscenity Blocked: ${results.profanityBlocked} / 20`);
  console.log(`🔒 Security/Replay Attacks Blocked: ${results.securityBlocked} / 20`);
  console.log(`❌ Unexpected Failures: ${results.failures}`);
  console.log('-----------------------------------\n');

  // Kill server
  serverProcess.kill();
  process.exit(results.failures === 0 ? 0 : 1);
}

// Timeout failsafe
setTimeout(() => {
  console.error('Test timed out. Server might not be starting.');
  serverProcess.kill();
  process.exit(1);
}, 30000);
