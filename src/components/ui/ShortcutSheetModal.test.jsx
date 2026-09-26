import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShortcutSheetModal, { SHORTCUTS } from './ShortcutSheetModal';

describe('ShortcutSheetModal Foundation (#17)', () => {
  it('does not render when closed', () => {
    const { container } = render(<ShortcutSheetModal open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all shortcuts when open', () => {
    render(<ShortcutSheetModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeDefined();
    SHORTCUTS.forEach((sc) => {
      expect(screen.getByText(sc.key)).toBeDefined();
    });
  });

  it('triggers onClose when close button or Escape is pressed', () => {
    const onClose = vi.fn();
    render(<ShortcutSheetModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close shortcuts'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
