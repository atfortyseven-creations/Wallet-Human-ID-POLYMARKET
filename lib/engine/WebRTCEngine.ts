import Peer, { MediaConnection } from 'peerjs';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'active';

export class WebRTCEngine {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private myAddress: string;
  private localStream: MediaStream | null = null;

  constructor(address: string) {
    this.myAddress = address;
  }

  // Deterministic PeerID generation ensures we don't need XMTP to exchange IDs
  private derivePeerId(walletAddress: string): string {
    return `ledger${walletAddress.slice(2, 12).toLowerCase()}`;
  }

  public initialize() {
    const peerId = this.derivePeerId(this.myAddress);
    this.peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    this.peer.on('call', (call) => {
      console.log('[WebRTCEngine] Incoming call from', call.peer);
      window.dispatchEvent(new CustomEvent('webrtc_incoming_call', { detail: { call } }));
    });

    this.peer.on('error', (err) => {
      console.error('[WebRTCEngine] Error:', err);
    });
  }

  public async startCall(targetAddress: string, isVideo: boolean): Promise<MediaConnection> {
    if (!this.peer) throw new Error("Peer not initialized");
    const targetPeerId = this.derivePeerId(targetAddress);
    
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true
    });

    this.currentCall = this.peer.call(targetPeerId, this.localStream);
    
    this.currentCall.on('stream', (remoteStream) => {
      window.dispatchEvent(new CustomEvent('webrtc_remote_stream', { detail: { stream: remoteStream } }));
    });

    return this.currentCall;
  }

  public async answerCall(call: MediaConnection, isVideo: boolean) {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true
    });
    call.answer(this.localStream);
    this.currentCall = call;

    call.on('stream', (remoteStream) => {
      window.dispatchEvent(new CustomEvent('webrtc_remote_stream', { detail: { stream: remoteStream } }));
    });
  }

  public endCall() {
    if (this.currentCall) this.currentCall.close();
    if (this.localStream) this.localStream.getTracks().forEach(track => track.stop());
    this.currentCall = null;
    this.localStream = null;
    window.dispatchEvent(new Event('webrtc_call_ended'));
  }
}