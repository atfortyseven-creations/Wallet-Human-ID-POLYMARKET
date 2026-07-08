import { createSafeJsonRpcClient, makeFetch } from '@aztec/foundation/json-rpc/client';

async function test() {
  try {
    const { WalletSchema } = await import('@aztec/aztec.js/wallet');
    const client = createSafeJsonRpcClient('http://127.0.0.1:18080', WalletSchema, {
      fetch: makeFetch([1, 2, 3], false),
      batchWindowMS: 0
    });
    console.log('Client created successfully with WalletSchema');
    console.log('Client keys:', Object.keys(client).filter(k => !k.startsWith('Symbol')).slice(0, 10));
    
    // Check if we can get address book or something simple
    const addrs = await client.getAddressBook();
    console.log('Address book:', addrs);
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
