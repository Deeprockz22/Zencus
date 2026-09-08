import React, { useEffect, useState, useRef } from 'react';
import { Minimize2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import ShinyText from '../react-bits/ShinyText';
import FogSphere from '../react-bits/FogSphere';
import AmbientCompanionUniverse from './AmbientCompanionUniverse';
import FocusLogo from '../brand/FocusLogo';
import WittyFlySwitch from '../ui/WittyFlySwitch';
import StarfieldBackground from '../ambient/StarfieldBackground';
import TokyoDriftMatrixBackground from '../ambient/TokyoDriftMatrixBackground';
import {
  fetchDailyZenAdvice,
  fetchNasaCosmicBackdrop,
  fetchLocalWeather
} from '../../utils/publicApisService';

const ZEN_BG_PRESETS = [
  { id: 'auto', label: 'Auto', icon: '✨' },
  { id: 'space', label: 'Starfield', icon: '🌌' },
  { id: 'matrix', label: 'Matrix', icon: '🎌' },
  { id: 'fog', label: 'Fog Sphere', icon: '🔮' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'sunset', label: 'Sunset', icon: '🌅' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'oled', label: 'OLED', icon: '🖤' }
];

function getFogColors(mode, zenBg) {
  if (zenBg === 'forest') return { core: '#16a34a', glow: '#34d399' };
  if (zenBg === 'sunset') return { core: '#f97316', glow: '#ec4899' };
  if (zenBg === 'cafe') return { core: '#d97706', glow: '#fbbf24' };
  if (zenBg === 'space') return { core: '#9333ea', glow: '#3b82f6' };

  // Mode-adaptive colors
  switch (mode) {
    case 'work':
      return { core: '#0284c7', glow: '#38bdf8' }; // Cyan & Electric Blue
    case 'shortBreak':
      return { core: '#059669', glow: '#34d399' }; // Mint & Emerald Dawn
    case 'longBreak':
      return { core: '#d97706', glow: '#f43f5e' }; // Sunset Amber & Rose
    case 'chill':
    default:
      return { core: '#9333ea', glow: '#6366f1' }; // Astral Violet & Indigo
  }
}

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
  theme,
  companionType = 'dino',
  setCompanionType
}) {
  // Automatically enable Ambient Living Universe for chill mode, or allow toggle
  const [showUniverse, setShowUniverse] = useState(mode === 'chill');

  // Mouse activity tracking for auto-hiding all UI elements except time, bar, and soft logo
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimerRef = useRef(null);

  // Background Scene Preset State (persisted)
  const [zenBg, setZenBg] = useState(() => {
    try {
      return localStorage.getItem('phocus_zen_bg') || 'auto';
    } catch {
      return 'auto';
    }
  });

  // 🌐 Public APIs Data State
  const [weather, setWeather] = useState(null);
  const [nasaBackdrop, setNasaBackdrop] = useState(null);
  const [zenAdvice, setZenAdvice] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    fetchLocalWeather().then((w) => {
      if (isMounted && w) setWeather(w);
    }).catch(console.warn);

    fetchNasaCosmicBackdrop().then((nb) => {
      if (isMounted && nb) setNasaBackdrop(nb);
    }).catch(console.warn);

    fetchDailyZenAdvice().then((adv) => {
      if (isMounted && adv) setZenAdvice(adv);
    }).catch(console.warn);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const cycleBackground = () => {
    setZenBg((current) => {
      const idx = ZEN_BG_PRESETS.findIndex((p) => p.id === current);
      const nextPreset = ZEN_BG_PRESETS[(idx + 1) % ZEN_BG_PRESETS.length];
      try {
        localStorage.setItem('phocus_zen_bg', nextPreset.id);
      } catch (e) {
        // ignore
      }
      return nextPreset.id;
    });
  };

  useEffect(() => {
    if (mode === 'chill') {
      setShowUniverse(true);
    }
  }, [mode]);

  // Auto-hide UI elements after 2.5 seconds of mouse inactivity
  useEffect(() => {
    if (!isOpen) return;

    const wakeUI = () => {
      setIsMouseActive(true);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 2500); // 2.5s idle threshold
    };

    // Initial wake & schedule hide
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Space bar to toggle play/pause
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

  const activeBgObj = ZEN_BG_PRESETS.find((p) => p.id === zenBg) || ZEN_BG_PRESETS[0];
  const fogColors = getFogColors(mode, zenBg);
  const showFogSphere = zenBg !== 'oled';

  return (
    <div
      className={`fullscreen-zen-overlay zen-bg-${zenBg} mode-${mode} ${
        showUniverse ? 'ambient-universe-active' : ''
      } ${!isMouseActive ? 'zen-idle' : 'zen-active'}`}
      data-mode={mode}
    >
      {/* 🌌 3D Deep Space Starfield Simulation */}
      {(zenBg === 'space' || (zenBg === 'auto' && (mode === 'work' || mode === 'chill'))) && (
        <StarfieldBackground starCount={360} speed={0.4} />
      )}

      {/* 🎌 Tokyo Drift Katakana Matrix Neon Ambient */}
      {zenBg === 'matrix' && <TokyoDriftMatrixBackground />}

      {/* 🌌 NASA Cosmic Deep-Space Backdrop (Only in Cosmic Scene when available) */}
      {zenBg === 'space' && nasaBackdrop?.url && (
        <div
          className="zen-nasa-backdrop"
          style={{ backgroundImage: `url(${nasaBackdrop.url})` }}
          title={`NASA Deep Space: ${nasaBackdrop.title}`}
        />
      )}

      {/* 🔮 Volumetric Ray-Marched Fog Sphere (React Bits Component) */}
      {showFogSphere && zenBg !== 'matrix' && zenBg !== 'space' && (
        <FogSphere
          coreColor={fogColors.core}
          glowColor={fogColors.glow}
          sphereRadius={1.75}
          rotationSpeed={0.5}
          opacity={zenBg === 'fog' ? 0.95 : 0.4}
          brightness={zenBg === 'fog' ? 1.25 : 1.05}
          rayMarchSteps={20}
          turbulenceIters={4}
        />
      )}

      {/* 🌌 Mode-Adaptive Atmospheric Aurora Glow Effects */}
      <div className="zen-mode-aurora-layer" />

      {/* 🌌 Ambient Living Companion Universe (20 Staggered Chit-Chat Clusters) */}
      {showUniverse && (
        <AmbientCompanionUniverse isRunning={isRunning} progress={progress} />
      )}

      {/* Top Bar */}
      <div className="fullscreen-top-bar">
        {/* Brand: Persistent Symbol + Auto-hiding Shimmer Typography */}
        <div className="zen-brand">
          <div className="zen-symbol-wrapper">
            <FocusLogo size={32} className="brand-logo-icon zen-persistent-symbol" />
          </div>
          <div className="zen-brand-text auto-hide-element">
            <ShinyText text={mode === 'chill' ? 'CHILL LOUNGE' : 'ZENCUS ZEN'} speed={3} />
          </div>
        </div>

        {/* Actions & Live Weather Capsule (Auto-hides on idle) */}
        <div className="zen-top-actions auto-hide-element">
          {/* 🌧️ Real-Time Weather Capsule (Open-Meteo + ipwho.is) */}
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

          {/* Unified Glass Capsule Pill: Auto Background & Universe */}
          <div className="zen-control-pill-group">
            {/* Auto / Scene Switcher Button */}
            <button
              className={`zen-top-pill-btn zen-bg-picker-btn ${zenBg !== 'auto' ? 'custom-active' : ''}`}
              onClick={cycleBackground}
              title={`Background Scene: ${activeBgObj.label} (Click to switch)`}
            >
              <span className="zen-btn-icon">{activeBgObj.icon}</span>
              <span className="zen-btn-label">{activeBgObj.label}</span>
            </button>

            <div className="zen-pill-divider" />

            {/* Uiverse Neumorphic Switch (witty-fly-56): Companion Universe Toggle */}
            <div
              className="zen-switch-pill-item"
              title={showUniverse ? 'Companion Universe: ACTIVE (Toggle off)' : 'Companion Universe: IDLE (Toggle on)'}
            >
              <span className="zen-switch-mini-label">
                <Sparkles size={13} className="zen-sparkle-icon" />
                <span>Universe</span>
              </span>
              <WittyFlySwitch
                checked={showUniverse}
                onChange={(val) => setShowUniverse(val)}
                width="3.5rem"
                accentHue="142deg"
                baseHue="220deg"
              />
            </div>
          </div>

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

      {/* Center Display: Time Digits & Clean Linear Progress Bar */}
      <div className="fullscreen-center-content">
        <div className="zen-mode-tag auto-hide-element">
          {mode === 'chill'
            ? 'RELAX & CHILL • 30 MIN LOUNGE'
            : mode === 'work'
            ? 'DEEP WORK FOCUS'
            : mode === 'shortBreak'
            ? 'QUICK REFRESH BREAK'
            : 'RESTORATIVE LONG BREAK'}
        </div>

        {/* The Time Digits (Always Visible) */}
        <div
          className="zen-digits"
          onClick={isRunning ? pauseTimer : startTimer}
          title="Click to Pause/Resume"
        >
          {formattedTime}
        </div>

        {/* ══ Clean Minimalist Linear Progress Bar (No Companions) ══ */}
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


        {/* Controls: Pause & Reset (Auto-hides on idle, reveals on mouse move) */}
        <div className="zen-controls auto-hide-element">
          <MagnetButton
            className="btn-action primary zen-main-btn"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
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
    </div>
  );
}
