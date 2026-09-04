import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { SponsoredFPCContractArtifact } from '@aztec/noir-contracts.js/SponsoredFPC';

const NODE_URL   = 'https://node.aztec.network/';
const SPONSORED_FPC = '0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c';

async function main() {
  const node = await createAztecNodeClient(NODE_URL);
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  
  const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  const rawInstance = await node.getContract(fpcAddress);
  
  console.log("Raw instance keys:", Object.keys(rawInstance));
  console.log("publicKeys keys:", Object.keys(rawInstance.publicKeys || {}));

  // Reconstruct properly using Fr and AztecAddress where needed
  const { PublicKeys } = await import('@aztec/stdlib/keys').catch(() => ({}));
  let publicKeysObj;
  
  if (PublicKeys && rawInstance.publicKeys) {
      console.log("Using stdlib/keys PublicKeys");
      // Depending on version, PublicKeys might be instantiated from hashes or we just mock the `toFields` method
  }

  // A simpler way: just mock toFields on the object?
  // Let's see what happens if we import `ContractInstanceWithAddress` from Aztec.js
  let ContractInstanceWithAddress;
  try {
      const aztecJs = await import('@aztec/aztec.js');
      console.log("aztec.js exported:", Object.keys(aztecJs).filter(k => k.includes('Contract')));
  } catch(e) {}
  
  try {
      const stdlib = await import('@aztec/stdlib/contract');
      console.log("stdlib/contract exported:", Object.keys(stdlib));
      if (stdlib.SerializableContractInstance) {
          // Maybe it's a SerializableContractInstance
          console.log("We have SerializableContractInstance");
      }
  } catch(e) {}
  
  try {
      // Let's try to parse the raw instance into a proper class if there is a fromJSON
      // Often Aztec uses `fromBuffer`, `fromString`, or a specific class.
      // Let's see if we can find `ContractInstance` class in @aztec/stdlib/contract
      const stdlibContract = await import('@aztec/stdlib/contract');
      if (stdlibContract.ContractInstanceWrapper || stdlibContract.ContractInstance) {
          console.log("Found ContractInstance class");
      }
  } catch(e) {}

  process.exit(0);
}

main().catch(console.error);
