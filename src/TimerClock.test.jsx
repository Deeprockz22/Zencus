import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

// The countdown is measured against the clock, so it stays right when JS timers
// are paused (background tab, or the iPhone app in the background) and matches
// the Dynamic Island, which iOS counts down by itself.
describe('Timer keeps real time', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
  });
  afterEach(() => vi.useRealTimers());

  it('catches up after time passes while the app was in the background', () => {
    render(<App />);
    act(() => { fireEvent.click(screen.getAllByRole('button', { name: /Start Focus/i })[0]); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(document.title).toMatch(/24:59/);

    // two minutes pass with every JS timer frozen (the app was backgrounded)…
    vi.setSystemTime(Date.now() + 120_000);
    // …and the moment it's visible again, the timer shows the real time left
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(document.title).toMatch(/22:59/);
  });
});
