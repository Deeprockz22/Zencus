import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./komorebiAudio', () => ({
  drip: vi.fn(),
  startPurr: vi.fn(),
  stopPurr: vi.fn(),
  purrHaptic: vi.fn(),
}));

import KomorebiWorld from './KomorebiWorld';
import { SPARROW_KEY } from './Sparrow';
import { drip, startPurr, stopPurr, purrHaptic } from './komorebiAudio';

const world = (container) => container.querySelector('.komorebi-world');

describe('KomorebiWorld', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); localStorage.removeItem(SPARROW_KEY); });
  afterEach(() => { vi.useRealTimers(); });

  it('tags <html> with .komorebi while mounted', () => {
    const { unmount } = render(<KomorebiWorld theme="komorebi" />);
    expect(document.documentElement.classList.contains('komorebi')).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains('komorebi')).toBe(false);
  });

  it('slides the sun with progress and holds the late light in a break', () => {
    const { container, rerender } = render(<KomorebiWorld theme="komorebi" progress={0.25} />);
    expect(world(container).style.getPropertyValue('--kw-sun')).toBe('0.2500');
    rerender(<KomorebiWorld theme="komorebi" progress={0.1} mode="shortBreak" />);
    expect(world(container).style.getPropertyValue('--kw-sun')).toBe('1.0000');
  });

  it('uses the moonlit room for komorebi-night', () => {
    const { container } = render(<KomorebiWorld theme="komorebi-night" />);
    expect(world(container).classList.contains('kw-night')).toBe(true);
  });

  it('drips into the basin during a running focus session, with sound only when enabled', () => {
    const { container, rerender } = render(<KomorebiWorld theme="komorebi" isRunning soundEnabled />);
    expect(container.querySelector('.kw-ripple')).toBeNull();
    act(() => { vi.advanceTimersByTime(14500); });
    expect(container.querySelector('.kw-ripple')).not.toBeNull();
    expect(drip).toHaveBeenCalled();

    drip.mockClear();
    rerender(<KomorebiWorld theme="komorebi" isRunning soundEnabled={false} />);
    act(() => { vi.advanceTimersByTime(30000); });
    expect(drip).not.toHaveBeenCalled();
  });

  it('purrs only in a running break with sound on, and stops after', () => {
    const { rerender, unmount } = render(<KomorebiWorld theme="komorebi" mode="work" isRunning soundEnabled />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(startPurr).not.toHaveBeenCalled();

    rerender(<KomorebiWorld theme="komorebi" mode="shortBreak" isRunning soundEnabled />);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(startPurr).toHaveBeenCalledTimes(1);

    rerender(<KomorebiWorld theme="komorebi" mode="shortBreak" isRunning={false} soundEnabled />);
    expect(stopPurr).toHaveBeenCalled();
    unmount();
  });

  it('a sparrow visits once a day while idle, finishes her visit, and not again that day', () => {
    const { container, rerender, unmount } = render(<KomorebiWorld theme="komorebi" />);
    expect(container.querySelector('.kw-sparrow')).toBeNull();
    act(() => { vi.advanceTimersByTime(2600); });
    expect(container.querySelector('.kw-sparrow.is-in')).not.toBeNull();
    // starting a session mid-visit doesn't freeze her
    rerender(<KomorebiWorld theme="komorebi" isRunning />);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(container.querySelector('.kw-sparrow')).toBeNull();
    unmount();

    const again = render(<KomorebiWorld theme="komorebi" />);
    act(() => { vi.advanceTimersByTime(20000); });
    expect(again.container.querySelector('.kw-sparrow')).toBeNull();
  });

  it('sleeps in focus, stretches when a session completes, then sits up for the break', () => {
    const { container, rerender } = render(<KomorebiWorld theme="komorebi" sessionsCompleted={2} />);
    expect(world(container).dataset.pose).toBe('asleep');
    rerender(<KomorebiWorld theme="komorebi" sessionsCompleted={3} mode="shortBreak" />);
    expect(world(container).dataset.pose).toBe('stretch');
    expect(purrHaptic).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(4300); });
    expect(world(container).dataset.pose).toBe('awake');
  });

  it('says "Drink water" in a short break, after her stretch, and only then', () => {
    const { container, rerender } = render(<KomorebiWorld theme="komorebi" sessionsCompleted={1} />);
    const say = () => container.querySelector('.kw-say');
    expect(say()).toBeNull();
    rerender(<KomorebiWorld theme="komorebi" sessionsCompleted={2} mode="shortBreak" />);
    expect(say()).toBeNull(); // not mid-stretch
    act(() => { vi.advanceTimersByTime(4300); });
    expect(say().textContent).toBe('Drink water');
    rerender(<KomorebiWorld theme="komorebi" sessionsCompleted={2} mode="longBreak" />);
    expect(say()).toBeNull();
    rerender(<KomorebiWorld theme="komorebi" sessionsCompleted={2} mode="work" />);
    expect(say()).toBeNull();
  });
});
