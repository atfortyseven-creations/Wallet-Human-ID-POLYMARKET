
import { Client } from '@xmtp/browser-sdk';
async function test() {
  try {
    const states = await Client.inboxStateFromInboxIds(['test_inbox_id'], 'production');
    console.log('States:', states);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();

