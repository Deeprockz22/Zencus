import React from 'react';
import { motion } from 'framer-motion';
import DecryptedText from '../react-bits/DecryptedText';

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
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className="isometric-editorial-hero relative flex flex-col items-center justify-center my-6 py-4 select-none">
      {/* 3D Isometric Composition Container */}
      <div className="relative w-[340px] sm:w-[420px] h-[300px] flex items-center justify-center">
        {/* Isometric SVG Illustration of Book & Coffee Cup */}
        <svg
          className="w-full h-full absolute inset-0 overflow-visible"
          viewBox="0 0 460 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              @keyframes auraPulse {
                0%, 100% { opacity: 0.85; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.08); }
              }
              @keyframes steamRise {
                0% { transform: translateY(0) scaleX(1); opacity: 0.8; }
                50% { transform: translateY(-8px) scaleX(1.15); opacity: 0.4; }
                100% { transform: translateY(-16px) scaleX(0.9); opacity: 0; }
              }
              .diffuse-aura { animation: auraPulse 4s ease-in-out infinite; transform-origin: 190px 145px; }
              .coffee-steam { animation: steamRise 3s infinite ease-out; }
            `}
          </style>

          {/* Hard-Cast Drop Shadow under the Book */}
          <polygon
            points="75,250 255,340 405,250 225,160"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(14, 14)"
          />

          {/* Hard-Cast Shadow under Coffee Cup */}
          <ellipse
            cx="375"
            cy="125"
            rx="52"
            ry="28"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(10, 10)"
          />

          {/* ══════════ ISOMETRIC BOOK ══════════ */}
          {/* Book Spine Bottom Thickness */}
          <polygon
            points="70,230 250,320 250,340 70,250"
            fill="var(--bg-tertiary, #d7d7ce)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Book Pages Edge (Right side page layers) */}
          <polygon
            points="250,320 400,230 400,250 250,340"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Page lines texture */}
          <line x1="250" y1="324" x2="400" y2="234" stroke="#121212" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="250" y1="328" x2="400" y2="238" stroke="#121212" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="250" y1="332" x2="400" y2="242" stroke="#121212" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="250" y1="336" x2="400" y2="246" stroke="#121212" strokeWidth="1" strokeOpacity="0.35" />

          {/* Book Cover Surface (Top Rhombus) */}
          <polygon
            points="70,230 220,140 370,230 220,320"
            fill="var(--bg-secondary, #ffffff)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Diffuse Radiant Scarlet Aura Glow on Book Cover */}
          <g className="diffuse-aura">
            <ellipse
              cx="220"
              cy="230"
              rx="80"
              ry="45"
              fill="url(#paint_aura_vermilion)"
            />
          </g>

          {/* Book Cover Graphic Marks: 4-Blade Ribbon Glyph Top-Left */}
          <g transform="translate(100, 215) scale(0.65)">
            <path d="M0,0 L8,8 L0,16 L-8,8 Z" fill="#121212" />
            <path d="M0,0 L8,-8 L16,0 L8,8 Z" fill="#ff3b30" />
            <path d="M0,0 L-8,-8 L0,-16 L8,-8 Z" fill="#121212" />
            <path d="M0,0 L-8,8 L-16,0 L-8,-8 Z" fill="#ff3b30" />
          </g>

          {/* 4-Blade Ribbon Glyph Bottom-Right */}
          <g transform="translate(340, 245) scale(0.65)">
            <path d="M0,0 L8,8 L0,16 L-8,8 Z" fill="#ff3b30" />
            <path d="M0,0 L8,-8 L16,0 L8,8 Z" fill="#121212" />
            <path d="M0,0 L-8,-8 L0,-16 L8,-8 Z" fill="#ff3b30" />
            <path d="M0,0 L-8,8 L-16,0 L-8,-8 Z" fill="#121212" />
          </g>

          {/* Technical Micro-Metadata Text in isometric angle */}
          <g transform="translate(70, 230) rotate(26.5)" fill="#121212">
            <text x="18" y="-6" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="700" letterSpacing="1">
              FOCUS SESSION / VOL. 01
            </text>
          </g>

          {/* ══════════ ISOMETRIC COFFEE CUP ══════════ */}
          {/* Saucer Plate */}
          <ellipse
            cx="365"
            cy="115"
            rx="46"
            ry="24"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.2"
          />
          <ellipse
            cx="365"
            cy="115"
            rx="34"
            ry="18"
            fill="none"
            stroke="#121212"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Cup Body */}
          <path
            d="M 335 95 C 335 125 395 125 395 95 Z"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.2"
          />

          {/* Cup Rim & Dark Espresso Surface */}
          <ellipse
            cx="365"
            cy="95"
            rx="30"
            ry="15"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.2"
          />
          <ellipse
            cx="365"
            cy="95"
            rx="25"
            ry="12"
            fill="#261815"
          />
          {/* Coffee Cream Swirl */}
          <ellipse
            cx="363"
            cy="94"
            rx="16"
            ry="7"
            fill="#45271f"
          />
          <ellipse
            cx="361"
            cy="93"
            rx="8"
            ry="3.5"
            fill="#6d3d2e"
          />

          {/* Cup Handle */}
          <path
            d="M 395 92 C 412 92 412 112 395 112"
            fill="none"
            stroke="#121212"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Coffee Steam Plumes */}
          {isRunning && (
            <g className="coffee-steam" stroke="#6e6e6a" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M 358 75 Q 354 62 360 52" />
              <path d="M 368 76 Q 374 64 370 54" style={{ animationDelay: '0.4s' }} />
            </g>
          )}

          {/* Hand-Drawn Editorial Curve Arrow pointing to mode */}
          <path
            d="M 115 140 C 130 110 160 110 180 120"
            stroke="#121212"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="180,120 173,115 174,124" fill="#121212" />

          {/* Arrow Label */}
          <text
            x="60"
            y="155"
            fill="#121212"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            letterSpacing="-0.5"
          >
            (FLOW PROTOCOL)
          </text>

          {/* Gradients */}
          <defs>
            <radialGradient
              id="paint_aura_vermilion"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(220 230) scale(80 45)"
            >
              <stop stopColor="#ff2e2e" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#ff3b30" stopOpacity="0.55" />
              <stop offset="0.85" stopColor="#ff5247" stopOpacity="0.1" />
              <stop offset="1" stopColor="#ff5247" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Central Swiss Typographic Display Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-auto pt-16">
          {/* Mode Badge */}
          <div className="editorial-mode-stamp mb-1 px-3 py-0.5 rounded-sm bg-black text-white text-[11px] font-mono tracking-widest uppercase font-bold shadow-sm">
            <DecryptedText text={getModeTitle()} speed={30} maxIterations={8} />
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
                className="timer-edit-input text-4xl sm:text-5xl font-black bg-white border-2 border-black text-black px-2 py-1 rounded shadow-[3px_3px_0px_#000000]"
              />
              <span className="timer-edit-label ml-1 font-mono font-bold text-black">MIN</span>
            </form>
          ) : (
            <div
              className="timer-editorial-digits text-5xl sm:text-6xl font-black tracking-tighter text-[#121212] drop-shadow-sm cursor-pointer hover:scale-105 transition-transform"
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
              onClick={() => {
                if (!isRunning) {
                  setEditMinutes(Math.floor(timeLeft / 60));
                  setIsEditing(true);
                }
              }}
              title={isRunning ? undefined : 'Click to edit duration'}
            >
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Progress Ribbon Meter */}
          <div className="w-36 h-2 bg-[#121212] bg-opacity-15 rounded-full overflow-hidden border border-black my-2">
            <div
              className="h-full bg-[#ff3b30] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtext */}
          <div className="text-[11px] font-mono tracking-wider font-semibold text-[#121212] opacity-80 uppercase">
            {isRunning ? '⚡ Flow Active • Stay Present' : 'Click Digits to Adjust Time'}
          </div>
        </div>
      </div>

      {/* Editorial Decorative Stamp Bar */}
      <div className="editorial-footer-bar flex items-center justify-between w-full max-w-sm px-4 mt-2 text-[10px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
        <span>EST. 2026</span>
        <span className="flex items-center gap-1 font-bold text-[#ff3b30]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
          PRECISION FLOW
        </span>
        <span>NUANCED SHADES</span>
      </div>
    </div>
  );
}
