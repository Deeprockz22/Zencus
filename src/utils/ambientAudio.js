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
   * Includes glass resonant ping + transient impact click + stereo panning.
   */
  triggerWindowDroplet(time) {
    if (!this.ctx || this.activeType !== 'window-rain') return;

    // Categorize drop characteristics
    const r = Math.random();
    let baseFreq, decay, peakGain, dropType;

    if (r < 0.52) {
      // Light crisp droplet (high glass 'tink')
      baseFreq = 2600 + Math.random() * 900;
      decay = 0.022 + Math.random() * 0.015;
      peakGain = 0.14 + Math.random() * 0.12;
      dropType = 'light';
    } else if (r < 0.84) {
      // Medium raindrop (resonant glass 'plink')
      baseFreq = 1800 + Math.random() * 700;
      decay = 0.035 + Math.random() * 0.022;
      peakGain = 0.20 + Math.random() * 0.15;
      dropType = 'medium';
    } else {
      // Heavy drop (fat water splatter with lower glass thud)
      baseFreq = 1200 + Math.random() * 550;
      decay = 0.050 + Math.random() * 0.025;
      peakGain = 0.24 + Math.random() * 0.16;
      dropType = 'heavy';
    }

    // Window pane stereo positioning: left to right (-0.85 to +0.85)
    const panPos = (Math.random() * 1.7) - 0.85;
    const panner = this.createPanner(panPos);
    panner.connect(this.gainNode);

    // 1. Resonant glass tone with downwards frequency sweep as droplet flattens on glass
    const osc = this.ctx.createOscillator();
    osc.type = dropType === 'heavy' ? 'triangle' : (Math.random() > 0.4 ? 'sine' : 'triangle');
    osc.frequency.setValueAtTime(baseFreq, time);
    // Pitch glides down by 18-28% during impact
    osc.frequency.exponentialRampToValueAtTime(Math.max(200, baseFreq * 0.76), time + decay);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, time);
    oscGain.gain.linearRampToValueAtTime(peakGain, time + 0.001); // Instant attack
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

    osc.connect(oscGain);
    oscGain.connect(panner);

    osc.start(time);
    osc.stop(time + decay + 0.02);

    // 2. Micro-transient click (crisp initial contact of drop with rigid glass)
    const clickBuf = this.getClickBuffer();
    if (clickBuf) {
      const clickSrc = this.ctx.createBufferSource();
      clickSrc.buffer = clickBuf;

      const clickFilter = this.ctx.createBiquadFilter();
      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(dropType === 'heavy' ? 2400 : 3800, time);

      const clickGain = this.ctx.createGain();
      const cGain = peakGain * (dropType === 'heavy' ? 0.8 : 0.6);
      clickGain.gain.setValueAtTime(cGain, time);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(panner);

      clickSrc.start(time);
      clickSrc.stop(time + 0.025);

      // Clean up nodes once drop completes
      osc.onended = () => {
        try {
          osc.disconnect();
          oscGain.disconnect();
          clickSrc.disconnect();
          clickFilter.disconnect();
          clickGain.disconnect();
          panner.disconnect();
        } catch {}
      };
    } else {
      osc.onended = () => {
        try {
          osc.disconnect();
          oscGain.disconnect();
          panner.disconnect();
        } catch {}
      };
    }
  }

  /**
   * WINDOW RAIN (Regular / Window Rain):
   * Ultra-realistic rainfall right against a window pane.
   * Soft continuous outdoor rain hiss + distinct, clear droplets tapping directly on the glass.
   */
  playWindowRain() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'window-rain';

    // 1. Background outdoor rain wash through window
    const pinkBuffer = this.getPinkNoiseBuffer(4);
    const rainBed = this.ctx.createBufferSource();
    rainBed.buffer = pinkBuffer;
    rainBed.loop = true;

    // Highpass to eliminate low indoor rumble
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(480, this.ctx.currentTime);

    // Bandpass / peaking filter for exterior rain spray
    const bpFilter = this.ctx.createBiquadFilter();
    bpFilter.type = 'peaking';
    bpFilter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    bpFilter.gain.setValueAtTime(3, this.ctx.currentTime);
    bpFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

    // Lowpass to roll off harsh frequencies above 8kHz
    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(7500, this.ctx.currentTime);

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

    rainBed.connect(hpFilter);
    hpFilter.connect(bpFilter);
    bpFilter.connect(lpFilter);
    lpFilter.connect(bedGain);
    bedGain.connect(this.gainNode);

    rainBed.start();
    this.activeSources.push(rainBed, hpFilter, bpFilter, lpFilter, bedGain);

    // 2. Window pane droplet impact scheduler
    // Runs an irregular Poisson-like schedule (14 to 22 droplet impacts per second)
    const scheduleDroplets = () => {
      if (this.activeType !== 'window-rain') return;
      const now = this.ctx.currentTime;
      // Schedule 1 to 3 drops in the upcoming 60ms window
      const count = Math.random() < 0.25 ? 0 : (Math.random() < 0.7 ? 1 : 2);

      for (let i = 0; i < count; i++) {
        const offset = Math.random() * 0.055;
        this.triggerWindowDroplet(now + offset);

        // Occasional double-drop (drip trickle down the glass)
        if (Math.random() < 0.08) {
          this.triggerWindowDroplet(now + offset + 0.032);
        }
      }
    };

    this.dropletInterval = setInterval(scheduleDroplets, 55);
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
