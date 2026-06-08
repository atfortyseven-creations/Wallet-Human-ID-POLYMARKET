import { expect } from 'chai';
import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api/zk/compile';

const EXAMPLES = [
  {
    name: 'Boolean Logic',
    code: `
fn main(a: bool, b: bool, pub c: bool) {
  assert((a & b) == c);
}
`
  },
  {
    name: 'Pedersen Hash',
    code: `
use std::hash::pedersen_hash;
fn main(pub hash: Field, balance: Field, salt: Field) {
  let computed = pedersen_hash([balance, salt]);
  assert(computed == hash);
}
`
  },
  {
    name: 'Multi-Module Library',
    code: `
mod utils {
    pub fn add(a: Field, b: Field) -> Field {
        a + b
    }
}
pub fn main(a: Field, b: Field, pub expected: Field) {
    assert(utils::add(a, b) == expected);
}
`
  }
];

async function runTests() {
  console.log('--- Starting Compiler Integration Tests ---');
  let passed = 0;
  
  for (const example of EXAMPLES) {
    console.log('\\nTesting circuit: ' + example.name);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: example.code })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log('✅ SUCCESS: Compiled in ' + data.compileMs + 'ms');
        console.log('   Bytecode Size: ' + data.bytecodeSize + ' bytes');
        passed++;
      } else {
        console.error('❌ FAILED: ' + data.error);
      }
    } catch (e: any) {
      console.error('❌ FETCH ERROR: ' + e.message);
    }
  }
  
  console.log('\\n--- Results: ' + passed + '/' + EXAMPLES.length + ' passed ---');
  if (passed !== EXAMPLES.length) {
      process.exit(1);
  }
}

runTests().catch(console.error);
