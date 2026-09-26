import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, SkipForward } from 'lucide-react';
import './mini-timer.css';

/*
 * MiniTimer: the floating tile shown in the Picture-in-Picture window.
 * A progress ring, the time, the mode, and two controls. It renders into the
 * PiP document through a portal, so it reads App's own state and needs no
 * timer of its own. Space toggles play/pause inside the tile.
 */

const MODE_LABEL = { work: 'Focus', shortBreak: 'Short break', longBreak: 'Long break' };

export const formatClock = (s) => {
  const t = Math.max(0, Math.round(s));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export default function MiniTimer({ pipWindow, timeLeft, totalDuration, mode, isRunning, onToggle, onSkip }) {
  const clock = formatClock(timeLeft);
  const progress = totalDuration ? Math.min(1, Math.max(0, 1 - timeLeft / totalDuration)) : 0;

  // the PiP window's own title bar carries the time too
  useEffect(() => {
    if (pipWindow) pipWindow.document.title = `${clock} · ${MODE_LABEL[mode] || 'Focus'}`;
  }, [pipWindow, clock, mode]);

  useEffect(() => {
    if (!pipWindow) return undefined;
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); onToggle(); }
    };
    pipWindow.document.addEventListener('keydown', onKey);
    return () => pipWindow.document.removeEventListener('keydown', onKey);
  }, [pipWindow, onToggle]);

  if (!pipWindow) return null;

  const R = 26;
  const C = 2 * Math.PI * R;
  return createPortal(
    <div className={`mini-timer is-${mode} ${isRunning ? 'is-running' : ''}`}>
      <svg className="mini-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="mini-ring-track" cx="32" cy="32" r={R} />
        <circle
          className="mini-ring-fill"
          cx="32" cy="32" r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="mini-readout">
        <span className="mini-mode">{MODE_LABEL[mode] || 'Focus'}</span>
        <span className="mini-clock" role="timer" aria-live="off">{clock}</span>
      </div>
      <div className="mini-controls">
        <button type="button" className="mini-btn mini-primary" onClick={onToggle}
          aria-label={isRunning ? 'Pause' : 'Start'}>
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" className="mini-btn" onClick={onSkip} aria-label="Skip">
          <SkipForward size={14} />
        </button>
      </div>
    </div>,
    pipWindow.document.body,
  );
}
