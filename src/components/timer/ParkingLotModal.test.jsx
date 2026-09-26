import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ParkingLotModal from './ParkingLotModal';

describe('ParkingLotModal (#5 & #4)', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ParkingLotModal
        isOpen={false}
        onClose={vi.fn()}
        onParkThought={vi.fn()}
        onTallyDistraction={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('allows parking a thought and seals it', () => {
    const onPark = vi.fn();
    const onClose = vi.fn();
    render(
      <ParkingLotModal
        isOpen={true}
        onClose={onClose}
        onParkThought={onPark}
        onTallyDistraction={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Call dentist, reply to email/i);
    fireEvent.change(input, { target: { value: 'Buy cedar tea' } });

    const submit = screen.getByRole('button', { name: /^Park$/i });
    fireEvent.click(submit);

    expect(onPark).toHaveBeenCalledWith('Buy cedar tea');
  });

  it('tallies a distraction when tally button is clicked', () => {
    const onTally = vi.fn();
    render(
      <ParkingLotModal
        isOpen={true}
        onClose={vi.fn()}
        onParkThought={vi.fn()}
        onTallyDistraction={onTally}
        distractionCount={2}
      />
    );

    const tallyBtn = screen.getByText(/\+1 Tally Distraction \(2\)/i);
    fireEvent.click(tallyBtn);

    expect(onTally).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(
      <ParkingLotModal
        isOpen={true}
        onClose={onClose}
        onParkThought={vi.fn()}
        onTallyDistraction={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
