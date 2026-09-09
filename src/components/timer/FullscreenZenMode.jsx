import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Minimize2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import ShinyText from '../react-bits/ShinyText';
import StarBurst from '../react-bits/StarBurst';
import FocusLogo from '../brand/FocusLogo';
import { getContrastColors } from '../../utils/contrastColor';
import {
  fetchDailyZenAdvice,
  fetchLocalWeather
} from '../../utils/publicApisService';

const STAR_BURST_PALETTES = [
  { id: 'lavender', label: 'Cosmic Lavender', color: '#e3b3ea', bg: '#0b0b14' },
  { id: 'ember', label: 'Solar Ember', color: '#ff6b4a', bg: '#140c09' },
  { id: 'cyan', label: 'Electric Cyan', color: '#38bdf8', bg: '#06131d' },
  { id: 'emerald', label: 'Zen Forest', color: '#10b981', bg: '#07150e' },
  { id: 'golden', label: 'Golden Hour', color: '#fbbf24', bg: '#171105' },
  { id: 'oatmeal', label: 'Oatmeal Light', color: '#8b5cf6', bg: '#faf7f2' }
];

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
  theme = 'light'
}) {
  // Mouse activity tracking for auto-hiding controls during idle focus
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimerRef = useRef(null);

  // Selected Star Burst Color Palette
  const [paletteId, setPaletteId] = useState(() => {
    if (mode === 'chill') return 'lavender';
    if (mode === 'shortBreak') return 'cyan';
    if (mode === 'longBreak') return 'emerald';
    return theme === 'dark' ? 'ember' : 'lavender';
  });

  const activePalette = useMemo(() => {
    return STAR_BURST_PALETTES.find((p) => p.id === paletteId) || STAR_BURST_PALETTES[0];
  }, [paletteId]);

  // Automated contrast calculation against current background & palette
  const contrast = useMemo(() => {
    return getContrastColors(activePalette.bg, theme);
  }, [activePalette.bg, theme]);

  // Weather & Zen advice
  const [weather, setWeather] = useState(null);
  const [zenAdvice, setZenAdvice] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    fetchLocalWeather().then((w) => {
      if (isMounted && w) setWeather(w);
    }).catch(console.warn);

    fetchDailyZenAdvice().then((adv) => {
      if (isMounted && adv) setZenAdvice(adv);
    }).catch(console.warn);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Idle mouse tracking
  useEffect(() => {
    if (!isOpen) return;

    const wakeUI = () => {
      setIsMouseActive(true);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 3000); // 3s idle threshold
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

  // Keyboard shortcut listener (Esc to close, Space to toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === ' ' && isOpen && e.target === document.body) {
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

  return (
    <div
      className={`fullscreen-zen-overlay starburst-mode mode-${mode} ${!isMouseActive ? 'zen-idle' : 'zen-active'}`}
      data-mode={mode}
      style={{
        backgroundColor: activePalette.bg,
        '--zen-text-color': contrast.textColor,
        '--zen-subtext-color': contrast.subtextColor,
        '--zen-text-shadow': contrast.textShadow,
        '--zen-border-color': contrast.borderColor,
        '--zen-accent-color': activePalette.color,
        '--zen-panel-bg': contrast.panelBg
      }}
    >
      {/* ══════════ 1. REACT BITS STAR BURST WEBGL BACKGROUND ══════════ */}
      <StarBurst
        color={activePalette.color}
        speed={isRunning ? 1.2 : 0.65}
        density={0.55}
        starCount={110}
        centerX={0.5}
        centerY={0.5}
        starSize={0.32}
        brightness={contrast.isLight ? 0.75 : 1.15}
        opacity={contrast.isLight ? 0.82 : 0.95}
        flowerIntensity={0.5}
        twinkleSpeed={0.25}
        wobbleAmount={1}
        innerLayerIntensity={1.1}
        outerLayerIntensity={1.5}
        fadeHeight={2.6}
      />

      {/* ══════════ 2. TOP BAR ══════════ */}
      <div className="fullscreen-top-bar" style={{ position: 'relative', zIndex: 10 }}>
        {/* Brand: Persistent Symbol + Mode Typography */}
        <div className="zen-brand">
          <div className="zen-symbol-wrapper">
            <FocusLogo size={32} className="brand-logo-icon zen-persistent-symbol" />
          </div>
          <div className="zen-brand-text auto-hide-element" style={{ color: contrast.textColor, textShadow: contrast.textShadow }}>
            <ShinyText text={mode === 'chill' ? 'CHILL LOUNGE' : 'ZEN FOCUS'} speed={3} />
          </div>
        </div>

        {/* Actions, StarBurst Palette Selector & Weather Capsule */}
        <div className="zen-top-actions auto-hide-element flex items-center gap-3">
          {/* StarBurst Theme / Aura Palette Switcher */}
          <div className="zen-starburst-palettes" title="Choose Cosmic Aura">
            <Sparkles size={12} style={{ color: contrast.subtextColor, marginRight: 2 }} />
            {STAR_BURST_PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaletteId(p.id)}
                title={p.label}
                aria-label={p.label}
                className={`zen-palette-dot ${paletteId === p.id ? 'active' : ''}`}
                style={{
                  backgroundColor: p.color,
                  borderColor: paletteId === p.id ? contrast.textColor : 'transparent'
                }}
              />
            ))}
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

      {/* ══════════ 3. CENTER DISPLAY (AUTOMATIC CONTRAST ADAPTED) ══════════ */}
      <div className="fullscreen-center-content" style={{ position: 'relative', zIndex: 10 }}>
        <div className="zen-mode-tag auto-hide-element">
          {mode === 'chill'
            ? 'RELAX & CHILL • 30 MIN LOUNGE'
            : mode === 'work'
            ? 'DEEP WORK FOCUS'
            : mode === 'shortBreak'
            ? 'QUICK REFRESH BREAK'
            : 'RESTORATIVE LONG BREAK'}
        </div>

        {/* The Time Digits (Always Visible with High-Contrast Adaptive Color & Shadow) */}
        <div
          className="zen-digits"
          onClick={isRunning ? pauseTimer : startTimer}
          title="Click to Pause/Resume"
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
            style={{
              backgroundColor: activePalette.color,
              borderColor: activePalette.color,
              color: '#ffffff',
              boxShadow: contrast.isLight ? '2px 2px 0px #121212' : '2px 2px 0px rgba(255,255,255,0.25)'
            }}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </MagnetButton>

          <MagnetButton
            className="btn-action secondary zen-reset-btn"
            onClick={resetTimer}
            title="Reset Timer"
            style={{
              backgroundColor: contrast.panelBg,
              color: contrast.textColor,
              borderColor: contrast.borderColor,
              boxShadow: contrast.isLight ? '1.5px 1.5px 0px #121212' : '1.5px 1.5px 0px rgba(255,255,255,0.15)'
            }}
          >
            <RotateCcw size={18} />
          </MagnetButton>
        </div>
      </div>
    </div>
  );
}
