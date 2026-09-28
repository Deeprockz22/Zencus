import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AmbientSoundscapes from './AmbientSoundscapes';

const audioMocks = {
  stop: vi.fn(),
  setVolume: vi.fn(),
  playWindowRain: vi.fn(),
  playZenRain: vi.fn(),
  playCampfire: vi.fn(),
  playForestBirdsong: vi.fn(),
  playCoffeeShop: vi.fn(),
  playOceanWaves: vi.fn(),
  playWhiteNoise: vi.fn(),
  playAlphaBeats: vi.fn(),
};

vi.mock('../../utils/ambientAudio', () => ({
  ambientSoundscapes: audioMocks,
}));

vi.mock('../../utils/jazzRadioAudio', () => ({
  jazzRadio: {
    getState: () => ({
      isPlaying: false,
      currentStation: { id: 'sax-ella', category: 'Saxophone' },
    }),
    subscribe: () => () => {},
    pause: vi.fn(),
    play: vi.fn(),
    toggle: vi.fn(),
  },
  JAZZ_STATIONS: [],
}));

describe('AmbientSoundscapes', () => {
  beforeEach(() => {
    Object.values(audioMocks).forEach((mockFn) => mockFn.mockClear());
  });

  it('starts each newly added soundscape when clicked', () => {
    render(<AmbientSoundscapes />);

    fireEvent.click(screen.getByRole('button', { name: /Campfire/i }));
    fireEvent.click(screen.getByRole('button', { name: /Forest/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cafe Hum/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ocean Waves/i }));

    expect(audioMocks.playCampfire).toHaveBeenCalledTimes(1);
    expect(audioMocks.playForestBirdsong).toHaveBeenCalledTimes(1);
    expect(audioMocks.playCoffeeShop).toHaveBeenCalledTimes(1);
    expect(audioMocks.playOceanWaves).toHaveBeenCalledTimes(1);
  });

  it('stops active sound when same new soundscape button is clicked again', () => {
    render(<AmbientSoundscapes />);

    fireEvent.click(screen.getByRole('button', { name: /Campfire/i }));
    fireEvent.click(screen.getByRole('button', { name: /Campfire/i }));

    expect(audioMocks.playCampfire).toHaveBeenCalledTimes(1);
    expect(audioMocks.stop).toHaveBeenCalledTimes(1);
  });
});
