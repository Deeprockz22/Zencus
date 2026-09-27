import { describe, it, expect, vi, afterEach } from 'vitest';
import { hideSplash } from './splash';

describe('hideSplash', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.__splashAt;
    document.body.innerHTML = '';
  });

  it('keeps the splash for the minimum time after it went up, then fades and removes it', () => {
    vi.useFakeTimers();
    window.__splashAt = 150; // the splash appeared 150 ms into the page load
    vi.spyOn(performance, 'now').mockReturnValue(350); // the app is ready 200 ms later
    document.body.innerHTML = '<div id="splash"></div>';
    hideSplash(1000);
    vi.advanceTimersByTime(799); // 150 + 1000 - 350 = 800 ms still to go
    expect(document.getElementById('splash').classList.contains('is-leaving')).toBe(false);
    vi.advanceTimersByTime(1);
    expect(document.getElementById('splash').classList.contains('is-leaving')).toBe(true);
    vi.advanceTimersByTime(400);
    expect(document.getElementById('splash')).toBeNull();
  });

  it('leaves at once when loading already took longer than the minimum', () => {
    vi.useFakeTimers();
    window.__splashAt = 100;
    vi.spyOn(performance, 'now').mockReturnValue(2500);
    document.body.innerHTML = '<div id="splash"></div>';
    hideSplash(1000);
    vi.advanceTimersByTime(0);
    expect(document.getElementById('splash').classList.contains('is-leaving')).toBe(true);
  });

  it('does nothing when there is no splash', () => {
    expect(() => hideSplash()).not.toThrow();
  });
});
