import React from 'react';
import {
  Play, Pause, RotateCcw, SkipForward,
  Volume2, CloudRain, Droplets, Radio, Waves
} from 'lucide-react';
import GlyphDotMatrixTimer from './GlyphDotMatrixTimer';
import { sfx } from '../../utils/sfx';
import { gsapMotion } from '../../utils/gsapMotion';
import { ambientSoundscapes } from '../../utils/ambientAudio';
import { jazzRadio } from '../../utils/jazzRadioAudio';
import './matrix-wall.css';

/*
 * Matrix Wall.
 *
 * Crisp (regular) themes: an LED wall in the theme's own paper or charcoal,
 * Nothing-style. A status line, the giant dot-matrix clock, a 60-dot seconds
 * row that fills through each minute (the current second glows red), and the
 * whole session as a row of dots. It sits between the app header and the
 * dock instead of drawing its own copies of them.
 *
 * Surreal theme: the same component is "Golconda" (styled in surreal.css). It
 * keeps its ring and ink palette, because that styling keys off them.
 */

const PRESETS = [
  { label: '15', duration: 15 * 60 },
  { label: '25', duration: 25 * 60 },
  { label: '45', duration: 45 * 60 },
  { label: '60', duration: 60 * 60 }
];

const MODE_LABELS = { work: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };
const MODE_STATUS = { work: 'Focus session', shortBreak: 'Short break', longBreak: 'Long break' };

// Surreal (Golconda) paints its console on light paper in both day and night,
// so it keeps fixed ink colours. The Crisp wall follows the theme's tokens.
const INK = {
  BLACK: '#000000',
  DARK: '#1a1a0a',
  MID: '#2e2e12',
  SOFT: '#3d3d18',
  ON_INK: '#ffffff',
  LINE: 'rgba(0,0,0,0.28)',
};
const TOKENS = {
  BLACK: 'var(--text-primary)',
  DARK: 'var(--text-secondary)',
  MID: 'var(--text-tertiary)',
  SOFT: 'var(--text-muted)',
  ON_INK: 'var(--bg-primary)',
  LINE: 'var(--border-active)',
};
const RED = '#ff3b30';
const GREEN = '#22c55e';

const SESSION_DOTS = 48;

