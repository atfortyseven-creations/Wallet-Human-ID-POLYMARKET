// Premium, zero-latency Web Audio API synthesized notification sounds
// Eliminates the need for external MP3 files and creates a native, spatial "Apple/Telegram" feel.

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// A soft, ultra-premium "Pop" sound for sending a message
export const playSendSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const clickOsc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const clickGain = ctx.createGain();
    
    // Main body (warm sine)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    
    // Click transient for crispness
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, ctx.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);

    // Envelopes
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    clickGain.gain.setValueAtTime(0, ctx.currentTime);
    clickGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.005);
    clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    
    osc.connect(gainNode);
    clickOsc.connect(clickGain);
    
    gainNode.connect(ctx.destination);
    clickGain.connect(ctx.destination);
    
    osc.start();
    clickOsc.start();
    osc.stop(ctx.currentTime + 0.2);
    clickOsc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

// A premium, glossy double "Ding-Ding" sound for receiving a message
export const playReceiveSound = () => {
  try {
    const ctx = getAudioContext();
    
    const playGlossyTone = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Layered oscillators for richness
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime); // One octave up
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + 0.5);
      osc2.stop(startTime + 0.5);
    };

    // Play an elegant major chord arpeggio
    playGlossyTone(1046.50, ctx.currentTime); // C6
    playGlossyTone(1567.98, ctx.currentTime + 0.1); // G6
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};
