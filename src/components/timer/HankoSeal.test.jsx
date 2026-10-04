import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HankoSeal from './HankoSeal';

describe('HankoSeal Component', () => {
  it('renders vermilion seal with default kanji', () => {
    render(<HankoSeal size={36} />);
    const seal = screen.getByRole('img', { name: /Sealed with Zen mark/i });
    expect(seal).toBeInTheDocument();
    expect(screen.getByText('禅')).toBeInTheDocument();
    expect(screen.getByText('完')).toBeInTheDocument();
  });

  it('renders custom characters and title', () => {
    render(<HankoSeal size={40} text="专注" title="Focus Complete" animate={true} />);
    const seal = screen.getByRole('img', { name: /Focus Complete/i });
    expect(seal).toHaveClass('is-stamping');
    expect(screen.getByText('专')).toBeInTheDocument();
    expect(screen.getByText('注')).toBeInTheDocument();
  });
});
