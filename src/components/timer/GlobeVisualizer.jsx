import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Globe from '../react-bits/Globe';
import DecryptedText from '../react-bits/DecryptedText';
import { Globe as GlobeIcon, Users, Compass } from 'lucide-react';

export default function GlobeVisualizer({
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
  setIsEditing
}) {
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className="globe-visualizer-hero relative flex flex-col items-start justify-center my-2 select-none w-full max-w-xl mx-auto">
      {/* ══════════ 1. TIMER DISPLAY HEADER (Left-Aligned like Turntable) ══════════ */}
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

      {/* ══════════ 2. REACT BITS 3D INTERACTIVE GLOBE ══════════ */}
      <div className="globe-canvas-stage relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center my-1 self-center mx-auto">
        <Globe
          width="100%"
          height="100%"
          primaryColor="#ff3b30"
          autoRotateSpeed={isRunning ? 1.2 : 0.65}
          showAtmosphere={true}
          interactive={true}
          showFlights={true}
          flightSpeed={isRunning ? 1.35 : 0.5}
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Interactive Floating Hint Badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.12)] pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          <span>DRAG TO EXPLORE • LIVE FOCUS FLIGHTS</span>
        </div>
      </div>
    </div>
  );
}
