import React, { useEffect, useState, useRef } from 'react';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import ShinyText from '../react-bits/ShinyText';
import FocusLogo from '../brand/FocusLogo';
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
  theme = 'dark'
}) {
  // Mouse activity tracking for auto-hiding controls during idle focus
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimerRef = useRef(null);

  // Weather & Zen advice
  const [weather, setWeather] = useState(null);
  const [zenAdvice, setZenAdvice] = useState(null);

  // Lock body scroll and handle browser fullscreen
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.body.style.overflow = origOverflow;
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

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

    return () => {
      isMounted = false;
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
        return 'DEEP FOCUS SESSION';
      case 'shortBreak':
        return 'QUICK REFRESH BREAK';
      case 'longBreak':
        return 'RESTORATIVE LONG BREAK';
      case 'chill':
        return 'RELAX & COMPANION LOUNGE';
      default:
        return 'FOCUS SESSION';
    }
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

        {/* Actions & Weather Capsule */}
        <div className="zen-top-actions auto-hide-element flex items-center gap-3">
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

      {/* ══════════ 2. CENTER DISPLAY ══════════ */}
      <div className="fullscreen-center-content">
        <div className="zen-mode-tag auto-hide-element">
          {getModeTitle()}
        </div>

        {/* The Time Digits (Always Visible with High Contrast) */}
        <div
          className="zen-digits"
          onClick={isRunning ? pauseTimer : startTimer}
          title="Click to Pause/Resume (Space)"
        >
          {formattedTime}
        </div>

        {/* Clean Minimalist Linear Progress Bar */}
        <div className="zen-minimal-bar-container" aria-label="Timer progress">
          <div className="zen-minimal-bar-track">
            <div
              className="zen-minimal-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="zen-minimal-bar-meta auto-hide-element">
            <span>{Math.round(progress)}% COMPLETED</span>
          </div>
        </div>

        {/* Zen Advice / Quote */}
        {zenAdvice && (
          <p className="zen-advice-quote auto-hide-element">
            "{zenAdvice.advice}"
          </p>
        )}

        {/* Controls: Pause & Reset */}
        <div className="zen-controls auto-hide-element">
          <MagnetButton
            className="btn-action primary zen-main-btn"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </MagnetButton>

          <MagnetButton
            className="btn-action secondary zen-reset-btn"
            onClick={resetTimer}
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </MagnetButton>
        </div>
      </div>

      {/* ══════════ 3. BOTTOM SUBTLE FOOTER HINT ══════════ */}
      <div className="zen-bottom-bar auto-hide-element text-center opacity-40 font-mono text-[11px] select-none pointer-events-none">
        PRESS ESC TO EXIT • SPACE TO PAUSE
      </div>
    </div>
  );
}
