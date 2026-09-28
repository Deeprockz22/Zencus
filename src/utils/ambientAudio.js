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

  triggerCampfireCrackle(time) {
    if (!this.ctx || this.activeType !== 'campfire') return;

    const crackleLen = 0.018 + Math.random() * 0.05;
    const sampleRate = this.ctx.sampleRate;
    const crackleBuffer = this.ctx.createBuffer(1, Math.floor(sampleRate * crackleLen), sampleRate);
    const data = crackleBuffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const env = Math.exp(-i / (sampleRate * (0.003 + Math.random() * 0.004)));
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = crackleBuffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1400 + Math.random() * 2200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.09, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + crackleLen + 0.01);

    const panner = this.createPanner((Math.random() * 1.2) - 0.6);
    src.connect(hp);
    hp.connect(gain);
    gain.connect(panner);
    panner.connect(this.gainNode);

    src.start(time);
    src.stop(time + crackleLen + 0.02);
    src.onended = () => {
      try {
        src.disconnect();
        hp.disconnect();
        gain.disconnect();
        panner.disconnect();
      } catch {}
    };
  }

  playCampfire() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'campfire';

    const pinkBuffer = this.getPinkNoiseBuffer(4);
    const emberBed = this.ctx.createBufferSource();
    emberBed.buffer = pinkBuffer;
    emberBed.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(120, this.ctx.currentTime);

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    emberBed.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(bedGain);
    bedGain.connect(this.gainNode);

    emberBed.start();
    this.activeSources.push(emberBed, lowpass, highpass, bedGain);

    this.dropletInterval = setInterval(() => {
      if (this.activeType !== 'campfire') return;
      const now = this.ctx.currentTime;
      if (Math.random() < 0.62) this.triggerCampfireCrackle(now + Math.random() * 0.08);
      if (Math.random() < 0.18) this.triggerCampfireCrackle(now + 0.03 + Math.random() * 0.09);
    }, 170);
  }

  playForestBirdsong() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'forest';

    const pinkBuffer = this.getPinkNoiseBuffer(5);
    const windBed = this.ctx.createBufferSource();
    windBed.buffer = pinkBuffer;
    windBed.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(540, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(0.6, this.ctx.currentTime);

    const windLfo = this.ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.045, this.ctx.currentTime);
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();
    this.lfoNode = windLfo;

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.13, this.ctx.currentTime);

    windBed.connect(windFilter);
    windFilter.connect(bedGain);
    bedGain.connect(this.gainNode);
    windBed.start();

    this.activeSources.push(windBed, windFilter, windLfoGain, bedGain);

    const triggerBirdChirp = (time) => {
      if (!this.ctx || this.activeType !== 'forest') return;
      const chirp = this.ctx.createOscillator();
      chirp.type = 'triangle';
      const base = 1900 + Math.random() * 1700;
      chirp.frequency.setValueAtTime(base, time);
      chirp.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.35), time + 0.05);
      chirp.frequency.exponentialRampToValueAtTime(base * 0.9, time + 0.13);

      const chirpGain = this.ctx.createGain();
      chirpGain.gain.setValueAtTime(0.0001, time);
      chirpGain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.05, time + 0.012);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

      const panner = this.createPanner((Math.random() * 1.6) - 0.8);
      chirp.connect(chirpGain);
      chirpGain.connect(panner);
      panner.connect(this.gainNode);

      chirp.start(time);
      chirp.stop(time + 0.17);
      chirp.onended = () => {
        try {
          chirp.disconnect();
          chirpGain.disconnect();
          panner.disconnect();
        } catch {}
      };
    };

    this.dropletInterval = setInterval(() => {
      if (this.activeType !== 'forest') return;
      if (Math.random() < 0.36) triggerBirdChirp(this.ctx.currentTime + Math.random() * 0.2);
      if (Math.random() < 0.12) triggerBirdChirp(this.ctx.currentTime + 0.08 + Math.random() * 0.2);
    }, 620);
  }

  playCoffeeShop() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'coffee-shop';

    const pinkBuffer = this.getPinkNoiseBuffer(4);
    const murmurBed = this.ctx.createBufferSource();
    murmurBed.buffer = pinkBuffer;
    murmurBed.loop = true;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(520, this.ctx.currentTime);
    bp.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, this.ctx.currentTime);

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    murmurBed.connect(bp);
    bp.connect(lp);
    lp.connect(bedGain);
    bedGain.connect(this.gainNode);
    murmurBed.start();

    this.activeSources.push(murmurBed, bp, lp, bedGain);

    const triggerCafeClink = (time) => {
      if (!this.ctx || this.activeType !== 'coffee-shop') return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const f = 900 + Math.random() * 1800;
      osc.frequency.setValueAtTime(f, time);
      osc.frequency.exponentialRampToValueAtTime(f * 1.8, time + 0.03);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.025 + Math.random() * 0.03, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

      const panner = this.createPanner((Math.random() * 1.4) - 0.7);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.gainNode);

      osc.start(time);
      osc.stop(time + 0.1);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
          panner.disconnect();
        } catch {}
      };
    };

    this.dropletInterval = setInterval(() => {
      if (this.activeType !== 'coffee-shop') return;
      if (Math.random() < 0.28) triggerCafeClink(this.ctx.currentTime + Math.random() * 0.18);
      if (Math.random() < 0.1) triggerCafeClink(this.ctx.currentTime + 0.1 + Math.random() * 0.2);
    }, 540);
  }

  playOceanWaves() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.activeType = 'ocean';

    const pinkBuffer = this.getPinkNoiseBuffer(6);
    const surfBed = this.ctx.createBufferSource();
    surfBed.buffer = pinkBuffer;
    surfBed.loop = true;

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1450, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.09, this.ctx.currentTime);

    const waveLfo = this.ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.setValueAtTime(0.09, this.ctx.currentTime);
    const waveLfoGain = this.ctx.createGain();
    waveLfoGain.gain.setValueAtTime(0.11, this.ctx.currentTime);
    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(waveGain.gain);
    waveLfo.start();
    this.lfoNode = waveLfo;

    surfBed.connect(lp);
    lp.connect(waveGain);
    waveGain.connect(this.gainNode);
    surfBed.start();
    this.activeSources.push(surfBed, lp, waveGain, waveLfoGain);

    const triggerWaveShore = (time) => {
      if (!this.ctx || this.activeType !== 'ocean') return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.getPinkNoiseBuffer(1);

      const hpf = this.ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(420, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.1, time + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.5);

      src.connect(hpf);
      hpf.connect(gain);
      gain.connect(this.gainNode);

      src.start(time);
      src.stop(time + 1.6);
      src.onended = () => {
        try {
          src.disconnect();
          hpf.disconnect();
          gain.disconnect();
        } catch {}
      };
    };

    this.dropletInterval = setInterval(() => {
      if (this.activeType !== 'ocean') return;
      if (Math.random() < 0.55) triggerWaveShore(this.ctx.currentTime + Math.random() * 0.5);
    }, 1100);
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
