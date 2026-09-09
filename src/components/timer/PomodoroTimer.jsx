import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Target, Sparkles, Volume2, BookOpen } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import DecryptedText from '../react-bits/DecryptedText';
import SpotlightCard from '../react-bits/SpotlightCard';
import FocusCompanion from '../companion/FocusCompanion';
import StreakBadge from '../companion/StreakBadge';
import AmbientSoundscapes from '../ambient/AmbientSoundscapes';
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
  theme = 'light'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(totalDuration / 60));

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

  return (
    <div className="timer-view editorial-theme-view">
      {/* Top XP & Level Bar */}
      <div className="timer-top-xp-row">
        <StreakBadge xp={xp} sessions={sessionsCompleted} />
      </div>

      {/* Interactive Companion Mascot & Dialogue */}
      <FocusCompanion
        state={isRunning ? 'working' : mode === 'work' ? 'idle' : 'breakTime'}
        sessionsCompleted={sessionsCompleted}
        streak={sessionsCompleted}
        theme={theme}
        companionType={companionType}
        onOpenPicker={onOpenPicker}
      />

      {/* Mode Selector */}
      <div className="mode-selector editorial-mode-selector">
        <button
          className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
          onClick={() => setMode('work')}
        >
          <Target size={15} />
          <span>Work</span>
        </button>
        <button
          className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => setMode('shortBreak')}
        >
          <Sparkles size={15} />
          <span>Short Break</span>
        </button>
        <button
          className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => setMode('longBreak')}
        >
          <Flame size={15} />
          <span>Long Break</span>
        </button>
        <button
          className={`mode-btn ${mode === 'chill' ? 'active' : ''}`}
          onClick={() => setMode('chill')}
        >
          <BookOpen size={15} />
          <span>Lounge</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="preset-pills">
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

      {/* Central 3D Isometric Book & Coffee Visualizer */}
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

      {/* Main Action Controls with Hard-Cast Shadows */}
      <div className="timer-controls mt-2">
        <MagnetButton
          className={`btn-action primary ${isRunning ? 'btn-running' : ''}`}
          onClick={isRunning ? pauseTimer : startTimer}
          aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <>
              <Pause size={18} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              <span>Start Focus</span>
            </>
          )}
        </MagnetButton>

        <MagnetButton
          className="btn-action secondary"
          onClick={resetTimer}
          aria-label="Reset Timer"
          title="Reset"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </MagnetButton>

        <MagnetButton
          className="btn-action secondary"
          onClick={skipTimer}
          aria-label="Skip to next session"
          title="Skip"
        >
          <SkipForward size={18} />
          <span>Skip</span>
        </MagnetButton>
      </div>

      {/* Procedural Ambient Soundscapes */}
      <AmbientSoundscapes />

      {/* Stats Cards with Hard-Cast Block Shadows */}
      <div className="stats-row">
        <div className="stat-card editorial-stat-card">
          <div className="stat-header">
            <Target size={16} className="stat-icon text-[#ff3b30]" />
            <span className="stat-label">Sessions Completed</span>
          </div>
          <div className="stat-value">{sessionsCompleted}</div>
        </div>

        <div className="stat-card editorial-stat-card">
          <div className="stat-header">
            <Flame size={16} className="stat-icon text-[#ff3b30]" />
            <span className="stat-label">Total Focus Time</span>
          </div>
          <div className="stat-value">{totalFocusMinutes} <span className="stat-unit">mins</span></div>
        </div>
      </div>
    </div>
  );
}

