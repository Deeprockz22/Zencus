import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DecryptedText from '../react-bits/DecryptedText';
import { jazzRadio } from '../../utils/jazzRadioAudio';

export default function IsometricEditorialDial({
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
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());

  useEffect(() => {
    return jazzRadio.subscribe((st) => setRadioState(st));
  }, []);

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const isDiscSpinning = isRunning || radioState.isPlaying;

  return (
    <div className="isometric-editorial-hero relative flex flex-col items-start justify-center my-4 select-none w-full max-w-xl mx-auto">
      {/* ══════════ 1. SWISS EDITORIAL TIMER DISPLAY (Left-Aligned) ══════════ */}
      <div className="timer-display-panel flex flex-col items-start text-left z-10 w-full mb-1 px-4">
        {/* Mode Badge */}
        <div className="editorial-mode-stamp mb-2 px-3 py-1 rounded border-2 border-[#121212] dark:border-[rgba(255,255,255,0.4)] bg-[#121212] text-white text-[11px] font-mono tracking-widest uppercase font-bold shadow-[2px_2px_0px_#ff3b30] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
          <DecryptedText text={getModeTitle()} speed={30} maxIterations={8} />
        </div>

        {/* Big Bold Time Digits (Always readable in light and dark mode) */}
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
              if (!isRunning) {
                setEditMinutes(Math.floor(timeLeft / 60));
                setIsEditing(true);
              }
            }}
            title={isRunning ? undefined : 'Click to adjust minutes'}
          >
            {formatTime(timeLeft)}
          </div>
        )}

        {/* Progress Ribbon VU Meter */}
        <div className="timer-progress-meter w-48 h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-2 border-[#121212] dark:border-[rgba(255,255,255,0.4)] shadow-[2px_2px_0px_#121212] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.22)] my-2">
          <div
            className="h-full bg-[#ff3b30] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ══════════ 2. 3D ISOMETRIC TURNTABLE & COFFEE HERO ILLUSTRATION ══════════ */}
      <div
        className="turntable-canvas-stage relative flex items-center justify-center self-center mx-auto"
        style={{ width: '100%', maxWidth: '480px', height: '320px', minHeight: '300px' }}
      >
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 480 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', maxHeight: '320px', display: 'block' }}
        >
          <style>
            {`
              @keyframes tonearmFloat {
                0%, 100% { transform: rotate(-14deg); }
                50% { transform: rotate(-15.2deg); }
              }
              @keyframes steamRise {
                0% { transform: translateY(0) scaleX(1); opacity: 0.8; }
                50% { transform: translateY(-8px) scaleX(1.15); opacity: 0.4; }
                100% { transform: translateY(-16px) scaleX(0.9); opacity: 0; }
              }
              .tonearm-animated {
                transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                transform-origin: 325px 175px;
                transform: ${isDiscSpinning ? 'rotate(-14deg)' : 'rotate(8deg)'};
              }
              .tonearm-needle-vibe {
                ${isDiscSpinning ? 'animation: tonearmFloat 2s ease-in-out infinite;' : ''}
              }
              .coffee-steam { animation: steamRise 3s infinite ease-out; }
            `}
          </style>

          {/* Hard-Cast Drop Shadow under the Turntable Plinth */}
          <polygon
            points="65,235 255,335 425,235 235,135"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(14, 14)"
          />

          {/* Hard-Cast Shadow under Coffee Cup */}
          <ellipse
            cx="405"
            cy="105"
            rx="46"
            ry="24"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(10, 10)"
          />

          {/* ══════════ ISOMETRIC TURNTABLE BASE ══════════ */}
          {/* Plinth Left Thickness */}
          <polygon
            points="60,215 250,315 250,335 60,235"
            fill="var(--bg-tertiary, #d7d7ce)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Plinth Right Thickness */}
          <polygon
            points="250,315 420,215 420,235 250,335"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Plinth Top Surface (Rhombus) */}
          <polygon
            points="60,215 230,125 420,215 250,315"
            fill="var(--bg-secondary, #ffffff)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Metal Corner Feet */}
          <ellipse cx="75" cy="235" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />
          <ellipse cx="250" cy="335" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />
          <ellipse cx="410" cy="235" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />

          {/* ══════════ ROTATING VINYL RECORD DISC ON PLATTER ══════════ */}
          {/* Turntable Platter Container: Center is locked at (200, 215), isometric scale is (1, 0.54) */}
          <g transform="translate(200, 215) scale(1, 0.54)">
            {/* Stationary Heavy Cast Platter Rim (Always on the plinth) */}
            <circle cx="0" cy="0" r="116" fill="#18181b" stroke="#121212" strokeWidth="3" />
            <circle cx="0" cy="0" r="112" fill="#27272a" stroke="#121212" strokeWidth="1.5" />

            {/* Rotating Vinyl Record (Locked at 0,0 in local coordinates - ZERO DRIFT, ZERO WOBBLE) */}
            <g>
              {isDiscSpinning && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              )}

              {/* Outer Vinyl Black Disc */}
              <circle cx="0" cy="0" r="108" fill="#09090b" stroke="#121212" strokeWidth="2.5" />

              {/* Concentric Micro Sound Grooves */}
              <circle cx="0" cy="0" r="100" stroke="#27272a" strokeWidth="1.5" fill="none" strokeDasharray="60 12 110 18" />
              <circle cx="0" cy="0" r="92" stroke="#1c1c1f" strokeWidth="1.2" fill="none" />
              <circle cx="0" cy="0" r="84" stroke="#27272a" strokeWidth="1.4" fill="none" strokeDasharray="50 14 90 20" />
              <circle cx="0" cy="0" r="76" stroke="#1c1c1f" strokeWidth="1" fill="none" />
              <circle cx="0" cy="0" r="68" stroke="#27272a" strokeWidth="1.2" fill="none" strokeDasharray="40 10 70 15" />
              <circle cx="0" cy="0" r="60" stroke="#1c1c1f" strokeWidth="1" fill="none" />
              <circle cx="0" cy="0" r="50" stroke="#27272a" strokeWidth="1.2" fill="none" strokeDasharray="30 8 50 12" />
              <circle cx="0" cy="0" r="42" stroke="#1c1c1f" strokeWidth="1" fill="none" />

              {/* Lead-in and Run-out Spiral Tracks */}
              <circle cx="0" cy="0" r="105" stroke="#3f3f46" strokeWidth="0.8" fill="none" strokeDasharray="16 6" />
              <circle cx="0" cy="0" r="39" stroke="#3f3f46" strokeWidth="1.4" fill="none" strokeDasharray="10 8" />

              {/* Center Record Label - Radiant Scarlet (#FF3B30) */}
              <circle cx="0" cy="0" r="36" fill="#ff3b30" stroke="#121212" strokeWidth="2" />
              <circle cx="0" cy="0" r="28" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="8 4" />

              {/* Center 4-Blade Origami Ribbon Mark */}
              <g transform="scale(0.75)">
                <path d="M0,0 L8,8 L0,16 L-8,8 Z" fill="#121212" />
                <path d="M0,0 L8,-8 L16,0 L8,8 Z" fill="#ffffff" />
                <path d="M0,0 L-8,-8 L0,-16 L8,-8 Z" fill="#121212" />
                <path d="M0,0 L-8,8 L-16,0 L-8,-8 Z" fill="#ffffff" />
              </g>

              {/* Spindle Pin Hole */}
              <circle cx="0" cy="0" r="4" fill="#121212" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* Stationary Specular Light Sheens (Realistic reflection across spinning vinyl) */}
            <path
              d="M 0 0 L -80 -72 A 108 108 0 0 1 -20 -106 Z"
              fill="#ffffff"
              fillOpacity="0.08"
              pointerEvents="none"
            />
            <path
              d="M 0 0 L 80 72 A 108 108 0 0 1 20 106 Z"
              fill="#ffffff"
              fillOpacity="0.08"
              pointerEvents="none"
            />
          </g>

          {/* ══════════ TONEARM & CARTRIDGE ══════════ */}
          {/* Tonearm Base Pivot */}
          <ellipse cx="325" cy="165" rx="14" ry="8" fill="#52525b" stroke="#121212" strokeWidth="2" />
          <ellipse cx="325" cy="162" rx="10" ry="5.5" fill="#a1a1aa" stroke="#121212" strokeWidth="1.5" />
          {/* Counterweight */}
          <rect x="320" y="142" width="10" height="14" rx="2" fill="#27272a" stroke="#121212" strokeWidth="1.5" />

          {/* Animated Arm & Needle Cartridge */}
          <g className="tonearm-animated tonearm-needle-vibe">
            {/* Chrome Straight Tonearm Tube */}
            <line x1="325" y1="162" x2="245" y2="202" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
            <line x1="325" y1="162" x2="245" y2="202" stroke="#e4e4e7" strokeWidth="1.8" strokeLinecap="round" />

            {/* Cartridge Headshell Angle */}
            <line x1="245" y1="202" x2="231" y2="216" stroke="#121212" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="245" y1="202" x2="231" y2="216" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" />

            {/* Stylus Needle Tip */}
            <circle cx="230" cy="217" r="2.5" fill="#121212" />
            <circle cx="230" cy="217" r="1.2" fill="#ffffff" />
          </g>

          {/* Tonearm Rest Cradle */}
          <rect x="342" y="178" width="6" height="12" rx="2" fill="#3f3f46" stroke="#121212" strokeWidth="1.2" />

          {/* ══════════ TURNTABLE HARDWARE CONTROLS ══════════ */}
          {/* Speed Selector (33 / 45 RPM) */}
          <g
            transform="translate(85, 228)"
            className="cursor-pointer"
            onClick={() => jazzRadio.toggle()}
            title={radioState.isPlaying ? 'Click to Pause Jazz/Sax Radio' : 'Click to Play Jazz/Sax Radio'}
          >
            <ellipse cx="0" cy="0" rx="8" ry="4.5" fill="#e4e4e7" stroke="#121212" strokeWidth="1.5" />
            <ellipse cx="0" cy="-2" rx="5" ry="3" fill={radioState.isPlaying ? '#22c55e' : '#ff3b30'} />
          </g>

          {/* Pitch Slider Track */}
          <g transform="translate(365, 235)">
            <line x1="0" y1="0" x2="25" y2="-13" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="0" x2="25" y2="-13" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Slider Knob */}
            <ellipse cx="12" cy="-6" rx="4" ry="2.5" fill="#ff3b30" stroke="#121212" strokeWidth="1" />
          </g>

          {/* Power Status LED */}
          <circle cx="95" cy="205" r="3.5" fill={isDiscSpinning ? '#22c55e' : '#ff3b30'} stroke="#121212" strokeWidth="1" />

          {/* ══════════ ISOMETRIC COFFEE CUP ══════════ */}
          {/* Saucer Plate */}
          <ellipse cx="395" cy="95" rx="42" ry="22" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />
          <ellipse cx="395" cy="95" rx="30" ry="16" fill="none" stroke="#121212" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Cup Body */}
          <path d="M 368 77 C 368 104 422 104 422 77 Z" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />

          {/* Cup Rim & Dark Espresso Surface */}
          <ellipse cx="395" cy="77" rx="27" ry="13.5" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />
          <ellipse cx="395" cy="77" rx="22" ry="10.5" fill="#261815" />
          <ellipse cx="393" cy="76" rx="14" ry="6" fill="#45271f" />
          <ellipse cx="391" cy="75" rx="7" ry="3" fill="#6d3d2e" />

          {/* Cup Handle */}
          <path d="M 422 74 C 438 74 438 92 422 92" fill="none" stroke="#121212" strokeWidth="2.4" strokeLinecap="round" />

          {/* Coffee Steam Plumes */}
          {isDiscSpinning && (
            <g className="coffee-steam" stroke="#6e6e6a" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M 388 58 Q 384 46 390 36" />
              <path d="M 398 59 Q 404 47 400 38" style={{ animationDelay: '0.4s' }} />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
