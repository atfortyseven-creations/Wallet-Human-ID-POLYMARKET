/**
 * lib/aztec/token-contract.ts
 *
 * QDs Token on the Aztec Testnet.
 *
 * We use the pre-compiled TokenContract from @aztec/noir-contracts.js,
 * which ships with all compiled artifacts — no Noir toolchain needed.
 *
 * Deployment: run `npx tsx scripts/deploy-qds-token.ts` once.
 * Then set AZTEC_QDS_CONTRACT_ADDRESS in your environment.
 */

export const QDS_DECIMALS = 18; // Standard ERC-20 style decimals
export const QDS_SYMBOL   = 'QDs';
export const QDS_NAME     = 'Quantum Dots';

// Human-readable token metadata
export const QDS_TOKEN = {
  name:     QDS_NAME,
  symbol:   QDS_SYMBOL,
  decimals: QDS_DECIMALS,
  network:  'Aztec Testnet',
};

/**
 * Converts a raw bigint value from the contract to a display string.
 * e.g. 1000000000000000000n → "1.000000000000000000"
 */
export function rawToQds(raw: bigint | number | string): string {
  const rawBig  = BigInt(raw.toString());
  const divisor = 10n ** BigInt(QDS_DECIMALS);
  const whole   = rawBig / divisor;
  const frac    = rawBig % divisor;
  return `${whole}.${frac.toString().padStart(QDS_DECIMALS, '0')}`;
}

/**
 * Converts a user-entered amount string to a raw bigint for the contract.
 * e.g. "1.5" → 1500000000000000000n
 */
export function qdsToRaw(amount: string): bigint {
  const [whole = '0', frac = '0'] = amount.split('.');
  const fracPadded = frac.padEnd(QDS_DECIMALS, '0').slice(0, QDS_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(QDS_DECIMALS) + BigInt(fracPadded);
}

/**
 * Returns a TokenContract instance connected to the deployed QDs contract.
 * Loads the pre-compiled artifact from @aztec/noir-contracts.js (no compile needed).
 */
export async function getQDsTokenContract(wallet: any, contractAddress?: string) {
  const address = contractAddress || process.env.AZTEC_QDS_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error(
      'QDs contract not deployed. Run: npx tsx scripts/deploy-qds-token.ts\n' +
      'Then set AZTEC_QDS_CONTRACT_ADDRESS in .env'
    );
  }

  const { TokenContract } = await import('@aztec/noir-contracts.js/Token');
  const { AztecAddress }  = await import('@aztec/aztec.js');

  return TokenContract.at(AztecAddress.fromString(address), wallet);
}

/**
 * Reads the private QDs balance for a given Aztec address.
 */
export async function getQDsBalance(wallet: any, ownerAddress: string): Promise<string> {
  const { AztecAddress } = await import('@aztec/aztec.js');
  const contract = await getQDsTokenContract(wallet);
  const owner    = AztecAddress.fromString(ownerAddress);
  const raw      = await contract.methods.balance_of_private(owner).simulate();
  return rawToQds(raw);
}
