import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SessionDebrief, { debriefToNote } from './SessionDebrief';

describe('Session Debrief', () => {
  it('turns answers into a #focuslog note stamped with the session', () => {
    const note = debriefToNote(
      { done: 'Wrote the intro', next: 'Outline part two', feel: 'energised' },
      { minutes: 25, taskTitle: 'Essay' }
    );
    expect(note.title).toBe('Focus · 25 min · Essay');
    expect(note.content).toContain('Done: Wrote the intro');
    expect(note.content).toContain('Next: Outline part two');
    expect(note.content).toContain('Felt: ⚡ energised');
    expect(note.content).toContain('#focuslog');
    expect(note.folder).toBe('quick');
    expect(note.hanko).toBe('zen-complete');
  });

  it('includes intention in debrief card and note when provided', () => {
    const note = debriefToNote(
      { intention: 'Ship the PiP MiniTimer', done: 'Created MiniTimer', next: 'Add tests' },
      { minutes: 25, taskTitle: 'PiP' }
    );
    expect(note.content).toContain('Intention: Ship the PiP MiniTimer');

    render(<SessionDebrief open minutes={25} intention="Build clean foundations" onSave={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText(/Build clean foundations/i)).toBeDefined();
  });

  it('saves what you did, and offers "next" as a task', () => {
    const onSave = vi.fn();
    render(<SessionDebrief open minutes={25} taskTitle="" onSave={onSave} onSkip={vi.fn()} />);
    const save = screen.getByRole('button', { name: /Save to notes/i });
    expect(save).toBeDisabled(); // nothing written yet → nothing to save

    fireEvent.change(screen.getByPlaceholderText(/Finished the intro/i), { target: { value: 'Fixed the parser' } });
    fireEvent.change(screen.getByPlaceholderText(/Outline section two/i), { target: { value: 'Write tests' } });
    fireEvent.click(screen.getByRole('radio', { name: /Steady/i }));
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({ done: 'Fixed the parser', next: 'Write tests', feel: 'steady', addTask: true });
  });

  it('never makes a task when "next" is empty', () => {
    const onSave = vi.fn();
    render(<SessionDebrief open minutes={45} onSave={onSave} onSkip={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Finished the intro/i), { target: { value: 'Read chapter 4' } });
    fireEvent.click(screen.getByRole('button', { name: /Save to notes/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ next: '', addTask: false }));
  });

  it('can be skipped with the button or Escape, and renders nothing when closed', () => {
    const onSkip = vi.fn();
    const { rerender } = render(<SessionDebrief open minutes={25} onSave={vi.fn()} onSkip={onSkip} />);
    fireEvent.click(screen.getByRole('button', { name: /^Skip$/ }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledTimes(2);
    rerender(<SessionDebrief open={false} minutes={25} onSave={vi.fn()} onSkip={onSkip} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
