/*
 * Komorebi sound: everything is synthesised with Web Audio (no samples, no
 * licences).
 *
 *  · drip()  — a suikinkutsu note: a water drop falls into the buried pot
 *              and rings. A pentatonic, bell-like tone (a few inharmonic
 *              partials, fast attack, long exponential tail), a short
 *              band-passed splash on top, and a faint delayed echo for the
 *              cavity of the pot.
 *  · purr    — the calico's purr, audible on laptop speakers: small speakers
 *              roll off below ~130–200 Hz, so instead of a 25 Hz tone we
 *              pulse band-limited noise around 240 Hz at a 25 Hz rate (the
 *              purr's rhythm), breathing in and out every ~2 s.
 *
 * Nothing plays until the page has had a user gesture (browser autoplay
 * rules); callers decide *when* (sound toggle, focus vs break).
 */

let ctx = null;
let master = null;

function audio() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// a gentle pentatonic set (Hz) so consecutive drops never clash
const DRIP_NOTES = [784, 880, 1046.5, 1174.7, 1318.5, 1568];

export function drip(volume = 0.16) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  const f0 = DRIP_NOTES[Math.floor(Math.random() * DRIP_NOTES.length)];

  const out = ac.createGain();
  out.gain.value = volume;
  out.connect(master);

  // bell body: a few inharmonic partials, each with its own decay
  [[1, 1, 2.2], [2.76, 0.35, 1.2], [5.4, 0.12, 0.6]].forEach(([ratio, amp, decay]) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f0 * ratio, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * ratio * 0.985, t + decay); // a hint of pitch sag, like water
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  });

  // the splash: 40 ms of band-passed noise
  const len = Math.floor(ac.sampleRate * 0.04);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400;
  bp.Q.value = 1.4;
  const ng = ac.createGain();
  ng.gain.value = 0.25;
  noise.connect(bp).connect(ng).connect(out);
  noise.start(t);

  // the pot's cavity: one soft, filtered echo
  const delay = ac.createDelay(1);
  delay.delayTime.value = 0.19;
  const fb = ac.createGain();
  fb.gain.value = 0.28;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1800;
  out.connect(delay);
  delay.connect(lp).connect(fb).connect(master);
  setTimeout(() => { try { out.disconnect(); delay.disconnect(); } catch { /* already gone */ } }, 4000);
}

let purrNodes = null;

export function startPurr(volume = 0.12) {
  const ac = audio();
  if (!ac || purrNodes) return;
  const t = ac.currentTime;

  // looping noise bed
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 240;
  bp.Q.value = 2.2;

  // 25 Hz pulse = the purr's rhythm
  const pulse = ac.createGain();
  pulse.gain.value = 0.5;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 25;
  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 0.5;
  lfo.connect(lfoDepth).connect(pulse.gain);

  // breathing: in and out every ~2.2 s
  const breath = ac.createGain();
  breath.gain.value = 0.6;
  const br = ac.createOscillator();
  br.frequency.value = 1 / 2.2;
  const brDepth = ac.createGain();
  brDepth.gain.value = 0.4;
  br.connect(brDepth).connect(breath.gain);

  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(volume, t + 1.5); // fade in

  src.connect(bp).connect(pulse).connect(breath).connect(out).connect(master);
  src.start(t);
  lfo.start(t);
  br.start(t);
  purrNodes = { src, lfo, br, out };
}

export function stopPurr() {
  if (!purrNodes || !ctx) return;
  const { src, lfo, br, out } = purrNodes;
  purrNodes = null;
  const t = ctx.currentTime;
  out.gain.cancelScheduledValues(t);
  out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); // fade out
  [src, lfo, br].forEach((n) => { try { n.stop(t + 1.3); } catch { /* not started */ } });
}

export const isPurring = () => !!purrNodes;

/** A purr you can feel: short pulses on Android phones (iOS Safari ignores vibrate). */
export function purrHaptic() {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  if (!window.matchMedia?.('(pointer: coarse)').matches) return false;
  const pattern = [];
  for (let i = 0; i < 18; i++) pattern.push(15, 35); // ~0.9 s of 15 ms on / 35 ms off
  return navigator.vibrate(pattern);
}
