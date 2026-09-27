import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import SurrealWorld from './SurrealWorld';
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
