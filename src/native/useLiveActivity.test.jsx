import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const plugin = vi.hoisted(() => ({
  start: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  end: vi.fn(() => Promise.resolve()),
}));
vi.mock('@capacitor/core', () => ({
  registerPlugin: () => plugin,
  Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' },
}));

import useLiveActivity from './useLiveActivity';

const base = { isRunning: false, mode: 'work', timeLeft: 1500, totalDuration: 1500, taskTitle: 'Write intro' };

describe('useLiveActivity (Dynamic Island)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts on Start, stays quiet while ticking, shows pause, resumes, and ends on reset', () => {
    const { rerender } = renderHook((p) => useLiveActivity(p), { initialProps: base });
    expect(plugin.start).not.toHaveBeenCalled(); // nothing before the session starts

    rerender({ ...base, isRunning: true });
    expect(plugin.start).toHaveBeenCalledWith(expect.objectContaining({ mode: 'work', remaining: 1500, total: 1500, taskTitle: 'Write intro', isRunning: true }));
    expect(plugin.start.mock.calls[0][0].endsAt).toBeGreaterThan(Date.now());

    // the countdown itself runs in iOS: no calls per second
    rerender({ ...base, isRunning: true, timeLeft: 1499 });
    rerender({ ...base, isRunning: true, timeLeft: 1498 });
    expect(plugin.update).not.toHaveBeenCalled();

    rerender({ ...base, isRunning: false, timeLeft: 1200 });
    expect(plugin.update).toHaveBeenLastCalledWith(expect.objectContaining({ isRunning: false, remaining: 1200 }));

    rerender({ ...base, isRunning: true, timeLeft: 1200 });
    expect(plugin.update).toHaveBeenLastCalledWith(expect.objectContaining({ isRunning: true, remaining: 1200 }));
    expect(plugin.start).toHaveBeenCalledTimes(1);

    rerender({ ...base, isRunning: false, timeLeft: 1500 }); // reset
    expect(plugin.end).toHaveBeenCalledTimes(1);
  });

  it('switches to the break when a running session rolls over', () => {
    const { rerender } = renderHook((p) => useLiveActivity(p), { initialProps: { ...base, isRunning: true } });
    rerender({ ...base, isRunning: true, mode: 'shortBreak', timeLeft: 300, totalDuration: 300 });
    expect(plugin.update).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'shortBreak', total: 300, isRunning: true }));
  });

  it('does nothing on the web', () => {
    const { rerender } = renderHook((p) => useLiveActivity(p, false), { initialProps: base });
    rerender({ ...base, isRunning: true });
    expect(plugin.start).not.toHaveBeenCalled();
  });

  it("hands the island the app's own end time, so both count to the same moment", () => {
    const endsAtRef = { current: 1_900_000_000_000 };
    const { rerender } = renderHook((p) => useLiveActivity(p), { initialProps: { ...base, endsAtRef } });
    rerender({ ...base, endsAtRef, isRunning: true });
    expect(plugin.start).toHaveBeenCalledWith(expect.objectContaining({ endsAt: 1_900_000_000_000 }));
  });
});
