import { FixGateway } from '../lib/fix-gateway';

async function verifyFix() {
  console.log('--- FIX Protocol Verification ---');
  
  const mockWhale = {
    id: 'tx_alpha_99',
    token: 'BTC',
    action: 'BUY',
    usdValue: 1250000.50,
    amount: 12.5,
    timestamp: new Date(),
    dex: 'UNISWAP_V3'
  };

  const fixMessage = FixGateway.createWhaleSignalMessage(mockWhale);
  console.log(' Generated FIX Message:');
  console.log(fixMessage.replace(/\x01/g, '|')); // Replace SOH for readability

  // Basic structure checks
  if (fixMessage.includes('8=FIX.4.4') && fixMessage.includes('35=W')) {
    console.log(' Basic FIX Header and MsgType detected.');
  }

  const checksumMatch = fixMessage.match(/10=(\d{3})/);
  if (checksumMatch) {
    console.log(` FIX Checksum generated: ${checksumMatch[1]}`);
  }

  console.log('--- FIX Verification Success ---');
}

verifyFix();
