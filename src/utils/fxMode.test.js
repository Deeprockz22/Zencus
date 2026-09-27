import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { shouldAutoLite, applyFxLite, isFxLite, useFxLite, FX_EVENT, LOW_FPS } from './fxMode';

afterEach(() => document.documentElement.classList.remove('fx-lite'));

describe('shouldAutoLite', () => {
  it('chooses Light when the page cannot hold a smooth frame rate', () => {
    expect(shouldAutoLite({ fps: 30 })).toBe(true); // Chrome Energy Saver's cap
    expect(shouldAutoLite({ fps: LOW_FPS - 1 })).toBe(true);
    expect(shouldAutoLite({ fps: 58 })).toBe(false);
    expect(shouldAutoLite({ fps: 120 })).toBe(false);
  });

  it('chooses Light on a low battery that is not charging, not on a charging one', () => {
    expect(shouldAutoLite({ battery: { charging: false, level: 0.15 } })).toBe(true);
    expect(shouldAutoLite({ battery: { charging: true, level: 0.15 } })).toBe(false);
    expect(shouldAutoLite({ battery: { charging: false, level: 0.8 } })).toBe(false);
  });

  it('chooses Light on very low-end devices, and ignores missing signals', () => {
    expect(shouldAutoLite({ cores: 2 })).toBe(true);
    expect(shouldAutoLite({ memory: 1 })).toBe(true);
    expect(shouldAutoLite({ cores: 8, memory: 8 })).toBe(false);
    expect(shouldAutoLite({})).toBe(false);
    expect(shouldAutoLite()).toBe(false);
  });
});

describe('applyFxLite / useFxLite', () => {
  it('toggles html.fx-lite and tells subscribers, once per change', () => {
    const heard = vi.fn();
    window.addEventListener(FX_EVENT, heard);
    const { result } = renderHook(() => useFxLite());
    expect(result.current).toBe(false);

    act(() => applyFxLite(true));
    expect(isFxLite()).toBe(true);
    expect(result.current).toBe(true);

    act(() => applyFxLite(true)); // no change, no event
    expect(heard).toHaveBeenCalledTimes(1);

    act(() => applyFxLite(false));
    expect(result.current).toBe(false);
    expect(heard).toHaveBeenCalledTimes(2);
    window.removeEventListener(FX_EVENT, heard);
  });
});
