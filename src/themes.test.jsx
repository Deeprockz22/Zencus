import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  baseTheme, toggleDayNight, pickFamily, resolveScene, scenesFor, isArtTheme,
} from './themeFamilies';
import PomodoroTimer from './components/timer/PomodoroTimer';
import SettingsModal from './components/SettingsModal';
import AsciiButterfly from './components/lantern/AsciiButterfly';
import LanternWorld from './components/lantern/LanternWorld';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

describe('Theme families', () => {
  it('rides every variant on a light or dark base', () => {
    expect(baseTheme('lantern')).toBe('light');
    expect(baseTheme('lantern-night')).toBe('dark');
    expect(baseTheme('surreal-night')).toBe('dark');
    expect(baseTheme('komorebi')).toBe('light');
    expect(baseTheme('komorebi-night')).toBe('dark');
    expect(baseTheme('dark')).toBe('dark');
  });

  it('toggles day and night within the same family', () => {
    expect(toggleDayNight('lantern')).toBe('lantern-night');
    expect(toggleDayNight('lantern-night')).toBe('lantern');
    expect(toggleDayNight('surreal')).toBe('surreal-night');
    expect(toggleDayNight('komorebi')).toBe('komorebi-night');
    expect(toggleDayNight('komorebi-night')).toBe('komorebi');
    expect(toggleDayNight('light')).toBe('dark');
  });

  it('picks a family on the side of the day you are already on', () => {
    expect(pickFamily('lantern', 'dark')).toBe('lantern-night');
    expect(pickFamily('lantern', 'surreal')).toBe('lantern');
    expect(pickFamily('surreal', 'lantern-night')).toBe('surreal-night');
    expect(pickFamily('komorebi', 'dark')).toBe('komorebi-night');
    expect(pickFamily('komorebi', 'light')).toBe('komorebi');
    expect(pickFamily('light', 'lantern-night')).toBe('light');
  });

  it('gives each family its own scenes and falls back to its signature one', () => {
    expect(scenesFor('lantern').map((s) => s.label)).toContain('Paper Lantern');
    expect(resolveScene('lantern', 'portal')).toBe('lantern');
    expect(resolveScene('light', 'lantern')).toBe('turntable');
    expect(resolveScene('surreal', 'lantern')).toBe('portal');
    expect(resolveScene('lantern-night', 'wall')).toBe('wall');
    expect(scenesFor('komorebi').map((s) => s.value)).toEqual(['minimal']);
    expect(resolveScene('komorebi', 'wall')).toBe('minimal');
    expect(isArtTheme('lantern-night')).toBe(true);
    expect(isArtTheme('komorebi')).toBe(true);
    expect(isArtTheme('komorebi-night')).toBe(true);
    expect(isArtTheme('dark')).toBe(false);
  });
});

describe('Lantern Garden theme', () => {
  const timerProps = {
    timeLeft: 25 * 60, totalDuration: 25 * 60, isRunning: false, mode: 'work',
    setMode: vi.fn(), startTimer: vi.fn(), pauseTimer: vi.fn(), resetTimer: vi.fn(), skipTimer: vi.fn(),
    setCustomDuration: vi.fn(), sessionsCompleted: 0, totalFocusMinutes: 0, xp: 0,
    setVisualizerType: vi.fn(), visualizerType: 'portal',
  };

  it('shows the Paper Lantern timer with its own scene switcher', () => {
    render(<PomodoroTimer {...timerProps} theme="lantern-night" />);
    expect(screen.getByRole('button', { name: /Paper Lantern/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Dream Portal/i })).toBeNull();
    expect(document.querySelector('.paper-lantern')).toBeInTheDocument();
  });

  it('lights the lantern when tapped', () => {
    const startTimer = vi.fn();
    render(<PomodoroTimer {...timerProps} theme="lantern" startTimer={startTimer} />);
    fireEvent.click(screen.getByRole('button', { name: /Light the lantern/i }));
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  it('uses The Atelier for settings and marks Lantern Garden as chosen', () => {
    render(
      <SettingsModal
        isOpen onClose={vi.fn()} theme="lantern-night" setTheme={vi.fn()}
        timerSettings={{ workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 }}
        saveTimerSettings={vi.fn()} onClearAllData={vi.fn()} onExportAllData={vi.fn()} onImportAllData={vi.fn()}
      />
    );
    expect(document.querySelector('.atl-card')).toBeInTheDocument();
    expect(document.querySelector('.atl-world-lantern')).toHaveAttribute('aria-pressed', 'true');
  });

  it('is offered on the original settings page too', () => {
    const setTheme = vi.fn();
    render(
      <SettingsModal
        isOpen onClose={vi.fn()} theme="dark" setTheme={setTheme}
        timerSettings={{ workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 }}
        saveTimerSettings={vi.fn()} onClearAllData={vi.fn()} onExportAllData={vi.fn()} onImportAllData={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Lantern Garden'));
    expect(setTheme).toHaveBeenCalledWith('lantern-night');
  });

  it('paints the garden and lets the butterfly layer mount safely without canvas', () => {
    const { unmount } = render(<><LanternWorld theme="lantern-night" /><AsciiButterfly /></>);
    expect(document.documentElement.classList.contains('lantern')).toBe(true);
    expect(document.querySelector('.lw-sakura')).toBeInTheDocument();
    expect(document.querySelector('.ascii-butterfly')).toBeInTheDocument();
    expect(document.querySelector('.butterfly-focus')).toBeInTheDocument();
    unmount();
    expect(document.documentElement.classList.contains('lantern')).toBe(false);
  });
});

describe('ASCII butterfly schedule', () => {
  it('visits exactly every 5 minutes, and at no other time', () => {
    vi.useFakeTimers();
    const ctx = { fillText: vi.fn(), clearRect: vi.fn(), font: '', fillStyle: '', textBaseline: '' };
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    const { unmount } = render(<AsciiButterfly />);

    vi.advanceTimersByTime(5 * 60 * 1000 - 1);
    expect(raf).not.toHaveBeenCalled();          // nothing before the 5-minute mark
    vi.advanceTimersByTime(1);
    expect(raf).toHaveBeenCalledTimes(1);        // it takes off exactly at 5:00

    unmount();
    getContext.mockRestore();
    raf.mockRestore();
    vi.useRealTimers();
  });
});

