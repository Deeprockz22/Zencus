import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FocusCompanion from './FocusCompanion';

describe('FocusCompanion lifecycle', () => {
  it('can be disabled and re-enabled without changing hook order', () => {
    const { rerender } = render(<FocusCompanion companionType="dino" />);
    expect(screen.getByTitle(/Click to pet your companion/)).toBeInTheDocument();

    rerender(<FocusCompanion companionType="none" />);
    expect(screen.queryByTitle(/Click to pet your companion/)).not.toBeInTheDocument();

    rerender(<FocusCompanion companionType="cat" />);
    expect(screen.getByTitle('Click to pet your companion! (cat)')).toBeInTheDocument();
  });
});
