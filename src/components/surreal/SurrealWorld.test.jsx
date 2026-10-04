import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import SurrealWorld, { sunSetAmount } from './SurrealWorld';
import { gazeOffset, GAZE_REACH } from './gaze';

const eyeRect = { left: 1000, top: 200, width: 200, height: 110 }; // centre (1100, 255)

describe('False Mirror gaze', () => {
  it('looks toward the pointer, relative to where the eye is', () => {
    const left = gazeOffset(eyeRect, 700, 255); // left of the eye, right of screen centre
    expect(left.x).toBeLessThan(0);
    expect(Math.abs(left.y)).toBeLessThan(1e-9);

    const below = gazeOffset(eyeRect, 1100, 800);
    expect(below.y).toBeGreaterThan(0);
    expect(Math.abs(below.x)).toBeLessThan(1e-9);

    const upRight = gazeOffset(eyeRect, 1400, 0);
    expect(upRight.x).toBeGreaterThan(0);
    expect(upRight.y).toBeLessThan(0);
  });

  it('looks straight ahead when the pointer is on the eye, and never leaves the socket', () => {
    expect(gazeOffset(eyeRect, 1100, 255)).toEqual({ x: 0, y: 0 });
    const near = gazeOffset(eyeRect, 1120, 255);
    const far = gazeOffset(eyeRect, 5000, 255);
    expect(near.x).toBeGreaterThan(0);
    expect(near.x).toBeLessThan(far.x);
    for (const [x, y] of [[-5000, -5000], [5000, 5000], [1100, -9000], [-9000, 255]]) {
      const g = gazeOffset(eyeRect, x, y);
      expect((g.x / GAZE_REACH.x) ** 2 + (g.y / GAZE_REACH.y) ** 2).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe('SurrealWorld eye', () => {
  afterEach(() => vi.restoreAllMocks());

  it('turns the iris toward the pointer and back to centre when it leaves the window', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0; });
    const { container } = render(<SurrealWorld theme="surreal" />);
    const eye = container.querySelector('.sw-obj-eye');
    eye.getBoundingClientRect = () => ({ ...eyeRect, right: 1200, bottom: 310, x: 1000, y: 200 });

    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 300, clientY: 700 }));
    });
    expect(parseFloat(eye.style.getPropertyValue('--sw-gx'))).toBeLessThan(0);
    expect(parseFloat(eye.style.getPropertyValue('--sw-gy'))).toBeGreaterThan(0);

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: null }));
    });
    expect(parseFloat(eye.style.getPropertyValue('--sw-gx'))).toBe(0);
    expect(parseFloat(eye.style.getPropertyValue('--sw-gy'))).toBe(0);

    // a tap (no hover on phones) draws the gaze too
    act(() => {
      window.dispatchEvent(new MouseEvent('pointerdown', { clientX: 1100, clientY: 0 }));
    });
    expect(parseFloat(eye.style.getPropertyValue('--sw-gy'))).toBeLessThan(0);
  });
});

describe('the sun', () => {
  it('sinks through a focus session and rises through a break', () => {
    expect(sunSetAmount('work', 0)).toBe(0);
    expect(sunSetAmount('work', 0.75)).toBe(0.75);
    expect(sunSetAmount('shortBreak', 0)).toBe(1);
    expect(sunSetAmount('longBreak', 1)).toBe(0);
    expect(sunSetAmount('work', 2)).toBe(1);
  });

  it('carries the set amount onto the world and swaps sprites for night', () => {
    const { container, rerender } = render(<SurrealWorld theme="surreal" progress={0.4} mode="work" />);
    const world = container.querySelector('.surreal-world');
    expect(world.style.getPropertyValue('--sw-set')).toBe('0.4000');
    expect(container.querySelectorAll('.sw-sun-disc')).toHaveLength(2);
    expect(container.querySelector('.sw-sun-disc').getAttribute('src')).toMatch(/sun-day-high/);
    rerender(<SurrealWorld theme="surreal-night" progress={0.4} mode="shortBreak" />);
    expect(world.style.getPropertyValue('--sw-set')).toBe('0.6000');
    expect(container.querySelector('.sw-sun-disc').getAttribute('src')).toMatch(/sun-night-high/);
  });
});
