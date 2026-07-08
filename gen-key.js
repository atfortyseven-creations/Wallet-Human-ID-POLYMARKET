const c = require('crypto');
// BN254 Fr field modulus — keys must be less than this
const MOD = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709142e1f13a12344dff');
let key;
do {
  key = BigInt('0x' + c.randomBytes(32).toString('hex'));
} while (key >= MOD);
const hex = '0x' + key.toString(16).padStart(64, '0');
console.log('Valid AZTEC_RELAYER_SECRET_KEY (BN254 Fr-safe):');
console.log(hex);
