import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sfx, SOUND_PACKS, VIZ_PACK_MAP } from './sfx';

describe('UI SFX Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides 12 valid sound packs', () => {
    expect(SOUND_PACKS).toHaveLength(12);
    const packIds = SOUND_PACKS.map(p => p.id);
    expect(packIds).toContain('zen');
    expect(packIds).toContain('minimal');
    expect(packIds).toContain('scifi');
    expect(packIds).toContain('cinematic');
    expect(packIds).toContain('glass');
  });

  it('correctly maps visualizers to sound packs', () => {
    expect(VIZ_PACK_MAP.neuform).toBe('zen');
    expect(VIZ_PACK_MAP.quantum).toBe('scifi');
    expect(VIZ_PACK_MAP.launch).toBe('cinematic');
    expect(VIZ_PACK_MAP.nexus).toBe('minimal');
    expect(VIZ_PACK_MAP.globe).toBe('glass');
    expect(VIZ_PACK_MAP.bakf2).toBe('mechanical');
  });

  it('handles volume clamping and persistence', () => {
    sfx.setVolume(0.5);
    expect(sfx.getVolume()).toBe(0.5);

    sfx.setVolume(1.5);
    expect(sfx.getVolume()).toBe(1.0);

    sfx.setVolume(-0.2);
    expect(sfx.getVolume()).toBe(0.0);
  });

  it('handles enabling and disabling sound', () => {
    sfx.setEnabled(false);
    expect(sfx.isEnabled()).toBe(false);

    // Play should safely return null when disabled
    const result = sfx.play('start');
    expect(result).toBeNull();

    sfx.setEnabled(true);
    expect(sfx.isEnabled()).toBe(true);
  });

  it('updates sound pack adaptively on visualizer change', () => {
    sfx.setAdaptive(true);
    sfx.onVisualizerChange('quantum');
    expect(sfx.getPack()).toBe('scifi');

    sfx.onVisualizerChange('launch');
    expect(sfx.getPack()).toBe('cinematic');

    sfx.onVisualizerChange('neuform');
    expect(sfx.getPack()).toBe('zen');
  });
});
