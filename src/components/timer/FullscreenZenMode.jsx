import React, { useEffect, useState, useRef } from 'react';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import ShinyText from '../react-bits/ShinyText';
import ShinyButton from '../react-bits/ShinyButton';
import FocusLogo from '../brand/FocusLogo';
import IsometricEditorialDial from './IsometricEditorialDial';
import GlobeVisualizer from './GlobeVisualizer';
import MinimalVisualizer from './MinimalVisualizer';
import {
  fetchDailyZenAdvice,
  fetchLocalWeather
} from '../../utils/publicApisService';

export default function FullscreenZenMode({
  isOpen,
  onClose,
  timeLeft,
  totalDuration,
  isRunning,
  startTimer,
  pauseTimer,
  resetTimer,
  mode = 'work',
  theme = 'dark',
  visualizerType = 'turntable',
  setVisualizerType
}) {
  // Mouse activity tracking for auto-hiding controls during idle focus
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimerRef = useRef(null);

  // Editing state for inline duration editing
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(totalDuration / 60));

  // Weather & Zen advice
  const [weather, setWeather] = useState(null);
  const [zenAdvice, setZenAdvice] = useState(null);

  // Lock body scroll (native fullscreen is driven by the caller so it can be
  // sequenced around the view transition)
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    // Held off until the open morph has settled so the requests and their
    // re-renders don't land in the same frame as the transition snapshot.
    const kickoff = setTimeout(() => {
      fetchLocalWeather()
        .then((w) => {
          if (isMounted && w) setWeather(w);
        })
        .catch(console.warn);

      fetchDailyZenAdvice()
        .then((adv) => {
          if (isMounted && adv) setZenAdvice(adv);
        })
        .catch(console.warn);
    }, 700);

    return () => {
      isMounted = false;
      clearTimeout(kickoff);
    };
  }, [isOpen]);

  // Idle mouse tracking (3s idle threshold)
  useEffect(() => {
    if (!isOpen) return;

    const wakeUI = () => {
      setIsMouseActive(true);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 3000);
    };

    wakeUI();

    window.addEventListener('mousemove', wakeUI, { passive: true });
    window.addEventListener('mousedown', wakeUI, { passive: true });
    window.addEventListener('keydown', wakeUI, { passive: true });
    window.addEventListener('touchstart', wakeUI, { passive: true });

    return () => {
      window.removeEventListener('mousemove', wakeUI);
      window.removeEventListener('mousedown', wakeUI);
      window.removeEventListener('keydown', wakeUI);
      window.removeEventListener('touchstart', wakeUI);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    };
  }, [isOpen]);

  // Keyboard shortcuts (Esc to close, Space to toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (
        e.key === ' ' &&
        isOpen &&
        (e.target === document.body || (e.target && e.target.classList && e.target.classList.contains('fullscreen-zen-overlay')))
      ) {
        e.preventDefault();
        if (isRunning) pauseTimer();
        else startTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isRunning, pauseTimer, startTimer]);

  if (!isOpen) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const getModeTitle = () => {
    switch (mode) {
      case 'work':
        return 'Deep Focus Session';
      case 'shortBreak':
        return 'Quick Refresh Break';
      case 'longBreak':
        return 'Restorative Long Break';
      case 'chill':
        return 'Relax & Companion Lounge';
      default:
        return 'Focus Session';
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  // Shared visualizer props
  const vizProps = {
    timeLeft,
    totalDuration,
    isRunning,
    mode,
    getModeTitle,
    formatTime,
    isEditing,
    editMinutes,
    setEditMinutes,
    handleEditSubmit,
    setIsEditing,
    startTimer,
    pauseTimer
  };

  return (
    <div
      className={`fullscreen-zen-overlay mode-${mode} ${!isMouseActive ? 'zen-idle' : 'zen-active'}`}
      data-mode={mode}
    >
      {/* ══════════ 1. TOP BAR ══════════ */}
      <div className="fullscreen-top-bar">
        {/* Brand: Persistent Symbol + Mode Typography */}
        <div className="zen-brand">
          <div className="zen-symbol-wrapper">
            <FocusLogo size={32} className="brand-logo-icon zen-persistent-symbol" />
          </div>
          <div className="zen-brand-text auto-hide-element">
            <ShinyText text={mode === 'chill' ? 'CHILL LOUNGE' : 'ZEN FOCUS'} speed={3} />
          </div>
        </div>

        {/* Visualizer Switcher + Actions */}
        <div className="zen-top-actions auto-hide-element flex items-center gap-3">
          {/* Visualizer Type Switcher */}
          <div className="zen-viz-switcher flex items-center gap-1">
            <ShinyButton
              variant="pill"
              size="sm"
              active={visualizerType === 'turntable'}
              onClick={() => setVisualizerType('turntable')}
              className="zen-viz-btn"
            >
              <span>📻</span>
            </ShinyButton>
            <ShinyButton
              variant="pill"
              size="sm"
              active={visualizerType === 'globe'}
              onClick={() => setVisualizerType('globe')}
              className="zen-viz-btn"
            >
              <span>🌍</span>
            </ShinyButton>
            <ShinyButton
              variant="pill"
              size="sm"
              active={visualizerType === 'minimal'}
              onClick={() => setVisualizerType('minimal')}
              className="zen-viz-btn"
            >
              <span>◌</span>
            </ShinyButton>
          </div>

          {weather && (
            <div
              className="zen-weather-pill"
              title={`Live Weather: ${weather.city} • ${weather.condition} (${weather.tempC}°C)`}
            >
              <span className="zen-weather-icon">{weather.icon}</span>
              <span className="zen-weather-temp">{weather.tempC}°C</span>
              <span className="zen-weather-city">{weather.city}</span>
            </div>
          )}

          {/* Close / Minimize Button */}
          <button
            className="icon-btn zen-close-btn"
            onClick={onClose}
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      {/* ══════════ 2. CENTER: ENLARGED VISUALIZER ══════════ */}
      <div className="zen-center-visualizer">
        {visualizerType === 'minimal' ? (
          <MinimalVisualizer {...vizProps} />
        ) : visualizerType === 'globe' ? (
          <GlobeVisualizer {...vizProps} />
        ) : (
          <IsometricEditorialDial {...vizProps} />
        )}
      </div>

      {/* ══════════ 3. BOTTOM: TIMER INFO DOCK ══════════ */}
      <div className="zen-bottom-dock">
        {/* Zen Advice */}
        {zenAdvice?.advice?.trim() && (
          <p className="zen-advice-quote auto-hide-element">
            "{zenAdvice.advice}"
          </p>
        )}

        {/* Timer Digits + Progress */}
        <div className="zen-bottom-timer-row">
          <div className="zen-bottom-timer-info">
            <div className="zen-bottom-mode-tag auto-hide-element">
              {getModeTitle().toUpperCase()}
            </div>
            <div
              className="zen-bottom-digits"
              onClick={isRunning ? pauseTimer : startTimer}
              title="Click to Pause/Resume (Space)"
            >
              {formattedTime}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="zen-bottom-progress-container">
            <div className="zen-bottom-progress-track">
              <div
                className="zen-bottom-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="zen-bottom-progress-meta auto-hide-element">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Controls */}
          <div className="zen-bottom-controls auto-hide-element">
            <MagnetButton
              className="btn-action primary zen-main-btn"
              onClick={isRunning ? pauseTimer : startTimer}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </MagnetButton>

            <MagnetButton
              className="btn-action secondary zen-reset-btn"
              onClick={resetTimer}
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </MagnetButton>
          </div>
        </div>

        {/* Subtle footer */}
        <div className="zen-bottom-hint auto-hide-element">
          PRESS ESC TO EXIT • SPACE TO PAUSE
        </div>
      </div>
    </div>
  );
}
