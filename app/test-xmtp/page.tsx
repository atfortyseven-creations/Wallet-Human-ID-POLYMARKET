'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getXMTPClient, sendMessage, getMessages, streamMessages } from '@/lib/xmtp/client';

export default function XmtpTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const log = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
    fetch('/api/test-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg })
    }).catch(() => {});
  };

  useEffect(() => {
    const runTest = async () => {
      try {
        log('Starting XMTP Local Browser Test...');
        
        // 1. Create two random wallets
        const w1 = ethers.Wallet.createRandom();
        const w2 = ethers.Wallet.createRandom();
        log(`Wallet A: ${w1.address}`);
        log(`Wallet B: ${w2.address}`);

        // 2. Create Signers
        const signerA = {
          getAddress: async () => w1.address,
          signMessage: async (msg: string | Uint8Array) => w1.signMessage(msg)
        };
        const signerB = {
          getAddress: async () => w2.address,
          signMessage: async (msg: string | Uint8Array) => w2.signMessage(msg)
        };

        // 3. Initialize Clients
        log('Initializing Client A...');
        const clientA = await getXMTPClient(signerA as any);
        log(`Client A Inbox: ${(clientA as any).inboxId}`);

        log('Initializing Client B...');
        const clientB = await getXMTPClient(signerB as any);
        log(`Client B Inbox: ${(clientB as any).inboxId}`);

        // 4. Send Message from A -> B
        log('Sending message A -> B...');
        await sendMessage(clientA, w2.address, "HELLO_WORLD_FROM_A");
        log('Message sent & synced successfully on Client A');

        // 5. Fetch historical on B
        log('Testing getMessages on Client B...');
        const msgs = await getMessages(clientB, w1.address);
        log(`getMessages returned ${msgs.length} messages.`);
        if (msgs.length > 0) {
            log(`First Msg RAW: ${JSON.stringify(msgs[0], (k,v) => typeof v === 'bigint' ? v.toString() : v)}`);
            log(`First Msg content: ${JSON.stringify(msgs[0].content)}`);
        }

        // 6. Stream on Client B
        log('Testing streamMessages on Client B...');
        const abortCtrl = new AbortController();
        const stream = streamMessages(clientB, abortCtrl.signal);
        
        log('Sending second message A -> B...');
        await sendMessage(clientA, w2.address, "HELLO_STREAM");

        const streamResult = await stream.next();
        if (!streamResult.done) {
          log(`Stream caught message! RAW: ${JSON.stringify(streamResult.value, (k,v) => typeof v === 'bigint' ? v.toString() : v)}`);
          log(`Stream message content type: ${typeof streamResult.value.content}`);
          log(`Stream message content: ${JSON.stringify(streamResult.value.content)}`);
        }
        abortCtrl.abort();


        log('TEST COMPLETE');
      } catch (err: any) {
        log(`ERROR: ${err.message}`);
        console.error(err);
      }
    };
    runTest();
  }, []);

  return (
    <div className="p-8 font-mono text-xs bg-black text-green-400 min-h-screen">
      <h1 className="text-xl mb-4 text-white">XMTP Diagnostics</h1>
      {logs.map((l, i) => (
        <div key={i} className="mb-2 whitespace-pre-wrap break-all">{l}</div>
      ))}
    </div>
  );
}
