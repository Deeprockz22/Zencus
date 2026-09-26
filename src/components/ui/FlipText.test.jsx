import { render, screen } from '@testing-library/react';
import FlipText from './FlipText';

const chars = (c) => [...c.querySelectorAll('.flip-text-char')];

describe('FlipText', () => {
  it('exposes the full string once and remounts only changed characters', () => {
    const { container, rerender } = render(<FlipText text="24:59" />);
    expect(screen.getByText('24:59')).toBeInTheDocument();
    const before = chars(container);
    rerender(<FlipText text="24:58" />);
    const after = chars(container);
    expect(after.slice(0, 4)).toEqual(before.slice(0, 4));
    expect(after[4]).not.toBe(before[4]);
    expect(after[4].textContent).toBe('8');
  });

  it('keeps the trailing `still` characters from rolling', () => {
    const { container, rerender } = render(<FlipText text="24:59" still={2} />);
    const before = chars(container);
    rerender(<FlipText text="24:58" still={2} />);
    expect(chars(container)[4]).toBe(before[4]);
    rerender(<FlipText text="23:58" still={2} />);
    expect(chars(container)[1]).not.toBe(before[1]);
  });
});
