import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getThemeColor, updateTabProgressRing, restoreTabFavicon } from './tabProgress';

describe('Tab Progress Ring & Theme Color (#34)', () => {
  beforeEach(() => {
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico" />';
  });

  it('resolves appropriate accent color per theme and mode', () => {
    expect(getThemeColor('light', 'work')).toBe('#3b82f6');
    expect(getThemeColor('komorebi', 'work')).toBe('#4d7c0f');
    expect(getThemeColor('komorebi-night', 'work')).toBe('#a7f3d0');
    expect(getThemeColor('surreal', 'work')).toBe('#a855f7');
    expect(getThemeColor('lantern', 'work')).toBe('#f59e0b');
    expect(getThemeColor('komorebi', 'shortBreak')).toBe('#34d399');
  });

  it('restores original favicon when timer stops or unmounts', () => {
    const link = document.querySelector("link[rel*='icon']");
    link.setAttribute('href', '/favicon.ico');

    // Calling when not running restores or retains original
    updateTabProgressRing(0.5, 'work', 'komorebi', false);
    expect(link.getAttribute('href')).toBe('/favicon.ico');

    restoreTabFavicon();
    expect(link.getAttribute('href')).toBe('/favicon.ico');
  });
});
