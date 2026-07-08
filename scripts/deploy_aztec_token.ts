import 'dotenv/config';
import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { PXE } from '@aztec/pxe/client/lazy';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

// The canonical sponsored FPC from Aztec docs
const SPONSORED_FPC = "0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7";

async function main() {
  console.log("Starting deployment...");
  
  const pxeUrl = process.env.AZTEC_PXE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
  const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;

  if (!relayerSecretHex) {
    throw new Error("Missing AZTEC_RELAYER_SECRET_KEY");
  }

  const pxe = createSafeJsonRpcClient(pxeUrl, PXE);
  const secretKey = Fr.fromHexString(relayerSecretHex.replace('0x', ''));
  const signingKey = deriveSigningKey(secretKey);
  const contract = new SchnorrAccountContract(signingKey);
  const manager = await AccountManager.create(pxe, secretKey, contract);
  const wallet = await manager.getWallet();
  const address = wallet.getAddress();

  console.log("Deploying as:", address.toString());
  
  const name = "Whale QDs";
  const symbol = "QDs";
  const decimals = 18n;

  const deployer = TokenContract.deploy(
    wallet,
    address, // admin
    name,
    symbol,
    decimals
  );

  console.log("Sending deploy transaction...");
  const receipt = await deployer.send({
      fee: { paymentMethod: new SponsoredFeePaymentMethod(AztecAddress.fromString(SPONSORED_FPC)) }
  }).wait();
  
  console.log("Deployed! Token Address:", receipt.contract.address.toString());
}

main().catch(console.error);
