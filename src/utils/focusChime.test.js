import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playFocusChime, playStartChime, playCompletionChime } from './focusChime';
import { sfx } from './sfx';

describe('focusChime utility', () => {
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      currentTime: 10,
      state: 'running',
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      destination: {},
    };

    window.AudioContext = vi.fn(function () {
      return mockCtx;
    });
    sfx.setEnabled(true);
    sfx.setVolume(0.8);
  });

  it('synthesizes bell chime when sfx is enabled', () => {
    const res = playFocusChime({ fundamental: 432, duration: 4.0 });
    expect(res).not.toBeNull();
    expect(res.duration).toBe(4.0);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();
  });

  it('does not play when sfx is disabled', () => {
    sfx.setEnabled(false);
    const res = playFocusChime();
    expect(res).toBeNull();
  });

  it('calls playFocusChime with 432Hz on playStartChime', () => {
    const res = playStartChime();
    expect(res).not.toBeNull();
  });

  it('calls playFocusChime with 528Hz on playCompletionChime', () => {
    const res = playCompletionChime();
    expect(res).not.toBeNull();
  });
});
