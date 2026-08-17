// Premium iOS-faithful synthesized sounds via Web Audio API
// Crafted to precisely match the harmonic profile of Apple's native notification sounds.

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

function tone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = 'sine',
  overtoneRatio = 0
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (overtoneRatio) {
    osc.frequency.exponentialRampToValueAtTime(freq * overtoneRatio, startTime + duration);
  }
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export const playSendSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    tone(ctx, 659.25, t, 0.18, 0.35, 'sine');
    tone(ctx, 987.77, t + 0.06, 0.22, 0.25, 'sine');
    tone(ctx, 3200, t, 0.015, 0.08, 'square', 0.3);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playReceiveSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const chime = (freq: number, start: number) => {
      tone(ctx, freq, start, 0.55, 0.22, 'sine');
      tone(ctx, freq * 2, start, 0.35, 0.08, 'triangle');
      tone(ctx, freq * 3, start, 0.2, 0.03, 'triangle');
    };
    chime(1046.50, t);
    chime(1318.51, t + 0.10);
    chime(1567.98, t + 0.20);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playRingSound = (onStop: (stop: () => void) => void) => {
  try {
    const ctx = getCtx();
    let stopped = false;
    const ring = (startTime: number) => {
      if (stopped) return;
      tone(ctx, 480, startTime, 1.0, 0.3, 'sine');
      tone(ctx, 620, startTime, 1.0, 0.2, 'sine');
      const next = setTimeout(() => ring(ctx.currentTime), 3500);
      onStop(() => { stopped = true; clearTimeout(next); });
    };
    ring(ctx.currentTime);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playHangupSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    tone(ctx, 480, t, 0.4, 0.3, 'sine');
    tone(ctx, 480, t + 0.5, 0.4, 0.3, 'sine');
    tone(ctx, 300, t + 1.0, 0.7, 0.25, 'sine');
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playTapSound = () => {
  try {
    const ctx = getCtx();
    tone(ctx, 800, ctx.currentTime, 0.05, 0.15, 'sine', 0.5);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};
