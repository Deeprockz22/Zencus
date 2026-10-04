import { createUISFX, PACKS } from 'uisfx';
import { Storage } from './storage';
import { playStartChime, playCompletionChime } from './focusChime';

export const SOUND_PACKS = [
  { id: 'zen', name: 'Zen', desc: 'Pure tones, dry wood, washi detail', color: '#7d8f77' },
  { id: 'minimal', name: 'Minimal', desc: 'Dry, precise, almost invisible', color: '#e84d2a' },
  { id: 'soft', name: 'Soft', desc: 'Rounded felt, warm and reassuring', color: '#d47b83' },
  { id: 'glass', name: 'Glass', desc: 'Bright, crystalline, and premium', color: '#4c8ca5' },
  { id: 'arcade', name: 'Arcade', desc: 'Chunky pixels and cheerful voltage', color: '#7257d9' },
  { id: 'mechanical', name: 'Mechanical', desc: 'Switches, relays, and firm detents', color: '#68736f' },
  { id: 'organic', name: 'Organic', desc: 'Wood, water, breath, small stones', color: '#718b4e' },
  { id: 'dreamy', name: 'Dreamy', desc: 'Airy blooms, soft light, slow sparkle', color: '#a36cad' },
  { id: 'scifi', name: 'Sci-Fi', desc: 'Holographic pings, digital shimmer', color: '#20a29d' },
  { id: 'rubber', name: 'Rubber', desc: 'Tactile elastic taps with bounce', color: '#d99a24' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Deep impacts and quiet scale', color: '#3f5873' },
  { id: 'studio', name: 'Studio', desc: 'Tactile editing precision', color: '#6261a8' },
];

export const VIZ_PACK_MAP = {
  turntable: 'zen',
  globe: 'glass',
  minimal: 'minimal',
  neuform: 'zen',
  nexus: 'minimal',
  quantum: 'scifi',
  launch: 'cinematic',
  aura: 'dreamy',
  bakf2: 'mechanical',
};

class SFXManager {
  constructor() {
    this.player = null;
    this.isUnlocked = false;
    this.enabled = Storage.get('sfx_enabled', true);
    this.volume = Storage.getNumber('sfx_volume', 0.7);
    this.pack = Storage.get('sfx_pack', 'zen');
    this.adaptive = Storage.get('sfx_adaptive', true);

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    try {
      this.player = createUISFX({
        pack: this.pack,
        volume: this.volume,
        enabled: this.enabled,
        maxVoices: 8,
      });

      // Unlock on first real user gesture without blocking
      const unlockGesture = () => {
        if (!this.isUnlocked && this.player) {
          this.player.unlock().then((res) => {
            if (res) this.isUnlocked = true;
          }).catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockGesture);
        window.removeEventListener('keydown', unlockGesture);
      };

      window.addEventListener('pointerdown', unlockGesture, { passive: true, once: true });
      window.addEventListener('keydown', unlockGesture, { passive: true, once: true });
    } catch (err) {
      console.warn('Failed to initialize UI SFX player:', err);
    }
  }

  async unlock() {
    if (!this.player) return false;
    try {
      const ok = await this.player.unlock();
      if (ok) this.isUnlocked = true;
      return ok;
    } catch {
      return false;
    }
  }

  play(cue, options = {}) {
    if (!this.enabled || !this.player) return null;
    try {
      return this.player.play(cue, options);
    } catch (e) {
      console.warn('UI SFX play error:', e);
      return null;
    }
  }

  setPack(packName, persist = true) {
    if (!this.player) return;
    try {
      this.pack = packName;
      this.player.setPack(packName);
      if (persist) {
        Storage.set('sfx_pack', packName);
      }
    } catch (e) {
      console.warn('Error setting sound pack:', e);
    }
  }

  getPack() {
    return this.pack;
  }

  setVolume(vol) {
    if (!this.player) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    this.player.setVolume(clamped);
    Storage.set('sfx_volume', clamped);
  }

  getVolume() {
    return this.volume;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (this.player) {
      this.player.setEnabled(this.enabled);
      if (!this.enabled) {
        this.player.stopAll();
      }
    }
    Storage.set('sfx_enabled', this.enabled);
  }

  isEnabled() {
    return this.enabled;
  }

  setAdaptive(val) {
    this.adaptive = !!val;
    Storage.set('sfx_adaptive', this.adaptive);
  }

  isAdaptive() {
    return this.adaptive;
  }

  onVisualizerChange(vizType) {
    if (this.adaptive && VIZ_PACK_MAP[vizType]) {
      const targetPack = VIZ_PACK_MAP[vizType];
      if (targetPack !== this.pack) {
        this.setPack(targetPack, false); // temporary for the active visualizer
      }
    }
    this.play('select');
  }

  previewPack(packName) {
    this.setPack(packName, true);
    this.play('success');
  }

  stopAll() {
    if (this.player) {
      this.player.stopAll();
    }
  }

  // Semantic Shortcuts
  timerStart() {
    this.play('start');
    if (this.pack === 'zen' || this.pack === 'minimal' || this.pack === 'organic') {
      playStartChime();
    }
  }

  timerPause() {
    this.play('pause');
  }

  timerReset() {
    this.play('undo');
  }

  sessionComplete() {
    this.play('complete');
    playCompletionChime();
    setTimeout(() => {
      this.play('achievement');
    }, 280);
  }

  taskCheck() {
    this.play('check');
    setTimeout(() => {
      this.play('reward');
    }, 140);
  }

  taskUncheck() {
    this.play('uncheck');
  }

  taskAdd() {
    this.play('checkpoint');
  }

  taskDelete() {
    this.play('delete');
  }

  zenEnter() {
    this.play('expand');
  }

  zenExit() {
    this.play('collapse');
  }

  tabChange() {
    this.play('select');
  }

  modalOpen() {
    this.play('open');
  }

  modalClose() {
    this.play('close');
  }

  toggle(nextState) {
    this.play(nextState ? 'toggle-on' : 'toggle-off');
  }
}

export const sfx = new SFXManager();
