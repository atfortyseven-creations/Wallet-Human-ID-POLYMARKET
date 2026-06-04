'use client';

import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { kadDHT } from '@libp2p/kad-dht';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { identify } from '@libp2p/identify';
import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import { bootstrap } from '@libp2p/bootstrap';

let node: any = null;

/**
 * Initializes the Eternal Node (libp2p) in the browser environment.
 * Enables peer-to-peer gossip for System blocks and thermodynamic signals.
 */
export const initEternalNode = async (onMetricsUpdate: (metrics: any) => void) => {
    if (node) {
        console.log('[Eternal Node] Node already active.');
        return node;
    }

    try {
        console.log('%c[Eternal Node] Booting System Mesh Layer...', 'color: #00ff9d; font-weight: bold');
        
        node = await createLibp2p({
            addresses: {
                listen: [
                    '/webrtc', // WebRTC transport for browser-to-browser
                    '/ws',     // WebSockets for browser-to-relay
                ]
            },
            transports: [
                webRTC(),
                webSockets(),
                tcp()
            ],
            connectionEncrypters: [noise()],
            streamMuxers: [yamux()],
            peerDiscovery: [
                bootstrap({
                    list: [
                        // Primary DNS (Protocol Labs)
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnoo2uR3u2nd6P3R9YpxTQU3kH9ndU1hL1p92437',
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa6A5TQU3nd6P3R9YpxTQU3kH9ndU1hL1p92437',
                        // Secondary IPFS Swarm fallbacks (50-Year System continuity)
                        '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
                        '/ip4/147.75.83.83/tcp/4001/p2p/QmbBHw1Xx9pUpAbrVZVDz1MKhJZWwu3k7kX4h8HCHaTuPZ'
                    ]
                })
            ],
            services: {
                identify: identify(),
                dht: kadDHT({
                    clientMode: true, // Browser nodes typically run in client mode
                }) as any,
                pubsub: gossipsub({
                    allowPublishToZeroTopicPeers: true,
                    emitSelf: false
                }) as any,
            },
            connectionManager: {
                maxConnections: 50
            }
        });

        // Event Listeners
        node.addEventListener('peer:discovery', (evt: any) => {
            const peerId = evt.detail.id.toString();
            console.log(`[Eternal Node] Discovered peer: ${peerId}`);
            onMetricsUpdate({ peers: node.getPeers().length });
        });

        node.addEventListener('peer:connect', (evt: any) => {
            console.log(`[Eternal Node] Connected to: ${evt.detail.toString()}`);
            onMetricsUpdate({ peers: node.getPeers().length });
        });

        node.addEventListener('peer:disconnect', (evt: any) => {
            console.log(`[Eternal Node] Disconnected from: ${evt.detail.toString()}`);
            onMetricsUpdate({ peers: node.getPeers().length });
        });

        // Subscribe to System Akashic Ledger blocks
        const SAL_TOPIC = 'sal-block';
        node.services.pubsub.subscribe(SAL_TOPIC);
        
        node.services.pubsub.addEventListener('message', (evt: any) => {
            if (evt.detail.topic === SAL_TOPIC) {
                const data = new TextDecoder().decode(evt.detail.data);
                console.log('%c[Eternal Node] Received SAL Mesh Block', 'color: #00ff9d', JSON.parse(data));
                // Dispatch to SAL Ledger store here
            }
        });

        await node.start();
        console.log('%c[Eternal Node] Node Online  Multiaddr:', 'color: #00ff9d', node.getMultiaddrs().map((ma: any) => ma.toString()));
        
        return node;

    } catch (error) {
        console.error('[Eternal Node] Boot Failure:', error);
        node = null;
        throw error;
    }
};

/**
 * Gracefully shuts down the browser node.
 */
export const stopEternalNode = async () => {
    if (!node) return;
    
    try {
        console.log('[Eternal Node] Deactivating Mesh Layer...');
        await node.stop();
        node = null;
        console.log('[Eternal Node] Offline.');
    } catch (error) {
        console.error('[Eternal Node] Shutdown Error:', error);
    }
};

/**
 * Broadcasts a thermodynamic signal or block to the network.
 */
export const broadcastSignal = async (topic: string, data: any) => {
    if (!node) {
        console.warn('[Eternal Node] Cannot broadcast: Node is offline.');
        return;
    }

    try {
        const payload = new TextEncoder().encode(JSON.stringify(data));
        await node.services.pubsub.publish(topic, payload);
    } catch (error) {
        console.error('[Eternal Node] Broadcast Error:', error);
    }
};
