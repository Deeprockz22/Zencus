import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import ClickSpark from './ClickSpark';

describe('ClickSpark', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sleeps until a click, draws while sparks live, then sleeps again', () => {
    const ctx = { clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    const frames = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });

    render(<ClickSpark duration={400} />);
    expect(raf).not.toHaveBeenCalled(); // idle: no frames at all

    act(() => {
      window.dispatchEvent(new MouseEvent('pointerdown', { clientX: 10, clientY: 10 }));
    });
    expect(raf).toHaveBeenCalledTimes(1);

    const t0 = performance.now();
    act(() => frames.shift()(t0 + 100)); // sparks alive: keep going
    expect(ctx.fill).toHaveBeenCalled();
    expect(raf).toHaveBeenCalledTimes(2);

    act(() => frames.shift()(t0 + 1000)); // all expired: clear and stop
    expect(ctx.clearRect).toHaveBeenCalledTimes(2);
    expect(raf).toHaveBeenCalledTimes(2);
  });
});
