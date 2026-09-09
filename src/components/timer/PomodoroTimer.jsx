import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Target, Sparkles, Volume2, BookOpen, Maximize2 } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import ShinyButton from '../react-bits/ShinyButton';
import DecryptedText from '../react-bits/DecryptedText';
import SpotlightCard from '../react-bits/SpotlightCard';
import FocusCompanion from '../companion/FocusCompanion';
import StreakBadge from '../companion/StreakBadge';
import AmbientSoundscapes from '../ambient/AmbientSoundscapes';
import JazzRadioPlayer from '../ambient/JazzRadioPlayer';
import IsometricEditorialDial from './IsometricEditorialDial';
import GlobeVisualizer from './GlobeVisualizer';
import MinimalVisualizer from './MinimalVisualizer';

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
  onOpenFullscreen,
  theme = 'light'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(totalDuration / 60));
  const [visualizerType, setVisualizerType] = useState('turntable'); // 'turntable' | 'globe'

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
    <div className="timer-visualizer-deck flex flex-col items-start w-full">
      {/* Visualizer Mode Switcher (Turntable vs 3D Global Flow) */}
      <div className="visualizer-toggle-capsule flex items-center justify-start gap-2 mb-2 px-4">
        <ShinyButton
          variant="pill"
          size="sm"
          active={visualizerType === 'turntable'}
          onClick={() => setVisualizerType('turntable')}
          className="visualizer-toggle-btn"
          title="Switch to Hi-Fi Turntable Vinyl Dial"
        >
          <span>📻 Turntable</span>
        </ShinyButton>
        <ShinyButton
          variant="pill"
          size="sm"
          active={visualizerType === 'globe'}
          onClick={() => setVisualizerType('globe')}
          className="visualizer-toggle-btn"
          title="Switch to React Bits Interactive 3D Globe"
        >
          <span>🌍 3D Globe</span>
        </ShinyButton>
        <ShinyButton
          variant="pill"
          size="sm"
          active={visualizerType === 'minimal'}
          onClick={() => setVisualizerType('minimal')}
          className="visualizer-toggle-btn"
          title="Switch to Ultra-Clean Minimal Focus Dial"
        >
          <span>◌ Minimal</span>
        </ShinyButton>
      </div>

      {visualizerType === 'minimal' ? (
        <MinimalVisualizer
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
          startTimer={startTimer}
          pauseTimer={pauseTimer}
        />
      ) : visualizerType === 'globe' ? (
        <GlobeVisualizer
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
      ) : (
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
      )}
    </div>
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
        <ShinyButton
          key={preset.label}
          variant="pill"
          size="sm"
          active={totalDuration === preset.duration}
          onClick={() => setCustomDuration(preset.duration)}
          className="preset-pill"
        >
          {preset.label}
        </ShinyButton>
      ))}
    </div>
  );

  const controlsElement = (
    <div className="minimal-timer-controls">
      {/* Primary Hero Start/Pause Button with React Bits Shiny Shimmer & Magnet */}
      <ShinyButton
        variant="primary"
        size="lg"
        onClick={isRunning ? pauseTimer : startTimer}
        ariaLabel={isRunning ? 'Pause Timer' : 'Start Focus'}
        className={`hero-start-btn ${isRunning ? 'btn-running' : ''}`}
        icon={
          isRunning ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />
          )
        }
      >
        {isRunning ? 'Pause' : 'Start Focus'}
      </ShinyButton>

      {/* Secondary Quick-Action Icon Buttons */}
      <ShinyButton
        variant="icon"
        size="md"
        onClick={resetTimer}
        ariaLabel="Reset Timer"
        title="Reset"
        className="control-icon-btn"
      >
        <RotateCcw size={16} />
      </ShinyButton>

      <ShinyButton
        variant="icon"
        size="md"
        onClick={skipTimer}
        ariaLabel="Skip to next session"
        title="Skip"
        className="control-icon-btn"
      >
        <SkipForward size={16} />
      </ShinyButton>

      {onOpenFullscreen && (
        <ShinyButton
          variant="icon"
          size="md"
          onClick={onOpenFullscreen}
          ariaLabel="Launch Fullscreen Zen Focus Mode"
          title="Fullscreen Zen Mode (F)"
          className="control-icon-btn"
        >
          <Maximize2 size={16} />
        </ShinyButton>
      )}
    </div>
  );

  const soundscapesElement = <AmbientSoundscapes />;

  const masterControlConsole = (
    <div className="timer-controls-flow">
      {/* 1. Focus Mode Capsule */}
      <div className="timer-control-row timer-row-mode">
        {modeSelectorElement}
      </div>

      {/* 2. Duration Presets */}
      <div className="timer-control-row timer-row-presets">
        {presetsElement}
      </div>

      {/* 3. Transport Controls */}
      <div className="timer-control-row timer-row-controls">
        {controlsElement}
      </div>

      {/* 4. Focus Atmosphere Generator */}
      <div className="timer-control-row timer-row-soundscapes">
        {soundscapesElement}
      </div>
    </div>
  );

  const statsElement = (
    <div className="minimal-stats-strip">
      <div className="stats-metric-item">
        <Target size={14} className="stats-icon text-[#ff3b30]" />
        <span className="stats-val">{sessionsCompleted}</span>
        <span className="stats-lbl">Sessions</span>
      </div>
      <span className="stats-dot">•</span>
      <div className="stats-metric-item">
        <Flame size={14} className="stats-icon text-[#ff3b30]" />
        <span className="stats-val">{totalFocusMinutes}</span>
        <span className="stats-lbl">mins focused</span>
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
