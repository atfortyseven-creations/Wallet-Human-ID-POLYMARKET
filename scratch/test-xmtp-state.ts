import { Client } from '@xmtp/browser-sdk';

async function main() {
  try {
    const states = await Client.inboxStateFromInboxIds(['1e909289d0607ee55db27db326e06cb3883a66916eecfcb9560f4c39cbba62ec'], 'production');
    console.log(JSON.stringify(states, null, 2));
  } catch (e) {
    console.log(e);
  }
}
main();
