import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Target, Sparkles, Volume2, BookOpen } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import DecryptedText from '../react-bits/DecryptedText';
import SpotlightCard from '../react-bits/SpotlightCard';
import FocusCompanion from '../companion/FocusCompanion';
import StreakBadge from '../companion/StreakBadge';
import AmbientSoundscapes from '../ambient/AmbientSoundscapes';
import JazzRadioPlayer from '../ambient/JazzRadioPlayer';
import IsometricEditorialDial from './IsometricEditorialDial';

const PRESETS = [
  { label: '15m', duration: 15 * 60 },
  { label: '25m', duration: 25 * 60 },
  { label: '45m', duration: 45 * 60 },
  { label: '60m', duration: 60 * 60 }
];

export default function PomodoroTimer({
  timeLeft,
  totalDuration,
  isRunning,
  mode,
  setMode,
  startTimer,
  pauseTimer,
  resetTimer,
  skipTimer,
  setCustomDuration,
  sessionsCompleted,
  totalFocusMinutes,
  xp = 0,
  companionType = 'dino',
  onOpenPicker,
  onSelectCompanion,
  theme = 'light'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(totalDuration / 60));

  const hasCompanion = companionType && companionType !== 'none';

  // Responsive check: Desktop Landscape (width >= 1024px and landscape orientation)
  const [isDesktopLandscape, setIsDesktopLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024 && window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const handleCheck = () => {
      setIsDesktopLandscape(window.innerWidth >= 1024 && window.innerWidth > window.innerHeight);
    };
    handleCheck();
    window.addEventListener('resize', handleCheck);
    return () => window.removeEventListener('resize', handleCheck);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(editMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      setCustomDuration(val * 60);
    }
    setIsEditing(false);
  };

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

  // Shared Subcomponents
  const visualizerElement = (
    <IsometricEditorialDial
      timeLeft={timeLeft}
      totalDuration={totalDuration}
      isRunning={isRunning}
      mode={mode}
      getModeTitle={getModeTitle}
      formatTime={formatTime}
      isEditing={isEditing}
      editMinutes={editMinutes}
      setEditMinutes={setEditMinutes}
      handleEditSubmit={handleEditSubmit}
      setIsEditing={setIsEditing}
    />
  );

  const radioElement = <JazzRadioPlayer />;

  const companionElement = hasCompanion && (
    <FocusCompanion
      state={isRunning ? 'working' : mode === 'work' ? 'idle' : 'breakTime'}
      sessionsCompleted={sessionsCompleted}
      streak={sessionsCompleted}
      theme={theme}
      companionType={companionType}
      onOpenPicker={onOpenPicker}
      onRemovePet={() => onSelectCompanion?.('none')}
    />
  );

  const xpElement = (
    <div className="timer-top-xp-row">
      <StreakBadge xp={xp} sessions={sessionsCompleted} />
    </div>
  );

  const modeSelectorElement = (
    <div className="mode-selector minimal-mode-selector">
      <button
        className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
        onClick={() => setMode('work')}
      >
        <Target size={13} />
        <span>Focus</span>
      </button>
      <button
        className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
        onClick={() => setMode('shortBreak')}
      >
        <Sparkles size={13} />
        <span>Short Break</span>
      </button>
      <button
        className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
        onClick={() => setMode('longBreak')}
      >
        <Flame size={13} />
        <span>Long Break</span>
      </button>
      <button
        className={`mode-btn ${mode === 'chill' ? 'active' : ''}`}
        onClick={() => setMode('chill')}
      >
        <BookOpen size={13} />
        <span>Lounge</span>
      </button>
    </div>
  );

  const presetsElement = (
    <div className="preset-pills minimal-presets">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          className={`preset-pill ${totalDuration === preset.duration ? 'active' : ''}`}
          onClick={() => setCustomDuration(preset.duration)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );

  const controlsElement = (
    <div className="minimal-timer-controls flex items-center justify-center gap-4 w-full">
      {/* Primary Hero Start/Pause Button */}
      <button
        className={`hero-start-btn flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-mono font-bold text-sm tracking-wide text-white transition-all active:scale-95 shadow-[2px_2px_0px_#121212] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.2)] ${
          isRunning
            ? 'bg-[#18181b] border-2 border-[#18181b] dark:border-[rgba(255,255,255,0.3)] hover:bg-[#27272a]'
            : 'bg-[#ff3b30] border-2 border-[#ff3b30] hover:bg-[#e03126]'
        }`}
        onClick={isRunning ? pauseTimer : startTimer}
        aria-label={isRunning ? 'Pause Timer' : 'Start Focus'}
      >
        {isRunning ? (
          <>
            <Pause size={15} fill="currentColor" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={15} fill="currentColor" className="ml-0.5" />
            <span>Start Focus</span>
          </>
        )}
      </button>

      {/* Secondary Quick-Action Icon Buttons */}
      <button
        className="control-icon-btn flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.15)]"
        onClick={resetTimer}
        aria-label="Reset Timer"
        title="Reset"
      >
        <RotateCcw size={15} />
      </button>

      <button
        className="control-icon-btn flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.15)]"
        onClick={skipTimer}
        aria-label="Skip to next session"
        title="Skip"
      >
        <SkipForward size={15} />
      </button>
    </div>
  );

  const soundscapesElement = <AmbientSoundscapes />;

  const masterControlConsole = (
    <div className="timer-controls-flow flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* 1. Focus Mode Capsule */}
      <div className="w-full flex justify-center mb-6">
        {modeSelectorElement}
      </div>

      {/* 2. Duration Presets */}
      <div className="w-full flex justify-center mb-7">
        {presetsElement}
      </div>

      {/* 3. Transport Controls */}
      <div className="w-full flex justify-center mb-7">
        {controlsElement}
      </div>

      {/* 4. Focus Atmosphere Generator */}
      <div className="w-full flex justify-center mb-5">
        {soundscapesElement}
      </div>
    </div>
  );

  const statsElement = (
    <div className="minimal-stats-strip flex flex-row items-center justify-center gap-4 text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap select-none py-1">
      <div className="flex items-center gap-1.5">
        <Target size={14} className="text-[#ff3b30]" />
        <span className="font-bold text-[var(--text-primary)]">{sessionsCompleted}</span>
        <span>Sessions</span>
      </div>
      <span className="text-[var(--text-tertiary)] opacity-60">•</span>
      <div className="flex items-center gap-1.5">
        <Flame size={14} className="text-[#ff3b30]" />
        <span className="font-bold text-[var(--text-primary)]">{totalFocusMinutes}</span>
        <span>mins focused</span>
      </div>
    </div>
  );

  return (
    <div className={`timer-view editorial-theme-view ${isDesktopLandscape ? 'layout-landscape' : 'layout-portrait'} ${!hasCompanion ? 'no-companion' : ''}`}>
      {isDesktopLandscape ? (
        /* ══════════ DESKTOP LANDSCAPE STUDIO CONSOLE ══════════ */
        <div className="timer-landscape-grid">
          {/* Left Wing / Deck: 3D Turntable Hero Visualizer & Vintage Radio Player */}
          <div className="timer-landscape-left-deck">
            {visualizerElement}
            {radioElement}
          </div>

          {/* Right Wing / Deck: Companion, Control Console & Analytics */}
          <div className="timer-landscape-right-deck">
            {xpElement}
            {companionElement}
            {masterControlConsole}
            {statsElement}
          </div>
        </div>
      ) : (
        /* ══════════ PORTRAIT LAYOUT FOR OTHERS (Mobile, Tablets, Portrait Displays) ══════════ */
        <div className="timer-portrait-stack">
          {xpElement}
          {companionElement}
          {visualizerElement}
          {masterControlConsole}
          {radioElement}
          {statsElement}
        </div>
      )}
    </div>
  );
}
