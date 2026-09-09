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
    <div className="globe-visualizer-hero relative flex flex-col items-center justify-center my-2 select-none w-full max-w-xl mx-auto">
      {/* ══════════ 1. TIMER DISPLAY HEADER ══════════ */}
      <div className="timer-display-panel flex flex-col items-center justify-center z-10 w-full mb-1">
        {/* Mode Badge */}
        <div className="editorial-mode-stamp mb-2 px-3 py-1 rounded border-2 border-[#121212] dark:border-[rgba(255,255,255,0.4)] bg-[#121212] text-white text-[11px] font-mono tracking-widest uppercase font-bold shadow-[2px_2px_0px_#ff3b30] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
          <DecryptedText text={getModeTitle ? getModeTitle() : 'GLOBAL FOCUS'} speed={30} maxIterations={8} />
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
              className="timer-edit-input"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
            <span className="font-mono text-sm ml-2 text-[var(--text-secondary)]">min</span>
          </form>
        ) : (
          <div
            className="editorial-time-digits text-6xl sm:text-7xl font-mono font-black tracking-tight cursor-pointer my-1 transition-transform hover:scale-105 active:scale-95"
            onClick={() => setIsEditing && setIsEditing(true)}
            title="Click to edit session length"
          >
            {formatTime ? formatTime(timeLeft) : '25:00'}
          </div>
        )}

        {/* Minimal Progress Line */}
        <div className="w-48 h-1.5 bg-[var(--border-subtle)] rounded-full mt-2 overflow-hidden border border-[var(--border-subtle)]">
          <motion.div
            className="h-full bg-[#ff3b30]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.5 }}
          />
        </div>
      </div>

      {/* ══════════ 2. REACT BITS 3D INTERACTIVE GLOBE ══════════ */}
      <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center my-1">
        <Globe
          width="100%"
          height="100%"
          primaryColor="#ff3b30"
          autoRotateSpeed={isRunning ? 1.2 : 0.65}
          showAtmosphere={true}
          interactive={true}
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Interactive Floating Hint Badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.12)] pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          <span>DRAG TO EXPLORE • GLOBAL FOCUS NETWORK</span>
        </div>
      </div>
    </div>
  );
}
