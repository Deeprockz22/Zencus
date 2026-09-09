import React from 'react';
import { motion } from 'framer-motion';
import DecryptedText from '../react-bits/DecryptedText';
import { Play, Pause } from 'lucide-react';

export default function MinimalVisualizer({
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
}) {
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Generate 60 precision watch ticks around perimeter
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? 142 : 147;
    const outerR = 154;
    const x1 = 180 + innerR * Math.sin(angle);
    const y1 = 180 - innerR * Math.cos(angle);
    const x2 = 180 + outerR * Math.sin(angle);
    const y2 = 180 - outerR * Math.cos(angle);
    return { id: i, x1, y1, x2, y2, isMajor };
  });

  const handleDialClick = () => {
    if (isEditing) return;
    if (isRunning && pauseTimer) {
      pauseTimer();
    } else if (!isRunning && startTimer) {
      startTimer();
    }
  };

  return (
    <div className="minimal-visualizer-hero relative flex flex-col items-start justify-center my-2 select-none w-full max-w-xl mx-auto">
      {/* ══════════ 1. TIMER DISPLAY HEADER (Left-Aligned Swiss Editorial) ══════════ */}
      <div className="timer-display-panel flex flex-col items-start text-left z-10 w-full mb-1 px-4">
        {/* Mode Badge */}
        <div className="editorial-mode-stamp mb-2 px-3 py-1 rounded border-2 border-[#121212] dark:border-[rgba(255,255,255,0.4)] bg-[#121212] text-white text-[11px] font-mono tracking-widest uppercase font-bold shadow-[2px_2px_0px_#ff3b30] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
          <DecryptedText text={getModeTitle ? getModeTitle() : 'Deep Focus Session'} speed={30} maxIterations={8} />
        </div>

        {/* Big Bold Time Digits */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="timer-edit-form my-1">
            <input
              type="number"
              min="1"
              max="180"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              autoFocus
              onBlur={() => setIsEditing(false)}
              className="timer-edit-input text-5xl sm:text-6xl font-black bg-[var(--bg-secondary)] border-3 border-[#121212] dark:border-[rgba(255,255,255,0.4)] text-[var(--text-primary)] px-3 py-1 rounded shadow-[4px_4px_0px_#121212] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.25)]"
            />
            <span className="timer-edit-label ml-2 font-mono font-bold text-[var(--text-primary)]">MIN</span>
          </form>
        ) : (
          <div
            className="timer-editorial-digits text-6xl sm:text-7xl font-black tracking-tighter text-[var(--text-primary)] cursor-pointer hover:scale-105 transition-transform drop-shadow-sm leading-none"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
            onClick={() => {
              if (!isRunning && setIsEditing) {
                setEditMinutes(Math.floor(timeLeft / 60));
                setIsEditing(true);
              }
            }}
            title={isRunning ? undefined : 'Click to adjust minutes'}
          >
            {formatTime ? formatTime(timeLeft) : '25:00'}
          </div>
        )}

        {/* Progress Ribbon VU Meter */}
        <div className="timer-progress-meter w-48 h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-2 border-[#121212] dark:border-[rgba(255,255,255,0.4)] shadow-[2px_2px_0px_#121212] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.22)] my-2">
          <motion.div
            className="h-full bg-[#ff3b30]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.5 }}
          />
        </div>
      </div>

      {/* ══════════ 2. DIETER RAMS / BRAUN MINIMAL ZEN FOCUS DIAL ══════════ */}
      <div
        className="minimal-canvas-stage relative w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] flex items-center justify-center my-2 self-center mx-auto cursor-pointer"
        onClick={handleDialClick}
        title={isRunning ? 'Click dial to pause' : 'Click dial to start'}
      >
        <svg
          className="w-full h-full select-none overflow-visible"
          viewBox="0 0 360 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Ambient Radial Glow for Active Flow */}
            <radialGradient id="minimalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff3b30" stopOpacity={isRunning ? '0.14' : '0.04'} />
              <stop offset="60%" stopColor="#ff3b30" stopOpacity={isRunning ? '0.05' : '0.01'} />
              <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Calming Central Ambient Aura */}
          <circle cx="180" cy="180" r="140" fill="url(#minimalGlow)" />

          {/* 60 Precision Minimalist Ticks */}
          <g className="minimal-dial-ticks" opacity="0.45">
            {ticks.map((t) => (
              <line
                key={t.id}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                strokeWidth={t.isMajor ? '2' : '1'}
                strokeLinecap="round"
                opacity={t.isMajor ? 0.9 : 0.5}
              />
            ))}
          </g>

          {/* Outer Subdued Track Circle */}
          <circle
            cx="180"
            cy="180"
            r={radius}
            stroke="var(--border-subtle)"
            strokeWidth="3.5"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Radiant Scarlet Progress Stroke Arc */}
          <circle
            cx="180"
            cy="180"
            r={radius}
            stroke="#ff3b30"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 180 180)"
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
              filter: isRunning ? 'drop-shadow(0 0 6px rgba(255, 59, 48, 0.6))' : 'none'
            }}
          />

          {/* Inner Floating Breathing Zen Hub */}
          <g
            className={`minimal-zen-hub ${isRunning ? 'zen-breathing' : ''}`}
            style={{ transformOrigin: '180px 180px' }}
          >
            {/* Disc Background */}
            <circle
              cx="180"
              cy="180"
              r="86"
              fill="var(--bg-secondary)"
              stroke="var(--border-subtle)"
              strokeWidth="2"
              className="transition-colors duration-300"
            />

            {/* Inner Accent Ring */}
            <circle
              cx="180"
              cy="180"
              r="76"
              fill="none"
              stroke="#ff3b30"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              strokeOpacity={isRunning ? '0.6' : '0.25'}
            />

            {/* Hub Central Status Icon / Mark */}
            <g transform="translate(180, 160)" className="text-[var(--text-primary)]">
              {isRunning ? (
                <circle cx="0" cy="0" r="4.5" fill="#22c55e" className="animate-pulse" />
              ) : (
                <circle cx="0" cy="0" r="4.5" fill="#ff3b30" />
              )}
            </g>

            {/* Status Label */}
            <text
              x="180"
              y="182"
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="12"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="800"
              letterSpacing="2.5"
            >
              {isRunning ? 'FLOWING' : 'READY'}
            </text>

            <text
              x="180"
              y="198"
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="1.2"
              opacity="0.8"
            >
              {isRunning ? 'CLICK TO PAUSE' : 'CLICK TO START'}
            </text>

            {/* Subtle Progress Percentage readout */}
            <text
              x="180"
              y="218"
              textAnchor="middle"
              fill="#ff3b30"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
            >
              {Math.round(progress)}%
            </text>
          </g>
        </svg>

        {/* Minimal Mode Subtle Floating Badge */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] shadow-sm pointer-events-none whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
          <span>MINIMAL FOCUS DIAL • PURE FLOW</span>
        </div>
      </div>
    </div>
  );
}
