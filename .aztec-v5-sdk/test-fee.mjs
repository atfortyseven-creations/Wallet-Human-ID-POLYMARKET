import * as fee from '@aztec/aztec.js/fee';
import * as root from '@aztec/aztec.js';

console.log("fee exports:", Object.keys(fee));
console.log("root fee classes:", Object.keys(root).filter(k => k.includes('Fee') || k.includes('Payment')));
