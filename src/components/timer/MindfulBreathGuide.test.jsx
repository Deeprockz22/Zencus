import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MindfulBreathGuide from './MindfulBreathGuide';

describe('MindfulBreathGuide Foundation (#29)', () => {
  it('renders nothing when isActive is false', () => {
    const { container } = render(<MindfulBreathGuide isActive={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breathing label and accessible role when active', () => {
    render(<MindfulBreathGuide isActive={true} />);
    const guide = screen.getByRole('status');
    expect(guide).toBeDefined();
    expect(guide.getAttribute('aria-label')).toContain('Breathing guide');
    expect(screen.getByText(/Breathe in|Hold|Breathe out|Rest/)).toBeDefined();
  });

  it('can be dismissed via the close button', () => {
    const onDismiss = vi.fn();
    render(<MindfulBreathGuide isActive={true} onDismiss={onDismiss} />);

    const closeBtn = screen.getByRole('button', { name: /Dismiss breath guide/i });
    fireEvent.click(closeBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
