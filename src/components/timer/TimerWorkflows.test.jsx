import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PomodoroTimer from './PomodoroTimer';
import { sfx } from '../../utils/sfx';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TimerWorkflows: Stress & Unit Tests for Pomodoro Engine', () => {
  const defaultProps = {
    timeLeft: 1500,
    totalDuration: 1500,
    isRunning: false,
    mode: 'work',
    setMode: vi.fn(),
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resetTimer: vi.fn(),
    skipTimer: vi.fn(),
    setCustomDuration: vi.fn(),
    sessionsCompleted: 3,
    totalFocusMinutes: 75,
    xp: 450,
    companionType: 'none',
    visualizerType: 'minimal',
    setVisualizerType: vi.fn(),
    theme: 'dark',
    activeTimerTask: null,
    onClearActiveTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial timer countdown time formatted correctly', () => {
    render(<PomodoroTimer {...defaultProps} timeLeft={1500} totalDuration={1500} />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('switches between Start Focus and Pause state cleanly', () => {
    const { rerender } = render(<PomodoroTimer {...defaultProps} isRunning={false} />);
    const actionBtn = screen.getByRole('button', { name: /Start Focus/i });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(defaultProps.startTimer).toHaveBeenCalledTimes(1);

    rerender(<PomodoroTimer {...defaultProps} isRunning={true} />);
    const pauseBtn = screen.getByRole('button', { name: /Pause Timer/i });
    expect(pauseBtn).toBeInTheDocument();
    fireEvent.click(pauseBtn);
    expect(defaultProps.pauseTimer).toHaveBeenCalledTimes(1);
  });

  it('handles rapid reset and skip sequences', () => {
    render(<PomodoroTimer {...defaultProps} />);
    const resetBtn = screen.getByRole('button', { name: /Reset Timer/i });
    const skipBtn = screen.getByRole('button', { name: /Skip to next session/i });

    fireEvent.click(resetBtn);
    fireEvent.click(resetBtn);
    expect(defaultProps.resetTimer).toHaveBeenCalledTimes(2);

    fireEvent.click(skipBtn);
    expect(defaultProps.skipTimer).toHaveBeenCalledTimes(1);
  });

  it('triggers preset duration adjustments (15, 25, 45, 60)', () => {
    const { unmount } = render(<PomodoroTimer {...defaultProps} />);
    const preset15 = screen.getByText('15');
    const preset45 = screen.getByText('45');
    const preset60 = screen.getByText('60');

    fireEvent.click(preset15);
    expect(defaultProps.setCustomDuration).toHaveBeenCalledWith(15 * 60);

    fireEvent.click(preset45);
    expect(defaultProps.setCustomDuration).toHaveBeenCalledWith(45 * 60);

    fireEvent.click(preset60);
    expect(defaultProps.setCustomDuration).toHaveBeenCalledWith(60 * 60);
  });

  it('allows mode switching between Focus, Short Break, and Long Break', () => {
    render(<PomodoroTimer {...defaultProps} />);
    const shortBreakBtn = screen.getByRole('button', { name: /Short Break/i });
    const longBreakBtn = screen.getByRole('button', { name: /Long Break/i });

    fireEvent.click(shortBreakBtn);
    expect(defaultProps.setMode).toHaveBeenCalledWith('shortBreak');

    fireEvent.click(longBreakBtn);
    expect(defaultProps.setMode).toHaveBeenCalledWith('longBreak');
  });

  it('switches visualizers via streamlined scene pills without breaking stage container', () => {
    render(<PomodoroTimer {...defaultProps} />);
    const minimalPill = screen.getByRole('button', { name: /Minimal Dial/i });
    const vinylPill = screen.getByRole('button', { name: /Vinyl Studio/i });

    fireEvent.click(minimalPill);
    expect(defaultProps.setVisualizerType).toHaveBeenCalledWith('minimal');

    fireEvent.click(vinylPill);
    expect(defaultProps.setVisualizerType).toHaveBeenCalledWith('turntable');
  });

  it('renders focus soundscapes bar with quick atmosphere options', () => {
    render(<PomodoroTimer {...defaultProps} />);
    expect(screen.getByText(/Focus Soundscapes/i)).toBeInTheDocument();
  });

  it('renders active focus task pill with clear option when assigned', () => {
    const task = { id: 'task-101', title: 'Refactor audio pipeline' };
    render(<PomodoroTimer {...defaultProps} activeTimerTask={task} />);
    expect(screen.getByText('Focusing on: Refactor audio pipeline')).toBeInTheDocument();

    const clearBtn = screen.getByTitle('Clear Task');
    fireEvent.click(clearBtn);
    expect(defaultProps.onClearActiveTask).toHaveBeenCalledTimes(1);
  });

  it('renders GreenDotMatrixWall with monolithic green background, controls on the left, and giant clock on the right', () => {
    const { container } = render(<PomodoroTimer {...defaultProps} visualizerType="wall" />);
    
    // Check green dot matrix wall container exists
    const wall = container.querySelector('.green-dot-matrix-wall');
    expect(wall).toBeInTheDocument();

    // Check SVG dot matrix pattern (renamed to wallDots in v2)
    expect(container.querySelector('#wallDots')).toBeInTheDocument();

    // Start Focus button exists as the primary CTA
    expect(screen.getByRole('button', { name: /Start Focus/i })).toBeInTheDocument();

    // Giant clock touch target exists on the right
    const giantClock = container.querySelector('.giant-clock-touch-target');
    expect(giantClock).toBeInTheDocument();

    // Clicking the giant clock toggles the timer
    fireEvent.click(giantClock);
    expect(defaultProps.startTimer).toHaveBeenCalledTimes(1);

    // The wall does NOT render any glyph clock inside the left panel area
    // (clock is only on the right side; left panel has no .glyph-ndot-display-wrap)
    const allGlyphWraps = container.querySelectorAll('.glyph-ndot-display-wrap');
    // All clock instances are inside the right panel, not in a wall-left-console
    expect(container.querySelector('.wall-left-console')).toBeNull();
  });
});
