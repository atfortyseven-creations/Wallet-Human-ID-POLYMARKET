/**
 * PHASE 27: SPATIAL AUDIO ENGINE (WebXR Foundation)
 * Uses Web Audio API to position voices in 3D space.
 */
export class SpatialAudioEngine {
  private audioContext: AudioContext;
  private panners: Map<string, PannerNode> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
  }

  public addParticipant(peerId: string, stream: MediaStream, position: [number, number, number]) {
    const source = this.audioContext.createMediaStreamSource(stream);
    const panner = this.audioContext.createPanner();
    
    // HRTF for true 3D spatialization
    panner.panningModel = 'HRTF';
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];

    source.connect(panner);
    panner.connect(this.audioContext.destination);
    this.panners.set(peerId, panner);
  }

  public moveParticipant(peerId: string, position: [number, number, number]) {
    const panner = this.panners.get(peerId);
    if (panner) {
      panner.positionX.value = position[0];
      panner.positionZ.value = position[2];
    }
  }
}