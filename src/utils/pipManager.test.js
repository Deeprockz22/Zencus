import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canUseDocumentPiP, isPiPOpen, openDocumentPiP, closeDocumentPiP } from './pipManager';

describe('Document Picture-in-Picture Manager (#33)', () => {
  beforeEach(() => {
    closeDocumentPiP();
  });

  it('detects lack of documentPictureInPicture support safely in test env', () => {
    expect(canUseDocumentPiP()).toBe(false);
    expect(isPiPOpen()).toBe(false);
  });

  it('throws a descriptive error if called when API is not present', async () => {
    await expect(openDocumentPiP()).rejects.toThrow('Document Picture-in-Picture API is not supported');
  });

  it('handles simulated PiP window lifecycle if API is polyfilled', async () => {
    const fakePiPWindow = {
      closed: false,
      close: vi.fn(function() { this.closed = true; }),
      focus: vi.fn(),
      document: {
        documentElement: { className: '', setAttribute: vi.fn() },
        createElement: vi.fn((tag) => ({ tag, setAttribute: vi.fn(), style: {} })),
        head: { appendChild: vi.fn() },
        body: { appendChild: vi.fn() },
        getElementById: vi.fn(() => ({ id: 'pip-root' }))
      },
      addEventListener: vi.fn()
    };

    window.documentPictureInPicture = {
      requestWindow: vi.fn().mockResolvedValue(fakePiPWindow)
    };

    expect(canUseDocumentPiP()).toBe(true);
    const { pipWindow, container } = await openDocumentPiP({ width: 280, height: 160 });

    expect(isPiPOpen()).toBe(true);
    expect(pipWindow).toBe(fakePiPWindow);

    closeDocumentPiP();
    expect(fakePiPWindow.close).toHaveBeenCalled();

    delete window.documentPictureInPicture;
  });
});
