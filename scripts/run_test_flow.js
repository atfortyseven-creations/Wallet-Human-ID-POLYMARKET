const http = require('http');

async function testFlow() {
  console.log("Starting test flow...");
  // Assuming dev server is running on port 3000
  const url = 'http://localhost:3000/api/aztec/test-flow?address=0x1234567890123456789012345678901234567890';
  
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.log("Error:", e.message);
  }
}

testFlow();
