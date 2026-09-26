import React, { useEffect, useState, useRef } from 'react';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import FocusLogo from '../brand/FocusLogo';
import GlyphVinylRecorder from './GlyphVinylRecorder';
import GlyphDotMatrixTimer from './GlyphDotMatrixTimer';
import MinimalVisualizer from './MinimalVisualizer';
import DreamPortal from './DreamPortal';
import PrismRecord from './PrismRecord';
import MeltingClock from './MeltingClock';
import { isSurrealTheme, isLanternTheme, resolveScene } from '../../themeFamilies';
import PaperLantern from './PaperLantern';
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

  // Lock body scroll
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

  // Idle mouse tracking (6s idle threshold)
  useEffect(() => {
    if (!isOpen) return;

    const wakeUI = () => {
      setIsMouseActive(true);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 6000);
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

  const isSketch = theme === 'sketch';

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
    pauseTimer,
    calmDigits: true
  };

  return (
    <div
      className={`fullscreen-zen-overlay mode-${mode} ${!isMouseActive ? 'zen-idle' : 'zen-active'} bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      data-mode={mode}
      data-visualizer={visualizerType}
    >
      {/* ══════════ 1. TOP BAR (Nothing Tech Unboxed) ══════════ */}
      <div className="fullscreen-top-bar flex items-center justify-between pb-3 border-b border-white/5">
        {/* Brand: Persistent Symbol + Mode Typography */}
        <div className="zen-brand flex items-center gap-2.5 select-none">
          <div className="zen-symbol-wrapper">
            <FocusLogo size={28} className="brand-logo-icon zen-persistent-symbol" />
          </div>
          <div className="zen-brand-text auto-hide-element flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-[var(--text-primary)] uppercase">
              {mode === 'chill' ? 'CHILL LOUNGE' : 'ZEN FOCUS'}
            </span>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] opacity-60">
              Fullscreen
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
          </div>
        </div>

        {/* Top Actions: Weather + Exit Fullscreen */}
        <div className="zen-top-actions auto-hide-element flex items-center gap-3">
          {weather && !isSketch && (
            <div
              className="zen-weather-pill font-mono text-xs text-[var(--text-secondary)] flex items-center gap-1.5 opacity-80"
              title={`Live Weather: ${weather.city} • ${weather.condition} (${weather.tempC}°C)`}
            >
              <span className="zen-weather-icon">{weather.icon}</span>
              <span className="zen-weather-temp font-bold">{weather.tempC}°C</span>
              <span className="zen-weather-city opacity-60">· {weather.city}</span>
            </div>
          )}

          {/* Close / Minimize Button */}
          <button
            className="icon-btn zen-close-btn w-8 h-8 rounded-full border border-white/20 hover:border-[#ff3b30] hover:text-[#ff3b30] flex items-center justify-center text-[var(--text-secondary)] transition-all"
            onClick={onClose}
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* ══════════ 2. CENTER: ENLARGED VISUALIZER STAGE ══════════ */}
      <div className="zen-center-visualizer flex-1 flex items-center justify-center w-full relative overflow-hidden my-2">
        {isSketch ? (
          <MinimalVisualizer {...vizProps} />
        ) : isLanternTheme(theme) && resolveScene(theme, visualizerType) === 'lantern' ? (
          <div className="zen-art-stage zen-lantern-stage">
            <PaperLantern {...vizProps} />
          </div>
        ) : isSurrealTheme(theme) ? (
          <div className="zen-art-stage">
            {visualizerType === 'turntable' ? (
              <PrismRecord {...vizProps} />
            ) : visualizerType === 'minimal' ? (
              <MeltingClock {...vizProps} />
            ) : (
              <DreamPortal {...vizProps} />
            )}
          </div>
        ) : (
          <div className="fullscreen-glyph-deck-wrap flex items-center justify-center scale-115 sm:scale-125 lg:scale-130 transition-transform">
            <GlyphVinylRecorder {...vizProps} isZenMode={true} hideTelemetry={true} theme={theme} />
          </div>
        )}
      </div>

      {/* ══════════ 3. BOTTOM: TIMER INFO DOCK (Nothing Tech Unboxed) ══════════ */}
      <div className="zen-bottom-dock flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto self-center z-50 select-none pb-2">
        {/* Zen Advice */}
        {zenAdvice?.advice?.trim() && !isSketch && (
          <p className="zen-advice-quote auto-hide-element text-xs text-[var(--text-secondary)] opacity-70 text-center max-w-lg italic font-sans">
            "{zenAdvice.advice}"
          </p>
        )}

        {/* Mode telemetry badge */}
        <div className="zen-bottom-mode-tag auto-hide-element font-mono text-[11px] font-bold tracking-widest text-[#ff3b30] uppercase flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
          <span>{getModeTitle().toUpperCase()}</span>
          <span className="opacity-40 text-[var(--text-tertiary)] font-normal">( {Math.round(progress)}% )</span>
        </div>

        {/* Giant NDot LED Matrix Countdown Timer */}
        <div
          className="zen-bottom-digits flex items-center justify-center cursor-pointer my-1 transition-transform hover:scale-105"
          onClick={isRunning ? pauseTimer : startTimer}
          title="Click to Pause/Resume (Space)"
        >
          <GlyphDotMatrixTimer
            timeString={formattedTime}
            timeLeft={timeLeft}
            isRunning={isRunning}
            showGlow={true}
            dotPitch={10}
            dotRadius={3.8}
          />
        </div>

        {/* 1px Hairline Glowing Progress Trace */}
        <div className="zen-bottom-progress-container flex items-center justify-center w-full max-w-sm mx-auto my-1">
          <div className="zen-bottom-progress-track w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="zen-bottom-progress-fill h-full bg-[#ff3b30] rounded-full transition-all duration-300 shadow-[0_0_8px_#ff3b30]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Unboxed Minimal Transport Controls */}
        <div className="zen-bottom-controls auto-hide-element flex items-center justify-center gap-3 mt-1">
          <MagnetButton
            className="btn-action primary zen-main-btn px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </MagnetButton>

          <MagnetButton
            className="btn-action secondary zen-reset-btn w-9 h-9 rounded-full border border-white/20 hover:border-[#ff3b30] hover:text-[#ff3b30] flex items-center justify-center text-[var(--text-secondary)] transition-all"
            onClick={resetTimer}
            title="Reset Timer"
          >
            <RotateCcw size={14} />
          </MagnetButton>
        </div>

        {/* Hint */}
        <div className="zen-bottom-hint auto-hide-element text-[10px] text-[var(--text-tertiary)] opacity-50 mt-1 tracking-wide font-sans">
          Space to pause · Esc to exit
        </div>
      </div>
    </div>
  );
}
