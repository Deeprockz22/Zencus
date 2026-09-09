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
      <div className="relative w-[340px] sm:w-[440px] h-[320px] flex items-center justify-center">
        {/* Isometric SVG Illustration of Animated Vinyl Player & Coffee Cup */}
        <svg
          className="w-full h-full absolute inset-0 overflow-visible"
          viewBox="0 0 480 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              @keyframes spinVinylGroove {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes tonearmFloat {
                0%, 100% { transform: rotate(-14deg); }
                50% { transform: rotate(-15deg); }
              }
              @keyframes steamRise {
                0% { transform: translateY(0) scaleX(1); opacity: 0.8; }
                50% { transform: translateY(-8px) scaleX(1.15); opacity: 0.4; }
                100% { transform: translateY(-16px) scaleX(0.9); opacity: 0; }
              }
              @keyframes soundWavePop {
                0% { transform: scale(0.8); opacity: 0.8; }
                100% { transform: scale(1.3); opacity: 0; }
              }
              .vinyl-disc-spin {
                ${isRunning ? 'animation: spinVinylGroove 2.5s linear infinite;' : ''}
                transform-origin: 200px 225px;
              }
              .tonearm-animated {
                transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                transform-origin: 325px 175px;
                transform: ${isRunning ? 'rotate(-14deg)' : 'rotate(8deg)'};
              }
              .tonearm-needle-vibe {
                ${isRunning ? 'animation: tonearmFloat 2s ease-in-out infinite;' : ''}
              }
              .coffee-steam { animation: steamRise 3s infinite ease-out; }
            `}
          </style>

          {/* Hard-Cast Drop Shadow under the Turntable Plinth */}
          <polygon
            points="65,245 255,345 425,245 235,145"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(14, 14)"
          />

          {/* Hard-Cast Shadow under Coffee Cup */}
          <ellipse
            cx="405"
            cy="115"
            rx="46"
            ry="24"
            fill="#121212"
            fillOpacity="0.85"
            transform="translate(10, 10)"
          />

          {/* ══════════ ISOMETRIC TURNTABLE BASE ══════════ */}
          {/* Plinth Left Thickness */}
          <polygon
            points="60,225 250,325 250,345 60,245"
            fill="var(--bg-tertiary, #d7d7ce)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Plinth Right Thickness */}
          <polygon
            points="250,325 420,225 420,245 250,345"
            fill="#ffffff"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Plinth Top Surface (Rhombus) */}
          <polygon
            points="60,225 230,135 420,225 250,325"
            fill="var(--bg-secondary, #ffffff)"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Metal Corner Feet */}
          <ellipse cx="75" cy="245" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />
          <ellipse cx="250" cy="345" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />
          <ellipse cx="410" cy="245" rx="8" ry="4" fill="#3f3f46" stroke="#121212" strokeWidth="1.5" />

          {/* ══════════ ROTATING VINYL RECORD DISC ══════════ */}
          {/* Turntable Platter Metal Rim */}
          <ellipse
            cx="200"
            cy="225"
            rx="115"
            ry="62"
            fill="#27272a"
            stroke="#121212"
            strokeWidth="2"
          />

          {/* Vinyl Record Body (Group with spin animation) */}
          <g className="vinyl-disc-spin">
            {/* Outer Vinyl Black Disc */}
            <ellipse
              cx="200"
              cy="225"
              rx="110"
              ry="59"
              fill="#09090b"
              stroke="#121212"
              strokeWidth="2"
            />

            {/* Concentric Sound Grooves */}
            <ellipse cx="200" cy="225" rx="100" ry="53.5" stroke="#27272a" strokeWidth="1.2" fill="none" strokeDasharray="300 12" />
            <ellipse cx="200" cy="225" rx="90" ry="48" stroke="#1c1c1f" strokeWidth="1" fill="none" />
            <ellipse cx="200" cy="225" rx="80" ry="42.5" stroke="#27272a" strokeWidth="1" fill="none" strokeDasharray="240 8" />
            <ellipse cx="200" cy="225" rx="70" ry="37" stroke="#1c1c1f" strokeWidth="1" fill="none" />
            <ellipse cx="200" cy="225" rx="60" ry="32" stroke="#27272a" strokeWidth="0.8" fill="none" strokeDasharray="180 6" />
            <ellipse cx="200" cy="225" rx="50" ry="26.5" stroke="#1c1c1f" strokeWidth="0.8" fill="none" />

            {/* Vinyl Light Sheen Glints */}
            <path
              d="M 130 200 Q 200 225 270 200 Q 200 225 130 250"
              fill="#ffffff"
              fillOpacity="0.08"
            />

            {/* Center Label in Radiant Scarlet (#FF3B30) */}
            <ellipse
              cx="200"
              cy="225"
              rx="38"
              ry="20"
              fill="#ff3b30"
              stroke="#121212"
              strokeWidth="1.5"
            />
            {/* Inner Label Accent Ring */}
            <ellipse
              cx="200"
              cy="225"
              rx="30"
              ry="16"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />

            {/* Center Spindle Hole & 4-Blade Ribbon Mark */}
            <g transform="translate(200, 225) scale(0.4)">
              <path d="M0,0 L8,8 L0,16 L-8,8 Z" fill="#121212" />
              <path d="M0,0 L8,-8 L16,0 L8,8 Z" fill="#ffffff" />
              <path d="M0,0 L-8,-8 L0,-16 L8,-8 Z" fill="#121212" />
              <path d="M0,0 L-8,8 L-16,0 L-8,-8 Z" fill="#ffffff" />
            </g>
            <circle cx="200" cy="225" r="3.5" fill="#121212" />
          </g>

          {/* ══════════ TONEARM & CARTRIDGE ══════════ */}
          {/* Tonearm Base Pivot */}
          <ellipse cx="325" cy="175" rx="14" ry="8" fill="#52525b" stroke="#121212" strokeWidth="2" />
          <ellipse cx="325" cy="172" rx="10" ry="5.5" fill="#a1a1aa" stroke="#121212" strokeWidth="1.5" />
          {/* Counterweight */}
          <rect x="320" y="152" width="10" height="14" rx="2" fill="#27272a" stroke="#121212" strokeWidth="1.5" />

          {/* Animated Arm & Needle Cartridge */}
          <g className="tonearm-animated tonearm-needle-vibe">
            {/* Chrome Straight Tonearm Tube */}
            <line x1="325" y1="172" x2="245" y2="212" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
            <line x1="325" y1="172" x2="245" y2="212" stroke="#e4e4e7" strokeWidth="1.8" strokeLinecap="round" />

            {/* Cartridge Headshell Angle */}
            <line x1="245" y1="212" x2="232" y2="225" stroke="#121212" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="245" y1="212" x2="232" y2="225" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" />

            {/* Stylus Needle Tip */}
            <circle cx="231" cy="226" r="2.5" fill="#121212" />
            <circle cx="231" cy="226" r="1.2" fill="#ffffff" />
          </g>

          {/* Tonearm Rest Cradle */}
          <rect x="342" y="188" width="6" height="12" rx="2" fill="#3f3f46" stroke="#121212" strokeWidth="1.2" />

          {/* ══════════ TURNTABLE HARDWARE CONTROLS ══════════ */}
          {/* Speed Selector (33 / 45 RPM) */}
          <g transform="translate(85, 238)">
            <ellipse cx="0" cy="0" rx="8" ry="4.5" fill="#e4e4e7" stroke="#121212" strokeWidth="1.5" />
            <ellipse cx="0" cy="-2" rx="5" ry="3" fill="#ff3b30" />
            <text x="-6" y="10" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fontWeight="800" fill="#121212">33⅓</text>
          </g>

          {/* Pitch Slider Track */}
          <g transform="translate(365, 245)">
            <line x1="0" y1="0" x2="25" y2="-13" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="0" x2="25" y2="-13" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Slider Knob */}
            <ellipse cx="12" cy="-6" rx="4" ry="2.5" fill="#ff3b30" stroke="#121212" strokeWidth="1" />
          </g>

          {/* Power Status LED */}
          <circle cx="95" cy="215" r="3.5" fill={isRunning ? '#22c55e' : '#ff3b30'} stroke="#121212" strokeWidth="1" />

          {/* Technical Micro-Metadata Text in isometric angle */}
          <g transform="translate(75, 225) rotate(26.5)" fill="#121212">
            <text x="32" y="-12" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="800" letterSpacing="1">
              ZENCUS STEREO • DIRECT DRIVE • HI-FI
            </text>
          </g>

          {/* ══════════ ISOMETRIC COFFEE CUP ══════════ */}
          {/* Saucer Plate */}
          <ellipse cx="395" cy="105" rx="42" ry="22" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />
          <ellipse cx="395" cy="105" rx="30" ry="16" fill="none" stroke="#121212" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Cup Body */}
          <path d="M 368 87 C 368 114 422 114 422 87 Z" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />

          {/* Cup Rim & Dark Espresso Surface */}
          <ellipse cx="395" cy="87" rx="27" ry="13.5" fill="#ffffff" stroke="#121212" strokeWidth="2.2" />
          <ellipse cx="395" cy="87" rx="22" ry="10.5" fill="#261815" />
          <ellipse cx="393" cy="86" rx="14" ry="6" fill="#45271f" />
          <ellipse cx="391" cy="85" rx="7" ry="3" fill="#6d3d2e" />

          {/* Cup Handle */}
          <path d="M 422 84 C 438 84 438 102 422 102" fill="none" stroke="#121212" strokeWidth="2.4" strokeLinecap="round" />

          {/* Coffee Steam Plumes */}
          {isRunning && (
            <g className="coffee-steam" stroke="#6e6e6a" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M 388 68 Q 384 56 390 46" />
              <path d="M 398 69 Q 404 57 400 48" style={{ animationDelay: '0.4s' }} />
            </g>
          )}

          {/* Hand-Drawn Editorial Curve Arrow pointing to mode */}
          <path d="M 105 130 C 120 100 150 100 170 110" stroke="#121212" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <polygon points="170,110 163,105 164,114" fill="#121212" />

          {/* Arrow Label */}
          <text x="50" y="145" fill="#121212" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="800" letterSpacing="-0.5">
            (ANALOG FLOW)
          </text>
        </svg>

        {/* Central Swiss Typographic Display Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-auto pt-14">
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
              title={isRunning ? undefined : 'Click to adjust minutes'}
            >
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Progress Ribbon VU Meter */}
          <div className="w-36 h-2 bg-[#121212] bg-opacity-15 rounded-full overflow-hidden border border-black my-2">
            <div
              className="h-full bg-[#ff3b30] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtext */}
          <div className="text-[11px] font-mono tracking-wider font-semibold text-[#121212] opacity-80 uppercase">
            {isRunning ? '⚡ 33⅓ RPM Spinning • Deep Focus' : 'Click Digits to Adjust Time'}
          </div>
        </div>
      </div>

      {/* Editorial Decorative Stamp Bar */}
      <div className="editorial-footer-bar flex items-center justify-between w-full max-w-sm px-4 mt-2 text-[10px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
        <span>HI-FI STEREO</span>
        <span className="flex items-center gap-1 font-bold text-[#ff3b30]">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ff3b30]'}`} />
          {isRunning ? 'NEEDLE ON GROOVE' : 'TURNTABLE READY'}
        </span>
        <span>33⅓ RPM</span>
      </div>
    </div>
  );
}
