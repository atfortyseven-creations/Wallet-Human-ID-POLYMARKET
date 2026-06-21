import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { getPXEClient, getRelayerWallet, SPONSORED_FPC_ADDRESS } from '../lib/aztec/client';
import { AztecAddress } from '@aztec/aztec.js';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

async function main() {
  const pxe = await getPXEClient();
  const wallet = await getRelayerWallet();
  const adminAddress = wallet.getAddress();

  console.log(`Deploying Token Contract to Testnet...`);
  console.log(`Using Sponsored FPC: ${SPONSORED_FPC_ADDRESS}`);

  // We rely on aztec.js to estimate gas settings, so we just provide the payment method
  const token = await TokenContract.deploy(wallet, adminAddress, 'Whale QD', 'WQD', 18)
    .send({
      fee: {
        paymentMethod: new SponsoredFeePaymentMethod(
            AztecAddress.fromString(SPONSORED_FPC_ADDRESS)
        )
      }
    })
    .deployed();
    
  console.log(`✅ Token deployed at ${token.address.toString()}`);
}

main().catch((err) => {
    console.error("Deployment failed:", err);
    process.exit(1);
});
