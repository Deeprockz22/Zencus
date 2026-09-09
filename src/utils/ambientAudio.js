/**
 * Procedural ambient sound generator using Web Audio API.
 * High-fidelity synthesis: Window Rain (crisp droplets on glass), Zen Rain, Deep Noise & Alpha Beats.
 * Zero external audio files or network requests required.
 */
class AmbientSoundscapes {
  constructor() {
    this.ctx = null;
    this.activeType = null;
    this.gainNode = null;
    this.volume = 0.35;

    // Node tracking for clean teardown
    this.activeSources = [];
    this.dropletInterval = null;
    this.lfoNode = null;
    this.clickBuffer = null;
    this.pinkBuffer = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
      } catch {
        this.gainNode.gain.value = this.volume;
      }
    }
  }

  stop() {
    if (this.dropletInterval) {
      clearInterval(this.dropletInterval);
      this.dropletInterval = null;
    }

    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {}
      this.lfoNode = null;
    }

    if (this.activeSources && this.activeSources.length > 0) {
      this.activeSources.forEach((src) => {
        try {
          if (typeof src.stop === 'function') src.stop();
          if (typeof src.disconnect === 'function') src.disconnect();
        } catch {}
      });
      this.activeSources = [];
    }

    this.activeType = null;
  }

  // Create a reusable stereo pink noise buffer (wide spatial rainfall texture)
  getPinkNoiseBuffer(duration = 4) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const output = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // Micro-transient click buffer to reproduce the instant physical impact of a drop hitting glass
  getClickBuffer() {
    if (this.clickBuffer) return this.clickBuffer;
    if (!this.ctx) return null;

    const sampleRate = this.ctx.sampleRate;
    const len = Math.floor(sampleRate * 0.03); // 30ms transient
    this.clickBuffer = this.ctx.createBuffer(1, len, sampleRate);
    const data = this.clickBuffer.getChannelData(0);

    for (let i = 0; i < len; i++) {
      // Fast exponential decay envelope on white noise
      const decay = Math.exp(-i / (sampleRate * 0.0035));
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    return this.clickBuffer;
  }

  createPanner(panValue = 0) {
    if (this.ctx && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, panValue));
      return panner;
    }
    return this.ctx.createGain(); // Fallback if stereo panner unavailable
  }

  /**
   * Triggers a single realistic raindrop striking window glass.
   * 100% acoustic noise-shaped water droplet (zero electronic synth tones).
   * Generates pure water impact tap + subtle water dispersion.
   */
  triggerWindowDroplet(time) {
    if (!this.ctx || this.activeType !== 'window-rain') return;

    // Stereo panning across window pane (-0.75 to +0.75)
    const panPos = (Math.random() * 1.5) - 0.75;
    const panner = this.createPanner(panPos);
    panner.connect(this.gainNode);

    // Droplet variety: 60% gentle/light, 30% medium, 10% soft heavy plop
    const r = Math.random();
    let bpFreq, decayTime, dropGain, lowFreq;

    if (r < 0.60) {
      // Gentle soft droplet tap
      bpFreq = 1600 + Math.random() * 700; // 1.6kHz - 2.3kHz
      decayTime = 0.016 + Math.random() * 0.012; // 16ms - 28ms
      dropGain = 0.11 + Math.random() * 0.07;
      lowFreq = null;
    } else if (r < 0.90) {
      // Medium water drop pat
      bpFreq = 1200 + Math.random() * 500; // 1.2kHz - 1.7kHz
      decayTime = 0.024 + Math.random() * 0.016; // 24ms - 40ms
      dropGain = 0.15 + Math.random() * 0.09;
      lowFreq = 420;
    } else {
      // Occasional heavier water droplet (soft thud on glass sill)
      bpFreq = 950 + Math.random() * 400;
      decayTime = 0.035 + Math.random() * 0.020; // 35ms - 55ms
      dropGain = 0.18 + Math.random() * 0.10;
      lowFreq = 280;
    }

    // 1. Water impact transient using shaped noise (pure acoustic water splatter)
    const sampleRate = this.ctx.sampleRate;
    const bufLen = Math.floor(sampleRate * (decayTime + 0.02));
    const noiseBuf = this.ctx.createBuffer(1, bufLen, sampleRate);
    const noiseData = noiseBuf.getChannelData(0);

    // Organic exponential decay envelope
    const decayConst = sampleRate * (decayTime * 0.35);
    for (let i = 0; i < bufLen; i++) {
      const white = (Math.random() * 2 - 1);
      noiseData[i] = white * Math.exp(-i / decayConst);
    }

    const dropSrc = this.ctx.createBufferSource();
    dropSrc.buffer = noiseBuf;

    // Resonant bandpass filter shaping the droplet's splash frequency
    const bpFilter = this.ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(bpFreq, time);
    bpFilter.Q.setValueAtTime(2.2, time);

    // Downward filter glide as the water droplet flattens on the glass pane
    bpFilter.frequency.exponentialRampToValueAtTime(Math.max(300, bpFreq * 0.65), time + decayTime);

    const ampGain = this.ctx.createGain();
    ampGain.gain.setValueAtTime(dropGain, time);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, time + decayTime + 0.01);

    dropSrc.connect(bpFilter);
    bpFilter.connect(ampGain);
    ampGain.connect(panner);

    // 2. Subtle low-end water mass body for medium/heavy drops
    if (lowFreq) {
      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(lowFreq, time);

      const lowGain = this.ctx.createGain();
      lowGain.gain.setValueAtTime(dropGain * 0.45, time);
      lowGain.gain.exponentialRampToValueAtTime(0.0001, time + decayTime + 0.02);

      dropSrc.connect(lowFilter);
      lowFilter.connect(lowGain);
      lowGain.connect(panner);
    }

    dropSrc.start(time);
    dropSrc.stop(time + decayTime + 0.03);

    dropSrc.onended = () => {
      try {
        dropSrc.disconnect();
        bpFilter.disconnect();
        ampGain.disconnect();
        panner.disconnect();
      } catch {}
    };
  }

  /**
   * WINDOW RAIN (Slow, Pure Acoustic Rain):
   * Relaxed, gentle rainfall against a window pane.
   * Pure acoustic water sound only — zero electronic synth tones.
   * Warm outdoor rain bed + slow, distinct, contemplative droplets tapping on the glass.
   */
  playWindowRain() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'window-rain';

    // 1. Lush, warm outdoor rain bed (soft rain outside the window)
    const pinkBuffer = this.getPinkNoiseBuffer(4);
    const rainBed = this.ctx.createBufferSource();
    rainBed.buffer = pinkBuffer;
    rainBed.loop = true;

    // Highpass to eliminate low indoor hum
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Soft lowpass filter to produce a natural, velvety rain wash outside glass
    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(4200, this.ctx.currentTime);

    // Gentle slow organic swell (0.08 Hz)
    const swell = this.ctx.createOscillator();
    swell.type = 'sine';
    swell.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(450, this.ctx.currentTime);
    swell.connect(swellGain);
    swellGain.connect(lpFilter.frequency);
    swell.start();
    this.lfoNode = swell;

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.26, this.ctx.currentTime);

    rainBed.connect(hpFilter);
    hpFilter.connect(lpFilter);
    lpFilter.connect(bedGain);
    bedGain.connect(this.gainNode);

    rainBed.start();
    this.activeSources.push(rainBed, hpFilter, lpFilter, swellGain, bedGain);

    // 2. Slow, relaxed window droplet scheduler
    // Runs at a slow cadence (~1 to 3 drops per second)
    const scheduleDroplets = () => {
      if (this.activeType !== 'window-rain') return;
      const now = this.ctx.currentTime;

      // 40% chance of a gentle drop, 25% chance of 2 drops, 35% quiet soothing wash
      const dice = Math.random();
      if (dice < 0.40) {
        // Single gentle droplet
        const offset = Math.random() * 0.12;
        this.triggerWindowDroplet(now + offset);
      } else if (dice < 0.65) {
        // Two spaced droplets
        const offset1 = Math.random() * 0.08;
        const offset2 = offset1 + 0.08 + Math.random() * 0.10;
        this.triggerWindowDroplet(now + offset1);
        this.triggerWindowDroplet(now + offset2);
      } else if (dice < 0.72) {
        // Occasional slow water trickle down the pane
        const offset = Math.random() * 0.06;
        this.triggerWindowDroplet(now + offset);
        this.triggerWindowDroplet(now + offset + 0.075);
      }
      // Otherwise quiet moment where you only hear the soft continuous outdoor rain bed
    };

    // Scheduled every 220ms (slow, organic, unhurried cadence)
    this.dropletInterval = setInterval(scheduleDroplets, 220);
  }

  /**
   * ZEN RAIN:
   * Deep, warm, gentle meditative rain shower in a tranquil garden.
   * Velvety stereo low-mid rain body with organic slow breeze undulation and soft far-field water drops.
   */
  playZenRain() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'zen-rain';

    // 1. Warm velvety stereo rain bed
    const pinkBuffer = this.getPinkNoiseBuffer(5);
    const rainBed = this.ctx.createBufferSource();
    rainBed.buffer = pinkBuffer;
    rainBed.loop = true;

    // Warm resonant lowpass filter
    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(820, this.ctx.currentTime);
    lpFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    // Gentle slow LFO (0.06 Hz) simulating natural peaceful wind swells
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime); // mod amplitude: 820Hz ± 180Hz

    lfo.connect(lfoGain);
    lfoGain.connect(lpFilter.frequency);
    lfo.start();
    this.lfoNode = lfo;

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.38, this.ctx.currentTime);

    rainBed.connect(lpFilter);
    lpFilter.connect(bedGain);
    bedGain.connect(this.gainNode);

    rainBed.start();
    this.activeSources.push(rainBed, lpFilter, lfoGain, bedGain);

    // 2. Far-field soft zen water drops (drops hitting lotus leaves / stone basins)
    const triggerZenDrop = (time) => {
      if (!this.ctx || this.activeType !== 'zen-rain') return;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const freq = 460 + Math.random() * 420;
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, time + 0.12);

      const dropGain = this.ctx.createGain();
      const peak = 0.08 + Math.random() * 0.07;
      dropGain.gain.setValueAtTime(0.0001, time);
      dropGain.gain.linearRampToValueAtTime(peak, time + 0.012); // Soft warm attack
      dropGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

      const panner = this.createPanner((Math.random() * 1.4) - 0.7);

      osc.connect(dropGain);
      dropGain.connect(panner);
      panner.connect(this.gainNode);

      osc.start(time);
      osc.stop(time + 0.16);

      osc.onended = () => {
        try {
          osc.disconnect();
          dropGain.disconnect();
          panner.disconnect();
        } catch {}
      };
    };

    // Trigger gentle sparse drops (3-5 drops per second)
    this.dropletInterval = setInterval(() => {
      if (this.activeType !== 'zen-rain') return;
      if (Math.random() < 0.65) {
        triggerZenDrop(this.ctx.currentTime + Math.random() * 0.15);
      }
    }, 220);
  }

  /**
   * Alias for backward compatibility
   */
  playRain() {
    this.playWindowRain();
  }

  /**
   * Deep White/Brown Noise for intense focus and masking distractions
   */
  playWhiteNoise() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    brownNoise.connect(filter);
    filter.connect(this.gainNode);
    brownNoise.start();

    this.activeSources.push(brownNoise, filter);
    this.activeType = 'whitenoise';
  }

  /**
   * 10Hz Binaural Alpha Waves for Flow State
   */
  playAlphaBeats() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const baseFreq = 210;
    const alphaFreq = 10;

    const merger = this.ctx.createChannelMerger(2);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + alphaFreq, this.ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(this.gainNode);

    oscL.start();
    oscR.start();

    this.activeSources.push(oscL, oscR, merger);
    this.activeType = 'alphabeats';
  }
}

export const ambientSoundscapes = new AmbientSoundscapes();