export default function GreenDotMatrixWall({
  surreal = false,
  scenes: scenesProp,
  timeLeft, totalDuration, isRunning, mode, setMode,
  startTimer, pauseTimer, resetTimer, skipTimer,
  getModeTitle, formatTime, setCustomDuration,
  activeTimerTask, onClearActiveTask,
  sessionsCompleted = 0, totalFocusMinutes = 0,
  onOpenFullscreen, visualizerType = 'wall', setVisualizerType,
}) {
  const C = surreal ? INK : TOKENS;
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const formattedTime = typeof formatTime === 'function' ? formatTime(timeLeft) : '25:00';
  const modeLabel = MODE_LABELS[mode] || 'Focus';

  // seconds row: seconds already spent in the current minute (0 at 25:00, 1 at 24:59, …)
  const secondInMinute = (60 - (Math.max(0, timeLeft) % 60)) % 60;
  const litSessionDots = Math.round((progressPercent / 100) * SESSION_DOTS);

  const [activeSound, setActiveSound] = React.useState(null);
  const [soundVolume, setSoundVolume] = React.useState(35);
  const [radioState, setRadioState] = React.useState(() => jazzRadio.getState());

  React.useEffect(() => { return jazzRadio.subscribe((st) => setRadioState(st)); }, []);

  const toggleAmbient = (type) => {
    if (activeSound === type) { ambientSoundscapes.stop(); setActiveSound(null); }
    else {
      if (type === 'window-rain') ambientSoundscapes.playWindowRain();
      if (type === 'zen-rain') ambientSoundscapes.playZenRain();
      if (type === 'whitenoise') ambientSoundscapes.playWhiteNoise();
      if (type === 'alphabeats') ambientSoundscapes.playAlphaBeats();
      setActiveSound(type);
    }
  };

  const toggleRadio = (id) => {
    if (radioState.isPlaying && radioState.currentStation.id === id) jazzRadio.pause();
    else jazzRadio.play(id);
  };

  const activeSoundKey = radioState.isPlaying ? `radio-${radioState.currentStation.id}` : activeSound;

  const SOUNDSCAPE_PILLS = [
    { key: 'radio-sax-ella', label: 'Sax',   icon: '🎷', action: () => toggleRadio('sax-ella') },
    { key: 'radio-jazz24',   label: 'Jazz',  icon: '☕', action: () => toggleRadio('jazz24') },
    { key: 'window-rain',    label: 'Rain',  icon: <CloudRain size={12} />, action: () => toggleAmbient('window-rain') },
    { key: 'zen-rain',       label: 'Zen',   icon: <Droplets size={12} />, action: () => toggleAmbient('zen-rain') },
    { key: 'whitenoise',     label: 'Noise', icon: <Radio size={12} />,    action: () => toggleAmbient('whitenoise') },
    { key: 'alphabeats',     label: 'Alpha', icon: <Waves size={12} />,    action: () => toggleAmbient('alphabeats') },
  ];

  const handleTogglePlay = () => {
    sfx.play('select');
    if (isRunning) { if (pauseTimer) pauseTimer(); }
    else { if (startTimer) startTimer(); }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault(); handleTogglePlay();
      } else if ((e.key === 'f' || e.key === 'F') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && onOpenFullscreen) {
        e.preventDefault(); onOpenFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, pauseTimer, startTimer, onOpenFullscreen]);

  // the theme family's scenes when given (Lantern adds its Paper Lantern)
  const scenes = scenesProp || (surreal
    ? [
        { value: 'portal',    label: 'Dream Portal' },
        { value: 'wall',      label: 'Golconda' },
        { value: 'turntable', label: 'Prism Record' },
        { value: 'minimal',   label: 'Melting Clock' },
      ]
    : [
        { value: 'wall',      label: 'Matrix Wall' },
        { value: 'turntable', label: 'Vinyl Studio' },
        { value: 'minimal',   label: 'Minimal Dial' },
      ]);

  const clockProps = surreal
    ? { activeColor: '#000000', inactiveColor: 'rgba(0,0,0,0.13)' }
    : { activeColor: 'var(--text-primary)', inactiveColor: 'color-mix(in srgb, var(--text-primary) 9%, transparent)' };

  return (
    <div className={`green-dot-matrix-wall ${surreal ? 'is-surreal' : 'is-crisp'} ${isRunning ? 'is-running' : ''} fixed inset-0 w-screen h-screen z-20 flex flex-col select-none overflow-hidden`}>

      {/* Running-state vignette — the wall dims at the edges while you focus */}
      <div className="wall-vignette fixed inset-0 pointer-events-none z-0" aria-hidden="true" />

      {/* LED board texture */}
      <svg className="wall-dot-texture fixed inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="wallDots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wallDots)" />
      </svg>

      {/* MAIN STAGE — between the app header and the dock */}
      <div className="wall-stage relative z-10 flex-1 flex flex-col lg:flex-row min-h-0">

        {/* CONTROLS */}
        <div className="wall-left-panel order-2 lg:order-1 w-full lg:w-[30%] flex flex-col justify-center gap-6 px-8 lg:px-12 xl:px-16 py-6 lg:py-0 max-w-[380px] mx-auto lg:mx-0">

          {/* Mode — passive status */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: RED }} />
            <span className="text-[13px] font-semibold tracking-tight" style={{ color: C.BLACK }}>
              {modeLabel}
            </span>
            {activeTimerTask && (
              <span className="ml-1 text-[11px] truncate max-w-[120px]" style={{ color: C.DARK }}>
                — {activeTimerTask.title}
              </span>
            )}
          </div>

          {/* Time presets */}
          <div className="flex items-center gap-2">
            {PRESETS.map((preset) => {
              const active = totalDuration === preset.duration;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={(e) => {
                    gsapMotion.pulse(e.currentTarget, { scale: 1.08, duration: 0.18 });
                    if (setCustomDuration) setCustomDuration(preset.duration);
                    sfx.play('tick');
                  }}
                  aria-pressed={active}
                  className="wall-preset flex-1 py-2 text-[12px] font-semibold tabular-nums transition-all cursor-pointer rounded-full border"
                  style={
                    active
                      ? { backgroundColor: C.BLACK, color: C.ON_INK, borderColor: C.BLACK }
                      : { backgroundColor: 'transparent', color: C.DARK, borderColor: C.LINE }
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* PRIMARY CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isRunning ? 'Pause' : 'Start Focus'}
              className="wall-cta flex-1 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.97] cursor-pointer"
              style={{
                padding: '14px 20px',
                backgroundColor: surreal ? INK.BLACK : RED,
                color: '#ffffff',
              }}
            >
              {isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>

            {resetTimer && (
              <button
                type="button"
                onClick={() => { sfx.play('toggle'); resetTimer(); }}
                className="wall-round-btn flex items-center justify-center w-11 h-11 rounded-full border transition-all active:scale-95 cursor-pointer"
                style={{ borderColor: C.LINE, color: C.DARK }}
                title="Reset"
                aria-label="Reset"
              >
                <RotateCcw size={15} />
              </button>
            )}

            {skipTimer && (
              <button
                type="button"
                onClick={() => { sfx.play('select'); skipTimer(); }}
                className="wall-round-btn flex items-center justify-center w-11 h-11 rounded-full border transition-all active:scale-95 cursor-pointer"
                style={{ borderColor: C.LINE, color: C.DARK }}
                title="Skip"
                aria-label="Skip"
              >
                <SkipForward size={15} />
              </button>
            )}
          </div>

          {/* Soundscape pills */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {SOUNDSCAPE_PILLS.map((pill) => {
                const isActive = activeSoundKey === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={pill.action}
                    title={pill.label}
                    aria-pressed={isActive}
                    className="wall-pill flex items-center gap-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                    style={
                      isActive
                        ? { padding: '6px 10px', backgroundColor: C.BLACK, color: C.ON_INK, border: `1px solid ${C.BLACK}` }
                        : { padding: '6px 10px', backgroundColor: 'transparent', color: C.DARK, border: `1px solid ${C.LINE}` }
                    }
                  >
                    <span className="leading-none">{pill.icon}</span>
                    <span>{pill.label}</span>
                    {isActive && <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />}
                  </button>
                );
              })}
            </div>

            {activeSoundKey && (
              <div className="flex items-center gap-2">
                <Volume2 size={11} style={{ color: C.SOFT, flexShrink: 0 }} />
                <input
                  type="range" min="0" max="100" value={soundVolume}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setSoundVolume(v);
                    ambientSoundscapes.setVolume(v / 100);
                  }}
                  className="flex-1 cursor-pointer"
                  style={{ accentColor: surreal ? INK.BLACK : RED, height: '2px' }}
                  aria-label="Soundscape volume"
                />
              </div>
            )}
          </div>

          {/* Session count */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: C.BLACK }}>
                {sessionsCompleted}
              </span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: C.MID }}>
                {sessionsCompleted === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="w-px h-7 rounded-full" style={{ backgroundColor: C.LINE }} />
            <div className="flex flex-col">
              <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: C.BLACK }}>
                {totalFocusMinutes}
              </span>
              <span className="text-[10px] font-medium mt-0.5" style={{ color: C.MID }}>
                min focused
              </span>
            </div>
          </div>
        </div>

        {/* THE WALL — clock dominates */}
        <div className="wall-right order-1 lg:order-2 w-full lg:w-[70%] flex flex-col items-center justify-center flex-1 min-h-0 p-4 lg:p-8 gap-6">

          {setVisualizerType && (
            <div className="wall-scene-switcher scene-switcher-pills flex items-center p-1 rounded-full gap-1">
              {scenes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setVisualizerType(value); sfx.play('select'); }}
                  data-active={visualizerType === value || undefined}
                  className="scene-toggle-pill px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                  style={
                    visualizerType === value
                      ? { backgroundColor: C.BLACK, color: C.ON_INK }
                      : { backgroundColor: 'transparent', color: C.MID }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="wall-board relative flex flex-col items-center w-full">
            {/* status line */}
            {!surreal && (
              <div className="wall-status" aria-hidden="true">
                <span className="wall-status-dot" />
                <span>{MODE_STATUS[mode] || 'Focus session'}</span>
                <span className="wall-status-sep">·</span>
                <span className="tabular-nums">{Math.round(totalDuration / 60)} min</span>
                <span className="wall-status-sep">·</span>
                <span>{isRunning ? 'Running' : progressPercent > 0 ? 'Paused' : 'Ready'}</span>
              </div>
            )}

            {/* Golconda keeps its progress ring */}
            {surreal && (() => {
              const R = 185;
              const CIRC = 2 * Math.PI * R;
              const offset = CIRC * (1 - progressPercent / 100);
              return (
                <div
                  className="absolute pointer-events-none"
                  style={{ width: R * 2 + 16, height: R * 2 + 16, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  aria-hidden="true"
                >
                  <svg viewBox={`0 0 ${R * 2 + 16} ${R * 2 + 16}`} style={{ width: '100%', height: '100%' }}>
                    <circle cx={R + 8} cy={R + 8} r={R} fill="none" stroke={`rgba(0,0,0,${isRunning ? 0.1 : 0.06})`} strokeWidth="1.5" />
                    {progressPercent > 0 && (
                      <circle
                        cx={R + 8} cy={R + 8} r={R} fill="none"
                        stroke={`rgba(0,0,0,${isRunning ? 0.7 : 0.45})`} strokeWidth="2" strokeLinecap="round"
                        strokeDasharray={CIRC} strokeDashoffset={offset} transform={`rotate(-90 ${R + 8} ${R + 8})`}
                        style={{ transition: 'stroke-dashoffset 0.6s linear' }}
                      />
                    )}
                  </svg>
                </div>
              );
            })()}

            {/* the clock */}
            <div
              className="giant-clock-touch-target cursor-pointer transition-transform hover:scale-[1.012] active:scale-[0.99] select-none flex items-center justify-center w-full"
              onClick={handleTogglePlay}
              title={isRunning ? 'Click to pause' : 'Click to start'}
            >
              <div className="hidden xl:flex items-center justify-center w-full">
                <GlyphDotMatrixTimer timeString={formattedTime} timeLeft={timeLeft} isRunning={isRunning}
                  dotPitch={27} dotRadius={9.8} {...clockProps} inactiveOpacity={1} className="giant-clock-svg-wrap" />
              </div>
              <div className="hidden sm:flex xl:hidden items-center justify-center w-full">
                <GlyphDotMatrixTimer timeString={formattedTime} timeLeft={timeLeft} isRunning={isRunning}
                  dotPitch={21} dotRadius={7.5} {...clockProps} inactiveOpacity={1} className="giant-clock-svg-wrap" />
              </div>
              <div className="flex sm:hidden items-center justify-center w-full">
                <GlyphDotMatrixTimer timeString={formattedTime} timeLeft={timeLeft} isRunning={isRunning}
                  dotPitch={14} dotRadius={5} {...clockProps} inactiveOpacity={1} />
              </div>
            </div>

            {/* seconds row + session dots */}
            {!surreal && (
              <div className="wall-meters" aria-hidden="true">
                <div className="wall-seconds" title="Seconds through the current minute">
                  {Array.from({ length: 60 }, (_, i) => (
                    <span
                      key={i}
                      className={`wall-sec ${i < secondInMinute ? 'is-past' : ''} ${i === secondInMinute && (isRunning || progressPercent > 0) ? 'is-now' : ''} ${i % 15 === 0 ? 'is-quarter' : ''}`}
                    />
                  ))}
                </div>
                <div className="wall-session">
                  <span className="wall-session-label">Session</span>
                  <div className="wall-session-dots">
                    {Array.from({ length: SESSION_DOTS }, (_, i) => (
                      <span
                        key={i}
                        className={`wall-sdot ${i < litSessionDots ? 'is-lit' : ''} ${i === litSessionDots - 1 ? 'is-head' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="wall-session-label tabular-nums">{Math.round(progressPercent)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
