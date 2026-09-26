import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MiniTimer, { formatClock } from './MiniTimer';
import useDocumentPiP from './useDocumentPiP';

function fakePipWindow() {
  const doc = document.implementation.createHTMLDocument('pip');
  const listeners = {};
  return {
    document: doc,
    close: vi.fn(() => listeners.pagehide?.()),
    addEventListener: (type, fn) => { listeners[type] = fn; },
  };
}

function Harness(props) {
  const pip = useDocumentPiP();
  return (
    <>
      {pip.supported && <button onClick={pip.toggle}>float</button>}
      <MiniTimer pipWindow={pip.pipWindow} timeLeft={754} totalDuration={1500} mode="work" {...props} />
    </>
  );
}

describe('MiniTimer (Document PiP)', () => {
  afterEach(() => { delete window.documentPictureInPicture; });

  it('formats the clock', () => {
    expect(formatClock(754)).toBe('12:34');
    expect(formatClock(-3)).toBe('00:00');
  });

  it('offers nothing where the API is missing', () => {
    render(<Harness isRunning={false} onToggle={() => {}} onSkip={() => {}} />);
    expect(screen.queryByText('float')).toBeNull();
  });

  it('renders the tile into the PiP document, with live controls and Space to toggle', async () => {
    const win = fakePipWindow();
    window.documentPictureInPicture = { requestWindow: vi.fn(async () => win) };
    const onToggle = vi.fn();
    const onSkip = vi.fn();
    render(<Harness isRunning onToggle={onToggle} onSkip={onSkip} />);

    await act(async () => { fireEvent.click(screen.getByText('float')); });
    expect(window.documentPictureInPicture.requestWindow).toHaveBeenCalledWith({ width: 248, height: 136 });
    const body = win.document.body;
    expect(body.querySelector('.mini-clock').textContent).toBe('12:34');
    expect(win.document.title).toBe('12:34 · Focus');
    // the tile is in the PiP window, not the app
    expect(document.querySelector('.mini-timer')).toBeNull();

    // the PiP document has no window of its own here, so dispatch natively
    act(() => { body.querySelector('[aria-label="Pause"]').click(); });
    act(() => { body.querySelector('[aria-label="Skip"]').click(); });
    act(() => { win.document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' })); });
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onSkip).toHaveBeenCalledTimes(1);

    // closing the window (pagehide) clears it
    await act(async () => { fireEvent.click(screen.getByText('float')); });
    expect(win.close).toHaveBeenCalled();
    expect(body.querySelector('.mini-timer')).toBeNull();
  });

  it('hides the button if the browser refuses to open the window', async () => {
    const err = Object.assign(new Error('no window'), { name: 'InvalidStateError' });
    window.documentPictureInPicture = { requestWindow: vi.fn(async () => { throw err; }) };
    render(<Harness isRunning={false} onToggle={() => {}} onSkip={() => {}} />);
    await act(async () => { fireEvent.click(screen.getByText('float')); });
    expect(screen.queryByText('float')).toBeNull();
  });
});
