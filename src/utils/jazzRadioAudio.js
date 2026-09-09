import { Storage } from './storage';

/**
 * Curated 24/7 Relaxing Jazz & Saxophone Radio Stations
 * Direct HTTPS, CORS-enabled audio streams from premier international jazz & sax broadcasters.
 */
export const JAZZ_STATIONS = [
  {
    id: 'sax-ella',
    name: 'Relaxing Saxophone Radio',
    shortName: 'Saxophone Radio',
    freq: '98.5 FM',
    category: 'Saxophone',
    city: 'Berlin / Europe',
    genre: 'Tenor & Alto Saxophone Ballads',
    url: 'https://stream.ella-radio.de/ella-saxophon-jazz/mp3-192/',
    badge: '🎷 SMOOTH SAX',
    bitrate: '192K HI-FI'
  },
  {
    id: 'sax-smooth',
    name: 'Velvet Sax & Smooth Jazz',
    shortName: 'Velvet Sax',
    freq: '104.1 FM',
    category: 'Saxophone',
    city: 'Zurich / Global',
    genre: 'Silky Smooth Sax & Midnight Chords',
    url: 'https://strm112.1.fm/smoothjazz_mobile_mp3',
    badge: '🎷 256K ULTRA',
    bitrate: '256K ULTRA'
  },
  {
    id: 'jazz24',
    name: 'Jazz24 Seattle',
    shortName: 'Jazz24',
    freq: '101.5 FM',
    category: 'Classic Jazz',
    city: 'Seattle / Tacoma',
    genre: 'Miles Davis, Coltrane & Bill Evans',
    url: 'https://knkx-live-a.edge.audiocdn.com/6285_128k',
    badge: '☕ COFFEEHOUSE',
    bitrate: '128K HI-FI'
  },
  {
    id: 'wrti',
    name: 'WRTI 90.1 FM',
    shortName: 'WRTI Jazz',
    freq: '90.1 FM',
    category: 'Classic Jazz',
    city: 'Philadelphia',
    genre: 'Late Night Coffeehouse Jazz & Blues',
    url: 'https://wrti-live.streamguys1.com/jazz-mp3',
    badge: '📻 PUBLIC RADIO',
    bitrate: '128K HI-FI'
  },
  {
    id: 'wbgo',
    name: 'WBGO 88.3 NYC',
    shortName: 'WBGO NYC',
    freq: '88.3 FM',
    category: 'Classic Jazz',
    city: 'New York City',
    genre: 'The Global Jazz Authority',
    url: 'https://ais-sa8.cdnstream1.com/3629_128.mp3',
    badge: '🏙️ NYC CLASSIC',
    bitrate: '128K HI-FI'
  },
  {
    id: 'vinyl-lofi',
    name: 'Vintage Vinyl Rhodes Jazz',
    shortName: 'Vinyl Rhodes',
    freq: 'ANALOG',
    category: 'Procedural',
    city: 'Analog Studio',
    genre: 'Rhodes 7th Chords & Vinyl Needle Crackle',
    url: 'procedural',
    badge: '🎧 OFFLINE READY',
    bitrate: 'ANALOG 33⅓'
  }
];

