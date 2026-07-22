import * as aztec from '@aztec/aztec.js';
import * as stdlib from '@aztec/stdlib/contract';

console.log("aztec.js ContractInstanceWithAddress properties:", Object.getOwnPropertyNames(aztec.ContractInstanceWithAddress || {}));
console.log("aztec.js ContractInstanceWithAddress prototype:", Object.getOwnPropertyNames((aztec.ContractInstanceWithAddress || {}).prototype || {}));

console.log("stdlib SerializableContractInstance properties:", Object.getOwnPropertyNames(stdlib.SerializableContractInstance || {}));
console.log("stdlib SerializableContractInstance prototype:", Object.getOwnPropertyNames((stdlib.SerializableContractInstance || {}).prototype || {}));

