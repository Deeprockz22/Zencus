/**
 * Acoustic Focus Chime — Handcrafted Tibetan Singing Bowl & Kyoto Rin Bell synthesis.
 * Generates an authentic resonant bell chime entirely in the browser using the Web Audio API.
 * Zero bytes of external MP3/WAV assets; pure acoustic physics.
 */
import { sfx } from './sfx';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Strike a resonant bronze temple bell / singing bowl.
 * @param {Object} options
 * @param {number} [options.fundamental=432] - Fundamental frequency in Hz (default: 432 Hz).
 * @param {number} [options.duration=5.0] - Decay time in seconds.
 * @param {number} [options.gain=0.35] - Relative volume.
 */
export function playFocusChime({ fundamental = 432, duration = 5.0, gain = 0.35 } = {}) {
  if (!sfx.isEnabled()) return null;
  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const userVolume = sfx.getVolume();
    const targetGain = Math.max(0, Math.min(1, gain * userVolume));

    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // Natural bell acoustic modes (fundamental + subtle beating + harmonic overtones)
    const modes = [
      { freq: fundamental, gain: 0.55, decay: duration },
      { freq: fundamental * 1.003, gain: 0.45, decay: duration * 0.95 }, // 1.3Hz acoustic beat
      { freq: fundamental * 2.76, gain: 0.22, decay: duration * 0.65 },  // Mode 2
      { freq: fundamental * 5.40, gain: 0.08, decay: duration * 0.40 },  // Mode 3 (shimmer)
    ];

    modes.forEach(({ freq, gain: modeGain, decay }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(modeGain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    });

    // Soft mallet strike transient
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(fundamental * 0.5, now);
    strikeGain.gain.setValueAtTime(0.25 * targetGain, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    strikeOsc.connect(strikeGain);
    strikeGain.connect(masterGain);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.04);

    return { ctx, now, duration };
  } catch (err) {
    console.warn('Acoustic Focus Chime playback error:', err);
    return null;
  }
}

/**
 * Play a peaceful higher-register chime when a session finishes (completion).
 */
export function playCompletionChime() {
  // 528 Hz - "Solfeggio frequency" of peace & clarity
  return playFocusChime({ fundamental: 528, duration: 6.0, gain: 0.40 });
}

/**
 * Play grounding start chime when beginning a focus session.
 */
export function playStartChime() {
  return playFocusChime({ fundamental: 432, duration: 5.0, gain: 0.35 });
}
