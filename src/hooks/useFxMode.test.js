import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

let fpsQueue = [];
vi.mock('../utils/fxMode', async (orig) => {
  const real = await orig();
  return { ...real, measureFps: vi.fn(() => Promise.resolve(fpsQueue.length ? fpsQueue.shift() : 60)) };
});

const { default: useFxMode } = await import('./useFxMode');

const lite = () => document.documentElement.classList.contains('fx-lite');

describe('useFxMode', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    fpsQueue = [];
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.classList.remove('fx-lite');
  });

  const settle = async (ms) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  it('defaults to Auto, stays Full on a smooth device, and remembers a chosen mode', async () => {
    const { result } = renderHook(() => useFxMode());
    expect(result.current.mode).toBe('auto');
    await settle(3000);
    expect(lite()).toBe(false);

    act(() => result.current.setMode('lite'));
    expect(lite()).toBe(true);
    expect(JSON.parse(localStorage.getItem('fx_mode'))).toBe('lite');

    act(() => result.current.setMode('full'));
    expect(lite()).toBe(false);
    act(() => result.current.setMode('nonsense'));
    expect(result.current.mode).toBe('full');
  });

  it('switches Auto to Light after two slow samples in a row, not after one hiccup', async () => {
    fpsQueue = [28, 60, 30, 29];
    const { result } = renderHook(() => useFxMode());
    // samples run at 2.5 s, then 250 ms after a slow one, or 20 s after a good one
    await settle(2600); // t=2.5 s: slow
    expect(lite()).toBe(false);
    await settle(200); // t=2.75 s: fine again, so the count resets
    expect(lite()).toBe(false);
    await settle(20000); // t=22.75 s: slow
    expect(lite()).toBe(false);
    await settle(300); // t=23 s: slow again -> Light
    expect(lite()).toBe(true);
    expect(result.current.autoLite).toBe(true);
    expect(sessionStorage.getItem('zencus_fx_auto_lite')).toBe('1');
  });

  it('Full overrides a slow device, and a session that already chose Light starts Light', async () => {
    localStorage.setItem('fx_mode', JSON.stringify('full'));
    fpsQueue = [20, 20, 20];
    renderHook(() => useFxMode());
    await settle(25000);
    expect(lite()).toBe(false);

    document.documentElement.classList.remove('fx-lite');
    localStorage.setItem('fx_mode', JSON.stringify('auto'));
    sessionStorage.setItem('zencus_fx_auto_lite', '1');
    renderHook(() => useFxMode());
    expect(lite()).toBe(true);
  });
});
