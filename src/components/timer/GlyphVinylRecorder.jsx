import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { jazzRadio } from '../../utils/jazzRadioAudio';
import { sfx } from '../../utils/sfx';
import { useMicrophoneFFT } from '../../hooks/useMicrophoneFFT';

export default function GlyphVinylRecorder({
  timeLeft,
  totalDuration,
  isRunning,
  mode,
  getModeTitle,
  formatTime,
  startTimer,
  pauseTimer,
  isZenMode = false,
  hideTelemetry = false,
  theme = 'dark'
}) {
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());
  const [rpmMode, setRpmMode] = useState('33'); // '33' | '45'
  const [vuTick, setVuTick] = useState(0);
  const [showMicPrompt, setShowMicPrompt] = useState(false);

  // Real-time microphone FFT
  const { status: micStatus, bands, start: startMic, stop: stopMic } = useMicrophoneFFT({
    fftSize: 1024,
    smoothing: 0.75
  });
  const micActive = micStatus === 'active';

  useEffect(() => {
    return jazzRadio.subscribe((st) => setRadioState(st));
  }, []);

  const isSpinning = isRunning || radioState.isPlaying;
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  // Fallback fake VU tick when mic is NOT active
  useEffect(() => {
    if (!isSpinning || micActive) return;
    const interval = setInterval(() => {
      setVuTick((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, [isSpinning, micActive]);

  // Derived visual values — live mic data or fallback animation
  const vizBass    = micActive ? bands.bass    : (isSpinning ? (Math.sin(vuTick * 0.3) * 0.3 + 0.4) : 0);
  const vizMid     = micActive ? bands.mid     : (isSpinning ? (Math.sin(vuTick * 0.2 + 1) * 0.25 + 0.35) : 0);
  const vizTreble  = micActive ? bands.treble  : (isSpinning ? (Math.sin(vuTick * 0.4 + 2) * 0.2 + 0.25) : 0);
  const vizOverall = micActive ? bands.overall : (isSpinning ? (Math.sin(vuTick * 0.25 + 0.5) * 0.2 + 0.3) : 0);
  const vizPeak    = micActive ? bands.peak    : (isSpinning ? Math.max(vizBass, vizMid) : 0);

  const handleTogglePlayback = () => {
    sfx.play('select');
    if (isRunning) {
      if (pauseTimer) pauseTimer();
    } else {
      if (startTimer) startTimer();
    }
  };

  // Strobe dot coordinates generation for 4 concentric rings (Technics SL-1200 / Glyph dot matrix style)
  const strobeRings = [
    { radius: 194, count: 56, dotR: 2 },
    { radius: 188, count: 50, dotR: 1.8 },
    { radius: 182, count: 44, dotR: 1.5 },
    { radius: 176, count: 40, dotR: 1.2 }
  ];

  const displayModeTitle = typeof getModeTitle === 'function' ? getModeTitle() : (mode === 'work' ? 'Deep Focus Session' : mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : 'Focus Session');
  const displayFormattedTime = typeof formatTime === 'function' ? formatTime(timeLeft) : `${Math.floor((timeLeft || 0) / 60).toString().padStart(2, '0')}:${((timeLeft || 0) % 60).toString().padStart(2, '0')}`;

  return (
    <div className="glyph-recorder-deck relative w-full h-full flex flex-col items-center justify-center select-none">

      {/* ── MIC PERMISSION PROMPT ── */}
      {showMicPrompt && micStatus !== 'active' && (
        <div className="absolute inset-x-4 top-2 z-30 flex items-center gap-3 px-4 py-3 rounded-2xl font-mono text-[11px] select-none"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Mic size={14} className="text-[#ff3b30] shrink-0" />
          <div className="flex-1">
            {micStatus === 'denied'
              ? <span className="text-white/70">Microphone access denied. Enable it in browser settings and try again.</span>
              : <span className="text-white/80">Allow microphone access so the visualizer can react to sounds around you.</span>
            }
          </div>
          {micStatus !== 'denied' && (
            <button type="button" onClick={() => { startMic(); setShowMicPrompt(false); }}
              className="px-3 py-1.5 rounded-full bg-[#ff3b30] text-white font-black text-[10px] uppercase tracking-wider cursor-pointer shrink-0">
              Allow
            </button>
          )}
          <button type="button" onClick={() => setShowMicPrompt(false)}
            className="p-1 text-white/40 hover:text-white/80 cursor-pointer shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── TOP TELEMETRY STRIP (UNBOXED) ── */}
      {!(isZenMode || hideTelemetry) && (
        <div className="glyph-deck-telemetry w-full flex items-center justify-between px-2 sm:px-5 py-2 mb-1 text-[11px] font-mono tracking-widest uppercase">
          {/* Left: Recording Status Indicator */}
          <div className="flex items-center gap-2">
            <span className={`glyph-rec-light inline-block w-2.5 h-2.5 rounded-full ${isSpinning ? 'rec-active' : 'rec-standby'}`} />
            <span className={`font-bold tracking-wider ${isSpinning ? 'text-[#ff3b30]' : 'text-[var(--text-tertiary)]'}`}>
              {isSpinning ? '● REC // ACTIVE' : '○ STANDBY'}
            </span>
          </div>

          {/* Center: Model & Audio Telemetry */}
          <div className="hidden sm:flex items-center gap-3 text-[var(--text-secondary)]">
            <span className="text-[10px] tracking-widest">GLYPH G-01 RECORDER</span>
            <span className="text-[var(--text-tertiary)] opacity-40">/</span>
            <span className="text-[10px] tracking-widest">DIRECT DRIVE</span>
          </div>

          {/* Right: RPM toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button type="button" onClick={() => setRpmMode('33')}
                className={`px-2 py-0.5 rounded-full transition-all font-mono ${rpmMode === '33' ? 'text-[var(--text-primary)] font-bold underline underline-offset-4' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'}`}>
                33⅓
              </button>
              <span className="text-[var(--text-tertiary)] opacity-30">/</span>
              <button type="button" onClick={() => setRpmMode('45')}
                className={`px-2 py-0.5 rounded-full transition-all font-mono ${rpmMode === '45' ? 'text-[var(--text-primary)] font-bold underline underline-offset-4' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'}`}>
                45
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN TURNTABLE RECORDER STAGE ── */}
      <div className="glyph-turntable-stage relative w-full flex-1 flex items-center justify-center p-0.5 sm:p-1 lg:p-2 min-h-0">
        {/* Real-time mic reactivity pill toggle (always accessible regardless of hideTelemetry) */}
        <div className={`absolute top-2 right-2 sm:top-3 sm:right-6 z-20 ${isZenMode ? 'auto-hide-element' : ''}`}>
          <button
            type="button"
            onClick={() => {
              if (micActive) { stopMic(); }
              else { setShowMicPrompt(true); }
              sfx.play('toggle');
            }}
            title={micActive ? 'Live microphone active — reacting to ambient sounds & music. Click to stop.' : 'Enable microphone reactivity to respond to music & room sound'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-medium transition-all cursor-pointer backdrop-blur-md shadow-sm ${
              micActive
                ? 'bg-[#ff3b30] text-white shadow-[0_0_12px_rgba(255,59,48,0.4)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
            }`}
          >
            {micActive ? <Mic size={11} /> : <MicOff size={11} />}
            <span>{micActive ? 'LIVE' : 'MIC'}</span>
            {micActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          </button>
        </div>
        <svg
          className="glyph-turntable-svg w-full h-full max-w-[620px] max-h-[620px] lg:max-w-[700px] lg:max-h-[700px] xl:max-w-[780px] xl:max-h-[780px] overflow-visible"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Vinyl radial sheen gradient */}
            <radialGradient id="glyphVinylSheen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#252528" />
              <stop offset="40%" stopColor="#141416" />
              <stop offset="70%" stopColor="#1e1e22" />
              <stop offset="95%" stopColor="#0d0d0f" />
              <stop offset="100%" stopColor="#08080a" />
            </radialGradient>

            {/* Angular lighting reflections on grooves */}
            <linearGradient id="glyphGrooveShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.01" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.14" />
            </linearGradient>

            {/* Center label gradient */}
            <radialGradient id="glyphLabelGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5f5f7" />
              <stop offset="85%" stopColor="#e5e5ea" />
              <stop offset="100%" stopColor="#d1d1d6" />
            </radialGradient>

            {/* Tonearm metal gradient */}
            <linearGradient id="tonearmMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8e8e93" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#636366" />
            </linearGradient>

            {/* Drop shadow for chassis elements */}
            <filter id="glyphShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
            </filter>
            
            <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ────────────────────────────────────────────────────────
              1. 60-DOT CIRCULAR GLYPH LED MATRIX PERIMETER RING
              Authentic Nothing Phone (3) / Nothing OS circular glyph
              ──────────────────────────────────────────────────────── */}
          <g className="glyph-perimeter-ring" transform="translate(220, 250)">
            {/* Ambient faint track guide */}
            <circle cx="0" cy="0" r="214" stroke={isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)'} strokeWidth="1" fill="none" />

            {Array.from({ length: 60 }).map((_, dotIndex) => {
              const angleDeg = (dotIndex / 60) * 360 - 90;
              const angleRad = (angleDeg * Math.PI) / 180;
              const radius = 214;
              const cx = Math.cos(angleRad) * radius;
              const cy = Math.sin(angleRad) * radius;

              const activeDotThreshold = (progressPercent / 100) * 60;
              const isActive = dotIndex <= activeDotThreshold;
              const isLeadDot = Math.floor(activeDotThreshold) === dotIndex;

              return (
                <circle
                  key={dotIndex}
                  cx={cx}
                  cy={cy}
                  r={isLeadDot ? 3.5 : isActive ? 2.5 : 1.5}
                  fill={isLeadDot ? '#ff3b30' : isActive ? (isLight ? '#121212' : '#ffffff') : (isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)')}
                  filter={isActive ? 'url(#ledGlow)' : undefined}
                />
              );
            })}
          </g>

          {/* 3. ROTATING VINYL DISC & STROBE RIM (Clickable) */}
          <g
            className={`glyph-spinning-platter ${
              isSpinning
                ? (rpmMode === '45' || vizBass > 0.7)
                  ? 'platter-spin-fast'
                  : 'platter-spin'
                : 'platter-paused'
            }`}
            style={{ transformOrigin: '220px 250px', cursor: 'pointer' }}
            onClick={handleTogglePlayback}
          >
            {/* Outer Platter Rim */}
            <circle cx="220" cy="250" r="200" fill="#121214" stroke={isLight ? '#3a3a3c' : '#2c2c2e'} strokeWidth="2" />

            {/* Strobe Dot Matrix Rings — opacity pulses with bass */}
            {strobeRings.map((ring, ringIdx) => {
              // Each ring responds to a different frequency band
              const bandVal = ringIdx === 0 ? vizBass : ringIdx === 1 ? vizMid : vizTreble;
              const ringOpacity = Math.max(0.15, Math.min(0.95, (0.55 - ringIdx * 0.08) + bandVal * 0.4));
              return (
                <g key={ringIdx} opacity={ringOpacity}>
                  {Array.from({ length: ring.count }).map((_, i) => {
                    const angle = (i * 360) / ring.count;
                    const rad = (angle * Math.PI) / 180;
                    const cx = 220 + ring.radius * Math.cos(rad);
                    const cy = 250 + ring.radius * Math.sin(rad);
                    // Dots closest to the beat phase glow red
                    const isBeating = i % 4 === 0 && vizPeak > 0.5;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={isBeating ? ring.dotR * 1.4 : ring.dotR}
                        fill={isBeating ? '#ff3b30' : (isLight ? '#38383a' : '#e5e5ea')}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Heavy Vinyl Disc Surface */}
            <circle cx="220" cy="250" r="170" fill="url(#glyphVinylSheen)" />

            {/* Concentric Micro-Grooves */}
            {[164, 158, 152, 146, 140, 134, 128, 122, 116, 110, 104, 98, 92, 86, 80].map((r, idx) => (
              <circle
                key={idx}
                cx="220"
                cy="250"
                r={r}
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth={idx % 3 === 0 ? 1 : 0.5}
                strokeDasharray={idx % 4 === 0 ? '12 2' : 'none'}
              />
            ))}

            {/* Lead-in Groove Track */}
            <circle
              cx="220"
              cy="250"
              r="168"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.8"
            />

            {/* Run-out Groove Track */}
            <circle
              cx="220"
              cy="250"
              r="76"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="0.8"
            />

            {/* Radial Grooves Sheen Overlay */}
            <circle
              cx="220"
              cy="250"
              r="170"
              fill="url(#glyphGrooveShimmer)"
              opacity="0.35"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* 4. VINYL CENTER LABEL (Glyph Brand / Telemetry) */}
            <circle cx="220" cy="250" r="68" fill="url(#glyphLabelGrad)" stroke="#1c1c1e" strokeWidth="2" />
            
            {/* Center Label Decorative Ring */}
            <circle cx="220" cy="250" r="62" fill="none" stroke="#121212" strokeWidth="0.75" strokeDasharray="3 2" />
            <circle cx="220" cy="250" r="48" fill="none" stroke="#ff3b30" strokeWidth="1" />

            {/* Center Label Glyph Typography */}
            <text
              x="220"
              y="218"
              textAnchor="middle"
              fill="#121212"
              fontSize="6.5"
              fontWeight="900"
              letterSpacing="2.5"
              fontFamily="JetBrains Mono, monospace"
            >
              GLYPH AUDIO
            </text>

            <text
              x="220"
              y="228"
              textAnchor="middle"
              fill="#ff3b30"
              fontSize="5"
              fontWeight="800"
              letterSpacing="1.8"
              fontFamily="JetBrains Mono, monospace"
            >
              ● STEREO HI-FI
            </text>

            {/* Rotating Glyph Ring in Center Label */}
            <circle cx="220" cy="250" r="16" fill="#121212" />
            <circle cx="220" cy="250" r="12" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 2" />

            <text
              x="220"
              y="278"
              textAnchor="middle"
              fill="#121212"
              fontSize="5"
              fontWeight="700"
              letterSpacing="1.5"
              fontFamily="JetBrains Mono, monospace"
            >
              RPM {rpmMode}⅓ // SIDE A
            </text>

            <text
              x="220"
              y="288"
              textAnchor="middle"
              fill="#636366"
              fontSize="4.5"
              letterSpacing="1"
              fontFamily="JetBrains Mono, monospace"
            >
              FOCUS RECORDER
            </text>

            {/* Machined Metal Spindle */}
            <circle cx="220" cy="250" r="5" fill="#f2f2f7" stroke="#1c1c1e" strokeWidth="1" />
            <circle cx="220" cy="250" r="2" fill="#ff3b30" />
          </g>

          {/* 5. GLYPH TONEARM BASE & ARTICULATED TONEARM */}
          {/* Tonearm Base Assembly */}
          <g className="glyph-tonearm-base">
            {/* Base mounting ring */}
            <circle cx="410" cy="120" r="38" fill="var(--bg-tertiary)" stroke="var(--border-subtle)" strokeWidth="1.5" />
            <circle cx="410" cy="120" r="30" fill="#1c1c1e" stroke="var(--border-subtle)" strokeWidth="1" />
            
            {/* Pivot Gimbal & Screws */}
            <circle cx="410" cy="120" r="18" fill="url(#tonearmMetal)" stroke="#000000" strokeWidth="1" />
            <circle cx="410" cy="120" r="8" fill="#ff3b30" opacity="0.9" />

            {/* Tonearm Rest / Cradle */}
            <rect x="424" y="196" width="12" height="24" rx="3" fill="#2c2c2e" stroke="var(--border-subtle)" strokeWidth="1" />
            <circle cx="430" cy="208" r="3" fill="#ff3b30" />
          </g>

          {/* Articulated Dynamic Tonearm */}
          <g
            className={`glyph-tonearm-assembly ${isSpinning ? 'tonearm-engaged' : 'tonearm-parked'}`}
            style={{
              transformOrigin: '410px 120px',
              transition: 'transform 1.1s cubic-bezier(0.34, 1.3, 0.64, 1)'
            }}
          >
            {/* Counterweight rear cylinder */}
            <rect
              x="396"
              y="60"
              width="28"
              height="36"
              rx="4"
              fill="#2c2c2e"
              stroke="#636366"
              strokeWidth="1.5"
            />
            <line x1="396" y1="72" x2="424" y2="72" stroke="#ff3b30" strokeWidth="1" />
            <line x1="396" y1="84" x2="424" y2="84" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

            {/* Tonearm Tube (Precision Machined Rod with Smooth S-Curve) */}
            <path
              d="M 410 120 L 410 240 Q 410 270 380 290 L 330 320"
              fill="none"
              stroke="url(#tonearmMetal)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cartridge Headshell */}
            <g className="glyph-headshell" transform="translate(330, 320) rotate(32)">
              {/* Headshell Body */}
              <rect
                x="-10"
                y="-6"
                width="28"
                height="14"
                rx="2"
                fill="#18181b"
                stroke="#d1d1d6"
                strokeWidth="1.2"
              />
              
              {/* Glyph Alignment Line */}
              <line x1="-8" y1="1" x2="16" y2="1" stroke="#ff3b30" strokeWidth="1" />

              {/* Finger Lift Cue Lever */}
              <path d="M 4 -6 Q 4 -16 12 -16" fill="none" stroke="#d1d1d6" strokeWidth="1.5" strokeLinecap="round" />

              {/* Glowing LED Stylus Needle — radius breathes with overall amplitude */}
              <circle
                cx="14"
                cy="1"
                r={isSpinning ? 2.5 + vizOverall * 3.5 : 2}
                fill={isSpinning ? '#ff3b30' : '#8e8e93'}
                filter={isSpinning ? 'url(#ledGlow)' : undefined}
                className={isSpinning ? 'glyph-needle-active' : ''}
                opacity={isSpinning ? 0.7 + vizPeak * 0.3 : 1}
              />
            </g>
          </g>

          {/* 6. GLYPH DECK HARDWARE METERS & INTERACTIVE CONTROLS (UNBOXED) */}
          {/* Dual-Channel Stereo LED VU Meter (Segment bars float borderless) */}
          <g className="glyph-stereo-vu" transform="translate(444, 276)">
            <text x="8" y="-6" textAnchor="middle" fill={isLight ? '#666666' : 'var(--text-tertiary)'} fontSize="6" fontFamily="JetBrains Mono, monospace">L</text>
            <text x="24" y="-6" textAnchor="middle" fill={isLight ? '#666666' : 'var(--text-tertiary)'} fontSize="6" fontFamily="JetBrains Mono, monospace">R</text>

            {Array.from({ length: 12 }).map((_, i) => {
              const segIdx = 11 - i;
              // Left channel: bass-weighted; Right channel: mid/treble-weighted
              // Map the 12 segments across the frequency spectrum
              const segProgress = segIdx / 12; // 0 = quiet, 1 = loud

              let leftLevel, rightLevel;
              if (micActive) {
                // Real mic: left = bass + overall blend, right = mid + treble blend
                leftLevel  = Math.min(12, Math.round((vizBass * 0.6 + vizOverall * 0.4) * 13));
                rightLevel = Math.min(12, Math.round((vizMid  * 0.5 + vizTreble * 0.5) * 13));
              } else {
                // Fallback: smooth animated fake
                leftLevel  = isSpinning ? Math.min(12, Math.max(1, Math.floor((progressPercent / 100) * 10) + ((vuTick + i) % 4 === 0 ? 2 : 1))) : 0;
                rightLevel = isSpinning ? Math.min(12, Math.max(1, Math.floor((progressPercent / 100) * 10) + ((vuTick + i + 1) % 3 === 0 ? 2 : 1))) : 0;
              }

              const isLeftLit  = segIdx < leftLevel;
              const isRightLit = segIdx < rightLevel;
              const isPeak = segIdx >= 10;
              const isMid  = segIdx >= 7 && segIdx < 10;
              const color  = isPeak ? '#ff3b30' : isMid ? '#ff9500' : '#34c759';

              return (
                <g key={i}>
                  <rect x="3"  y={10 + i * 11} width="11" height="7" rx="1.5"
                    fill={isLeftLit  ? color : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)')}
                    filter={isLeftLit  ? 'url(#ledGlow)' : undefined} />
                  <rect x="18" y={10 + i * 11} width="11" height="7" rx="1.5"
                    fill={isRightLit ? color : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)')}
                    filter={isRightLit ? 'url(#ledGlow)' : undefined} />
                </g>
              );
            })}
          </g>

          {/* The Start/Stop pill that used to live here duplicated the real
              Start Focus button in the controls console — a second filled-red
              button on the same screen. The disc itself stays clickable via
              handleTogglePlayback on the platter group above, so nothing is
              lost functionally, only the second Start affordance. */}

          {/* Quartz Speed Lock LED Indicator (Bottom Left) */}
          <g className="glyph-quartz-lock" transform="translate(120, 417)">
            <circle cx="0" cy="0" r="4" fill={isSpinning ? '#34c759' : '#8e8e93'} filter={isSpinning ? 'url(#ledGlow)' : undefined} />
            <text x="10" y="3" fill={isLight ? '#121212' : 'var(--text-secondary)'} fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              QUARTZ LOCK 0.0%
            </text>
          </g>
        </svg>
      </div>

      {/* ── BOTTOM HARDWARE TELEMETRY (UNBOXED) ── */}
      {!(isZenMode || hideTelemetry) && (
        <div className="glyph-deck-footer w-full flex items-center justify-between px-2 sm:px-5 py-2 mt-1 text-[10px] font-mono text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            <span>TRACK: <strong className="text-[var(--text-primary)] font-bold">{displayModeTitle}</strong></span>
            <span className="text-[var(--text-tertiary)] opacity-40">/</span>
            <span>GROOVE: <strong className="text-[var(--text-primary)] font-bold">{Math.round(progressPercent)}% CUT</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>TIME REMAINING:</span>
            <span className="font-bold text-[var(--text-primary)] font-mono text-xs">{displayFormattedTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}
