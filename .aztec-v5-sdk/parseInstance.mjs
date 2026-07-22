import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { Fr } from '@aztec/foundation/curves/bn254';

export function parseInstance(plainFpc) {
  return {
    version: Number(plainFpc.version),
    salt: new Fr(BigInt(plainFpc.salt)),
    deployer: plainFpc.deployer ? AztecAddress.fromStringUnsafe(plainFpc.deployer) : AztecAddress.fromBigInt(0n),
    originalContractClassId: new Fr(BigInt(plainFpc.originalContractClassId || plainFpc.contractClassId)),
    initializationHash: new Fr(BigInt(plainFpc.initializationHash)),
    immutablesHash: new Fr(BigInt(plainFpc.immutablesHash || "0")),
    publicKeys: {
      masterNullifierPublicKey: { x: new Fr(BigInt(plainFpc.publicKeys?.masterNullifierPublicKey?.x || "0")), y: new Fr(BigInt(plainFpc.publicKeys?.masterNullifierPublicKey?.y || "0")) },
      masterIncomingViewingPublicKey: { x: new Fr(BigInt(plainFpc.publicKeys?.masterIncomingViewingPublicKey?.x || "0")), y: new Fr(BigInt(plainFpc.publicKeys?.masterIncomingViewingPublicKey?.y || "0")) },
      masterOutgoingViewingPublicKey: { x: new Fr(BigInt(plainFpc.publicKeys?.masterOutgoingViewingPublicKey?.x || "0")), y: new Fr(BigInt(plainFpc.publicKeys?.masterOutgoingViewingPublicKey?.y || "0")) },
      masterTaggingPublicKey: { x: new Fr(BigInt(plainFpc.publicKeys?.masterTaggingPublicKey?.x || "0")), y: new Fr(BigInt(plainFpc.publicKeys?.masterTaggingPublicKey?.y || "0")) }
    },
    currentContractClassId: new Fr(BigInt(plainFpc.currentContractClassId || plainFpc.contractClassId)),
    address: AztecAddress.fromStringUnsafe(plainFpc.address),
  };
}
