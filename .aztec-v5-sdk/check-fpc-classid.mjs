// check-fpc-classid.mjs
import { SponsoredFPCContractArtifact } from '@aztec/noir-contracts.js/SponsoredFPC';
import { FPCContractArtifact } from '@aztec/noir-contracts.js/FPC';

console.log('=== SponsoredFPC ===');
console.log('name:', SponsoredFPCContractArtifact.name);
console.log('classId field:', SponsoredFPCContractArtifact.classId ?? '(none)');
// The class ID is derived from the artifact bytecode. Let's try to compute it.
try {
  const { computeContractClassId } = await import('@aztec/aztec.js');
  const id = computeContractClassId(SponsoredFPCContractArtifact);
  console.log('Computed classId:', id?.toString());
} catch (e) {
  console.log('Could not compute via computeContractClassId:', e.message);
}

// Try another path
try {
  const { getContractClassFromArtifact } = await import('@aztec/stdlib/contract-class-id').catch(() => ({}));
  if (getContractClassFromArtifact) {
    const cls = getContractClassFromArtifact(SponsoredFPCContractArtifact);
    console.log('classId via getContractClassFromArtifact:', cls?.id?.toString());
  }
} catch (e2) {
  console.log('stdlib path error:', e2.message);
}

console.log('\n=== FPC ===');
console.log('name:', FPCContractArtifact.name);
