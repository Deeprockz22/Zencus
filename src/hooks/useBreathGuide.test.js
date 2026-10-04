import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBreathGuide, { calculateBreathState, TOTAL_CYCLE_DURATION, BREATH_PHASES } from './useBreathGuide';

describe('useBreathGuide Foundation (#29)', () => {
  it('identifies inhale phase during 0 - 4s and smoothly expands scale', () => {
    const start = calculateBreathState(0);
    expect(start.phase).toBe(BREATH_PHASES.INHALE.id);
    expect(start.label).toBe('Breathe in');
    expect(start.scale).toBe(1.0);

    const midInhale = calculateBreathState(2);
    expect(midInhale.phase).toBe(BREATH_PHASES.INHALE.id);
    expect(midInhale.scale).toBeGreaterThan(1.0);
    expect(midInhale.scale).toBeLessThan(1.35);

    const endInhale = calculateBreathState(3.99);
    expect(endInhale.phase).toBe(BREATH_PHASES.INHALE.id);
    expect(endInhale.scale).toBeCloseTo(1.35, 1);
  });

  it('identifies hold phase during 4 - 8s and maintains expanded scale', () => {
    const hold = calculateBreathState(5);
    expect(hold.phase).toBe(BREATH_PHASES.HOLD_IN.id);
    expect(hold.label).toBe('Hold');
    expect(hold.scale).toBe(1.35);
  });

  it('identifies exhale phase during 8 - 12s and smoothly contracts scale', () => {
    const exhale = calculateBreathState(10);
    expect(exhale.phase).toBe(BREATH_PHASES.EXHALE.id);
    expect(exhale.label).toBe('Breathe out');
    expect(exhale.scale).toBeLessThan(1.35);
    expect(exhale.scale).toBeGreaterThan(1.0);
  });

  it('identifies rest phase during 12 - 16s and maintains resting scale', () => {
    const rest = calculateBreathState(14);
    expect(rest.phase).toBe(BREATH_PHASES.HOLD_OUT.id);
    expect(rest.label).toBe('Rest');
    expect(rest.scale).toBe(1.0);
  });

  it('loops seamlessly around the 16s cycle boundary', () => {
    const loop = calculateBreathState(TOTAL_CYCLE_DURATION + 2);
    expect(loop.phase).toBe(BREATH_PHASES.INHALE.id);
    expect(loop.scale).toBeGreaterThan(1.0);
  });
});

describe('useBreathGuide hook (state only moves at phase boundaries)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('walks in → hold → out → rest every 4 s, and re-renders once per phase, not per frame', () => {
    let renders = 0;
    const { result } = renderHook(() => { renders += 1; return useBreathGuide(true); });
    expect(result.current.phase).toBe('inhale');
    const base = renders;
    for (const expected of ['hold_in', 'exhale', 'hold_out', 'inhale']) {
      act(() => { vi.advanceTimersByTime(4000); });
      expect(result.current.phase).toBe(expected);
    }
    expect(renders - base).toBe(4);
  });

  it('starts over at "Breathe in" when it is switched off and on', () => {
    const { result, rerender } = renderHook(({ on }) => useBreathGuide(on), { initialProps: { on: true } });
    act(() => { vi.advanceTimersByTime(9000); });
    expect(result.current.phase).toBe('exhale');
    rerender({ on: false });
    expect(result.current.phase).toBe('inhale');
  });

  it('catches up to the true phase when a throttled tab wakes (timers sleep, the clock does not)', () => {
    const { result } = renderHook(() => useBreathGuide(true));
    // the tab is hidden: the browser stops firing the interval, but 41 s really pass
    vi.setSystemTime(Date.now() + 41_000);          // 41 mod 16 = 9 → exhale
    act(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.phase).toBe('exhale');
    expect(result.current.phase).toBe(calculateBreathState(41).phase);
  });
});