class JazzRadioService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isLoading = false;
    this.error = null;
    this.currentStationId = Storage.get('jazz_radio_station', 'sax-ella');
    this.volume = Storage.getNumber('jazz_radio_volume', 0.65);
    this.listeners = new Set();

    // Procedural Web Audio context for Offline Vinyl Lofi Jazz
    this.proceduralCtx = null;
    this.proceduralGain = null;
    this.chordInterval = null;
    this.noiseNode = null;
  }

  getStation() {
    return (
      JAZZ_STATIONS.find((s) => s.id === this.currentStationId) || JAZZ_STATIONS[0]
    );
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('JazzRadio listener error:', err);
      }
    });
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      currentStation: this.getStation(),
      volume: this.volume,
      error: this.error,
      stations: JAZZ_STATIONS
    };
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    Storage.set('jazz_radio_volume', this.volume);
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.proceduralGain && this.proceduralCtx) {
      this.proceduralGain.gain.setValueAtTime(this.volume * 0.4, this.proceduralCtx.currentTime);
    }
    this.notify();
  }

  async play(stationId = null) {
    if (stationId && stationId !== this.currentStationId) {
      this.stop();
      this.currentStationId = stationId;
      Storage.set('jazz_radio_station', stationId);
    }

    const station = this.getStation();
    this.error = null;
    this.isLoading = true;
    this.notify();

    if (station.url === 'procedural') {
      this.playProceduralVinylJazz();
      return;
    }

    try {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.preload = 'none';

        this.audio.addEventListener('playing', () => {
          this.isLoading = false;
          this.isPlaying = true;
          this.error = null;
          this.notify();
        });

        this.audio.addEventListener('waiting', () => {
          this.isLoading = true;
          this.notify();
        });

        this.audio.addEventListener('error', (e) => {
          console.warn('Jazz Radio stream error, trying fallback:', e);
          this.isLoading = false;
          this.isPlaying = false;
          this.error = 'Connecting to station...';
          this.notify();
        });
      }

      this.audio.src = station.url;
      this.audio.volume = this.volume;
      await this.audio.play();
      this.isPlaying = true;
      this.isLoading = false;
      this.notify();
    } catch (err) {
      console.warn('Playback error, trying procedural vinyl jazz:', err);
      this.isLoading = false;
      // If live stream is blocked, fallback to cozy procedural jazz
      this.playProceduralVinylJazz();
    }
  }

  pause() {
    this.stop();
  }

  toggle() {
    if (this.isPlaying || this.isLoading) {
      this.pause();
    } else {
      this.play();
    }
  }

  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.src = '';
      } catch (e) {
        // ignore
      }
    }
    this.stopProcedural();
    this.isPlaying = false;
    this.isLoading = false;
    this.notify();
  }

  selectStation(stationId) {
    const wasPlaying = this.isPlaying || this.isLoading;
    this.stop();
    this.currentStationId = stationId;
    Storage.set('jazz_radio_station', stationId);
    if (wasPlaying) {
      this.play(stationId);
    } else {
      this.notify();
    }
  }

  // ══════════════════════════════════════════════════════
  // PROCEDURAL COZY RHODES JAZZ + VINYL NOISE GENERATOR
  // ══════════════════════════════════════════════════════
  playProceduralVinylJazz() {
    this.stopProcedural();
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.proceduralCtx = new AudioCtx();
    if (this.proceduralCtx.state === 'suspended') {
      this.proceduralCtx.resume();
    }

    const ctx = this.proceduralCtx;
    this.proceduralGain = ctx.createGain();
    this.proceduralGain.gain.setValueAtTime(this.volume * 0.45, ctx.currentTime);
    this.proceduralGain.connect(ctx.destination);

    // 1. Vintage Vinyl Crackle & Surface Hiss
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.00035) {
        data[i] = (Math.random() * 2 - 1) * 0.65;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const vinylNoise = ctx.createBufferSource();
    vinylNoise.buffer = noiseBuffer;
    vinylNoise.loop = true;

    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(1400, ctx.currentTime);
    vinylFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    vinylNoise.connect(vinylFilter);
    vinylFilter.connect(this.proceduralGain);
    vinylNoise.start();
    this.noiseNode = vinylNoise;

    // 2. Warm Rhodes Electric Piano 7th/9th Jazz Chords Progression
    const chords = [
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [110.00, 130.81, 164.81, 196.00, 246.94], // Am9
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [98.00, 174.61, 246.94, 329.63]           // G13
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.proceduralCtx || this.proceduralCtx.state === 'closed') return;
      const now = this.proceduralCtx.currentTime;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const osc = this.proceduralCtx.createOscillator();
        const noteGain = this.proceduralCtx.createGain();
        const noteFilter = this.proceduralCtx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(750, now);
        noteFilter.frequency.exponentialRampToValueAtTime(320, now + 3.8);

        const startTime = now + i * 0.04;
        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.16 / notes.length, startTime + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.2);

        osc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(this.proceduralGain);

        osc.start(startTime);
        osc.stop(startTime + 4.5);
      });
    };

    playChord();
    this.chordInterval = setInterval(playChord, 4200);

    this.isPlaying = true;
    this.isLoading = false;
    this.notify();
  }

  stopProcedural() {
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.proceduralCtx) {
      try {
        this.proceduralCtx.close();
      } catch (e) {
        // ignore
      }
      this.proceduralCtx = null;
    }
  }
}

export const jazzRadio = new JazzRadioService();
