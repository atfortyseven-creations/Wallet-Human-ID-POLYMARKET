import { AegisEventBus } from '@/lib/core/EventBus';

/**
 * PHASE 21, 22: MINI-APP ENGINE
 * Allows 3rd party devs to run Web3 apps INSIDE the chat window via secure Iframes.
 */
export class MiniAppEngine {
  private authorizedApps: Set<string> = new Set(['https://uniswap.org', 'https://polymarket.com']);

  public injectWalletProvider(iframeElement: HTMLIFrameElement, userAddress: string) {
    if (!this.authorizedApps.has(iframeElement.src)) {
      throw new Error("Security Violation: Unauthorized Mini-App");
    }

    // EIP-1193 Provider Bridge into the iframe
    iframeElement.contentWindow?.postMessage({
      type: 'AEGIS_WALLET_INJECT',
      payload: { address: userAddress, chainId: 8453 } // Base Network
    }, '*');

    AegisEventBus.publish('MINI_APP_LOADED', { url: iframeElement.src });
  }
}