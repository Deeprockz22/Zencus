import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Target, Sparkles, Volume2, BookOpen, Feather, PictureInPicture2, Keyboard } from 'lucide-react';
import ShinyButton from '../react-bits/ShinyButton';
import FocusCompanion from '../companion/FocusCompanion';
import StreakBadge from '../companion/StreakBadge';
import AmbientSoundscapes from '../ambient/AmbientSoundscapes';
import DreamPortal from './DreamPortal';
import PrismRecord from './PrismRecord';
import MeltingClock from './MeltingClock';
import GlyphVinylRecorder from './GlyphVinylRecorder';
import MinimalVisualizer from './MinimalVisualizer';
import { isSurrealTheme, isLanternTheme, scenesFor, resolveScene } from '../../themeFamilies';
import PaperLantern from './PaperLantern';
import GlyphDotMatrixTimer from './GlyphDotMatrixTimer';
import GreenDotMatrixWall from './GreenDotMatrixWall';
import { sfx, SOUND_PACKS } from '../../utils/sfx';
import { gsapMotion } from '../../utils/gsapMotion';
import MindfulBreathGuide from './MindfulBreathGuide';

const PRESETS = [
  { label: '15', duration: 15 * 60 },
  { label: '25', duration: 25 * 60 },
  { label: '45', duration: 45 * 60 },
  { label: '60', duration: 60 * 60 }
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
  visualizerType = 'wall',
  setVisualizerType,
  theme = 'light',
  isFullscreen = false,
  activeTimerTask = null,
  onClearActiveTask,
  activeTab = 'timer',
  setActiveTab,
  openSettings,
  soundEnabled,
  toggleSound,
  onOpenParkingLot,
  onTogglePiP,
  intention = '',
  setIntention,
  onOpenShortcuts
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(totalDuration / 60));
  const [activeSoundPack, setActiveSoundPack] = useState(() => sfx.pack || 'zen');

  const hasCompanion = companionType && companionType !== 'none';

  // Responsive check for desktop split layout
  const [isDesktopSplit, setIsDesktopSplit] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopSplit(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setEditMinutes(Math.floor(totalDuration / 60));
  }, [totalDuration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(editMinutes, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      setCustomDuration(mins * 60);
      setIsEditing(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'work':
        return 'Focus Session';
      case 'shortBreak':
        return 'Quick Refresh Break';
      case 'longBreak':
        return 'Restorative Long Break';
      default:
        return 'Focus Session';
    }
  };

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // ══════════════════════════════════════════════════════════
  // MONOLITHIC GREEN DOT MATRIX WALL (Primary User Interface)
  // Left 1/4th controls + Right 3/4th giant black clock
  // ══════════════════════════════════════════════════════════
  if (visualizerType === 'wall') {
    return (
      <GreenDotMatrixWall
        surreal={isSurrealTheme(theme)}
        scenes={scenesFor(theme)}
        timeLeft={timeLeft}
        totalDuration={totalDuration}
        isRunning={isRunning}
        mode={mode}
        setMode={setMode}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        resetTimer={resetTimer}
        skipTimer={skipTimer}
        getModeTitle={getModeTitle}
        formatTime={formatTime}
        setCustomDuration={setCustomDuration}
        activeTimerTask={activeTimerTask}
        onClearActiveTask={onClearActiveTask}
        sessionsCompleted={sessionsCompleted}
        totalFocusMinutes={totalFocusMinutes}
        onOpenFullscreen={onOpenFullscreen}
        visualizerType={visualizerType}
        setVisualizerType={setVisualizerType}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={openSettings}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />
    );
  }

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
    hideHeader: true
  };

  // ══════════════════════════════════════════════════════════
  // LEFT SIDE: ALL TIMER CONTROLS (UNBOXED Floating Console - Compact)
  // ══════════════════════════════════════════════════════════
  const leftControlsDeck = (
    <div className="glyph-timer-left-console flex flex-col justify-between w-full max-w-[330px] xl:max-w-[345px] h-full p-1.5 sm:p-2.5 lg:p-3 select-none">
      {/* 1. Mode selector (UNBOXED) */}
      <div className="glyph-console-header flex flex-col gap-2">
        {/* Mode Selector Strip (UNBOXED - Nothing Style) */}
        <div className="glyph-mode-strip flex items-center justify-between gap-1.5 pb-1.5 border-b border-[var(--border-subtle)] flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              className={`glyph-mode-btn whitespace-nowrap flex items-center gap-1 py-0.5 px-1.5 text-[10px] font-mono font-medium transition-all ${
                mode === 'work'
                  ? 'active text-[var(--text-primary)] font-bold'
                  : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'
              }`}
              onClick={() => {
                setMode('work');
                sfx.play('select');
              }}
            >
              <Target size={10} className={mode === 'work' ? 'text-[#ff3b30]' : ''} />
              <span>Focus</span>
              {mode === 'work' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />}
            </button>
            <button
              className={`glyph-mode-btn whitespace-nowrap flex items-center gap-1 py-0.5 px-1.5 text-[10px] font-mono font-medium transition-all ${
                mode === 'shortBreak'
                  ? 'active text-[var(--text-primary)] font-bold'
                  : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'
              }`}
              onClick={() => {
                setMode('shortBreak');
                sfx.play('select');
              }}
            >
              <Sparkles size={10} className={mode === 'shortBreak' ? 'text-[#ff3b30]' : ''} />
              <span>Short Break</span>
              {mode === 'shortBreak' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />}
            </button>
            <button
              className={`glyph-mode-btn whitespace-nowrap flex items-center gap-1 py-0.5 px-1.5 text-[10px] font-mono font-medium transition-all ${
                mode === 'longBreak'
                  ? 'active text-[var(--text-primary)] font-bold'
                  : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'
              }`}
              onClick={() => {
                setMode('longBreak');
                sfx.play('select');
              }}
            >
              <Flame size={10} className={mode === 'longBreak' ? 'text-[#ff3b30]' : ''} />
              <span>Long Break</span>
              {mode === 'longBreak' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Giant Glyph Timer Digits & Progress Meter (UNBOXED - Crisp Compact NDot) */}
      <div className="glyph-digits-hero flex flex-col items-start my-2 sm:my-2.5">
        <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#ff3b30] mb-1 flex items-center gap-1.5">
          <span>●</span>
          <span>{getModeTitle()}</span>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="timer-edit-form my-1 flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="180"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              autoFocus
              onBlur={() => setIsEditing(false)}
              className="timer-edit-input text-3xl sm:text-4xl font-black bg-transparent border-b-2 border-[var(--text-primary)] text-[var(--text-primary)] px-2 py-0.5 font-mono tracking-tight outline-none"
            />
            <span className="timer-edit-label font-mono font-bold text-[10px] text-[var(--text-secondary)] uppercase">
              MIN // ENTER
            </span>
          </form>
        ) : (
          <div
            className="glyph-time-display cursor-pointer hover:opacity-90 transition-opacity select-none py-0.5"
            onClick={() => {
              if (!isRunning) {
                setEditMinutes(Math.floor(timeLeft / 60));
                setIsEditing(true);
              }
            }}
            title={isRunning ? undefined : 'Click to adjust session minutes'}
          >
            <GlyphDotMatrixTimer
              timeString={formatTime(timeLeft)}
              isRunning={isRunning}
              dotPitch={6.8}
              dotRadius={2.4}
            />
          </div>
        )}

        {/* Linear Glyph LED Progress Gauge (Unboxed 1px hairline trace) */}
        <div className="glyph-progress-wrap w-full mt-2">
          <div className="flex justify-between items-center text-[8.5px] font-mono text-[var(--text-tertiary)] mb-0.5">
            <span>PROGRESS</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="glyph-linear-bar w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#ff3b30] transition-all duration-300 rounded-full shadow-[0_0_8px_#ff3b30]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Duration Presets & Hero Controls (UNBOXED - Nothing Style) */}
      <div className="glyph-transport-section flex flex-col gap-2">
        {/* Preset Pills with Nothing Micro-Brackets */}
        <div className="preset-pills glyph-presets flex items-center gap-1">
          {PRESETS.map((preset) => (
            <ShinyButton
              key={preset.label}
              variant="pill"
              size="sm"
              active={totalDuration === preset.duration}
              onClick={(e) => {
                gsapMotion.pulse(e.currentTarget, { scale: 1.08, duration: 0.25 });
                setCustomDuration(preset.duration);
                sfx.play('select');
              }}
              className="preset-pill glyph-preset-btn flex-1 py-0.5 text-[10px] font-mono font-medium"
            >
              <span className="opacity-35 font-normal mr-0.5">(</span>
              <span>{preset.label}</span>
              <span className="opacity-35 font-normal ml-0.5">)</span>
            </ShinyButton>
          ))}
        </div>

        {/* Active Task (UNBOXED Floating Status) */}
        {activeTimerTask && (
          <div className="active-timer-task-pill flex items-center justify-between py-0.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shrink-0 shadow-[0_0_6px_#ff3b30]" />
              <span className="task-pill-text text-[var(--text-primary)] truncate font-semibold text-[11px]">
                Focusing on: {activeTimerTask.title}
              </span>
            </div>
            <button
              className="task-pill-clear ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm font-bold"
              onClick={onClearActiveTask}
              title="Clear Task"
            >
              ×
            </button>
          </div>
        )}

        {/* Intention Line (#3) */}
        {mode === 'work' && (
          <div className="intention-line-row flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] transition-all focus-within:border-[var(--accent)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] shrink-0 select-none">
              Aim:
            </span>
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention && setIntention(e.target.value)}
              placeholder="What are you giving this session to?"
              className="bg-transparent border-none outline-none text-[11px] text-[var(--text-primary)] w-full placeholder:text-[var(--text-tertiary)] placeholder:italic font-sans"
              maxLength={100}
            />
          </div>
        )}

        {/* Mindful Breath Guide during Breaks (#29) */}
        {mode !== 'work' && isRunning && (
          <MindfulBreathGuide isActive={true} />
        )}

        {/* Hero Transport Buttons (Compact) */}
        <div className="glyph-hero-controls flex items-center gap-2">
          <ShinyButton
            variant="primary"
            size="lg"
            onClick={(e) => {
              gsapMotion.pulse(e.currentTarget, { scale: 1.04, duration: 0.3 });
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            ariaLabel={isRunning ? 'Pause Timer' : 'Start Focus'}
            className={`hero-start-btn glyph-start-btn flex-1 py-2 sm:py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-full ${
              isRunning ? 'btn-running bg-[#ff3b30] text-white' : ''
            }`}
            icon={
              isRunning ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
              )
            }
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </ShinyButton>

          <ShinyButton
            variant="icon"
            size="md"
            onClick={resetTimer}
            ariaLabel="Reset Timer"
            title="Reset"
            className="control-icon-btn glyph-icon-btn p-2 rounded-full text-[var(--text-primary)] hover:bg-white/5"
          >
            <RotateCcw size={14} />
          </ShinyButton>

          <ShinyButton
            variant="icon"
            size="md"
            onClick={skipTimer}
            ariaLabel="Skip to next session"
            title="Skip"
            className="control-icon-btn glyph-icon-btn p-2 rounded-full text-[var(--text-primary)] hover:bg-white/5"
          >
            <SkipForward size={14} />
          </ShinyButton>

          {onOpenParkingLot && (
            <ShinyButton
              variant="icon"
              size="md"
              onClick={onOpenParkingLot}
              ariaLabel="Open Stray Thought Tray (P)"
              title="Park Intrusive Thought (Press P)"
              className="control-icon-btn glyph-icon-btn p-2 rounded-full text-[var(--text-primary)] hover:bg-white/5"
            >
              <Feather size={14} />
            </ShinyButton>
          )}

          {onTogglePiP && (
            <ShinyButton
              variant="icon"
              size="md"
              onClick={onTogglePiP}
              ariaLabel="Floating Mini Window (PiP)"
              title="Floating Mini Window (PiP)"
              className="control-icon-btn glyph-icon-btn p-2 rounded-full text-[var(--text-primary)] hover:bg-white/5"
            >
              <PictureInPicture2 size={14} />
            </ShinyButton>
          )}

          {onOpenShortcuts && (
            <ShinyButton
              variant="icon"
              size="md"
              onClick={onOpenShortcuts}
              ariaLabel="Keyboard Shortcuts (?)"
              title="Keyboard Shortcuts (Press ?)"
              className="control-icon-btn glyph-icon-btn p-2 rounded-full text-[var(--text-primary)] hover:bg-white/5"
            >
              <Keyboard size={14} />
            </ShinyButton>
          )}
        </div>
      </div>

      {/* 4. Focus Soundscapes & Quick Audio */}
      <div className="glyph-soundscapes-row mt-2 pt-2">
        <AmbientSoundscapes />
      </div>

      {/* Stats */}
      <div className="glyph-footer-stats pt-1 text-[10px] font-mono text-[var(--text-secondary)]">
        {sessionsCompleted} sessions &middot; {totalFocusMinutes}m focused
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // RIGHT SIDE: HUGE GLYPH VINYL RECORDER (UNBOXED)
  // ══════════════════════════════════════════════════════════
  const surreal = isSurrealTheme(theme);
  const lantern = isLanternTheme(theme);
  // each theme family has its own scenes; a foreign scene falls back to the
  // family's signature one (see themeFamilies.js)
  const scenes = scenesFor(theme);
  const activeScene = resolveScene(theme, visualizerType);

  const rightVinylDeck = (
    <div className="glyph-timer-right-stage flex flex-col items-center justify-center w-full h-full p-1 sm:p-2 lg:p-3 relative">
      {/* Streamlined Scene Switcher (Segmented Control - Steve R3-D4: plain words, no icons, no slashes).
          Each theme family has its own scenes (Crisp: the original three; Surreal and Lantern: their own art). */}
      {scenes.length > 1 && <div className="scene-switcher-pills flex items-center justify-center p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] gap-1 mb-2 z-10">
        {scenes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`scene-toggle-pill px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeScene === value
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => {
              setVisualizerType(value);
              sfx.play('select');
            }}
          >
            {label}
          </button>
        ))}
      </div>}

      {/* Visualizer Stage */}
      <div className="glyph-visualizer-container w-full h-full flex items-center justify-center">
        {lantern && activeScene === 'lantern' ? (
          <PaperLantern {...vizProps} />
        ) : surreal ? (
          activeScene === 'portal' ? (
            <DreamPortal {...vizProps} />
          ) : activeScene === 'minimal' ? (
            <MeltingClock {...vizProps} />
          ) : (
            <PrismRecord {...vizProps} />
          )
        ) : activeScene === 'minimal' ? (
          <MinimalVisualizer {...vizProps} />
        ) : (
          <GlyphVinylRecorder {...vizProps} hideTelemetry />
        )}
      </div>
    </div>
  );

  return (
    <div className={`glyph-split-view w-full h-full min-h-[calc(100vh-140px)] flex flex-col ${isDesktopSplit ? 'glyph-layout-desktop' : 'glyph-layout-mobile'}`}>
      {isDesktopSplit ? (
        /* DESKTOP SPLIT: Open continuous canvas, zero boxes */
        <div className="glyph-split-container grid grid-cols-1 lg:grid-cols-[minmax(270px,330px)_minmax(600px,1fr)] xl:grid-cols-[minmax(290px,350px)_minmax(680px,1fr)] w-full h-full max-w-[1540px] mx-auto gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center">
          <div className="glyph-split-left w-full h-full flex items-center justify-center lg:justify-end">
            {leftControlsDeck}
          </div>
          <div className="glyph-split-right w-full h-full flex items-center justify-center lg:justify-start">
            {rightVinylDeck}
          </div>
        </div>
      ) : (
        /* MOBILE / PORTRAIT: Stacked seamlessly without card boxes.
           Controls (mode, digits, Start) come first so the thing a person
           opened the timer for is visible without scrolling past the
           decorative record player. */
        <div className="glyph-mobile-stack flex flex-col w-full max-w-xl mx-auto gap-4 mb-16">
          <div className="glyph-mobile-top-controls w-full">
            {leftControlsDeck}
          </div>
          <div className="glyph-mobile-bottom-recorder w-full">
            {rightVinylDeck}
          </div>
        </div>
      )}
    </div>
  );
}
