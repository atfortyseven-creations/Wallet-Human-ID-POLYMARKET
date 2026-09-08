import { sendMessage as xmtpSend } from '@/lib/xmtp/client';

export interface UserIdentity {
  address: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
}

export class IdentityResolver {
  // Mock cache for speed - replace with actual DB/Lens/ENS fetch
  private static identityCache: Map<string, UserIdentity> = new Map();

  public static async resolve(address: string): Promise<UserIdentity> {
    const lower = address.toLowerCase();
    if (this.identityCache.has(lower)) {
      return this.identityCache.get(lower)!;
    }

    try {
      // In a real scenario, this calls your backend API
      const res = await fetch(`/api/user/profile?walletAddress=${lower}`);
      if (res.ok) {
        const data = await res.json();
        const identity = {
          address: lower,
          name: data.profile?.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
          avatarUrl: data.profile?.avatar || '/default-avatar.png',
          isVerified: data.profile?.isVerified || false
        };
        this.identityCache.set(lower, identity);
        return identity;
      }
    } catch (e) {
      console.warn("Identity resolve failed for", address);
    }

    // Fallback
    return {
      address: lower,
      name: `${address.slice(0, 6)}...${address.slice(-4)}`,
      avatarUrl: '/default-avatar.png',
      isVerified: false
    };
  }
}

export class CallMetadataEngine {
  public static async sendCallOffer(client: any, targetAddress: string, isVideo: boolean, myAddress: string) {
    const myIdentity = await IdentityResolver.resolve(myAddress);
    const payload = JSON.stringify({
      type: isVideo ? 'VIDEO_CALL' : 'VOICE_CALL',
      caller: myIdentity,
      timestamp: Date.now()
    });
    
    // Send a hidden system message via XMTP
    await xmtpSend(client, targetAddress, `__SYSTEM_CALL_OFFER__:${payload}`);
  }

  // Parses incoming messages to intercept calls before rendering in chat
  public static interceptIncomingCall(messageContent: string) {
    if (messageContent.startsWith('__SYSTEM_CALL_OFFER__:')) {
      try {
        const payloadStr = messageContent.replace('__SYSTEM_CALL_OFFER__:', '');
        const data = JSON.parse(payloadStr);
        // Dispatch UI Event
        window.dispatchEvent(new CustomEvent('ledger_incoming_call_ui', { detail: data }));
        return true; // Indicates it was intercepted
      } catch (e) {
        console.error("Failed to parse call offer", e);
      }
    }
    return false;
  }
}