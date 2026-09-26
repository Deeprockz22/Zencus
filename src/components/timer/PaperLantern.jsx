import React from 'react';
import { lanternModeFor } from '../lantern/lanternPalette';

/*
 * PaperLantern — the Lantern Garden's timer.
 *
 * A chōchin paper lantern hanging on its string. As the session runs it
 * fills with light from the bottom up, so the lantern itself is the progress
 * bar: dim at the start, fully lit at the end. The time is brushed on the
 * paper in ink. Focus burns lantern-gold; breaks glow with the cyan and pink
 * of the garden's spirit-lights. While it runs, fireflies circle it and it
 * sways a little more. Tap to light or pause.
 */

const BODY = 'M92 118 C60 170 56 350 92 404 L308 404 C344 350 340 170 308 118 Z';
const TOP = 118;
const BOTTOM = 404;

export default function PaperLantern({
  timeLeft,
  totalDuration,
  isRunning,
  mode = 'work',
  getModeTitle,
  formatTime,
  startTimer,
  pauseTimer,
}) {
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - timeLeft) / totalDuration)) : 0;
  const light = lanternModeFor(mode);
  const title = getModeTitle ? getModeTitle() : 'Focus';
  const time = formatTime ? formatTime(timeLeft) : '';
  // a small ember glows at the bottom even before it's lit, so it reads as a lantern
  const fillTop = BOTTOM - (BOTTOM - TOP) * Math.max(progress, 0.06);
  const toggle = () => (isRunning ? pauseTimer?.() : startTimer?.());

  return (
    <div className={`paper-lantern paper-lantern--${mode} ${isRunning ? 'is-running' : ''}`}>
      <div
        className="paper-lantern-stage"
        role="button"
        tabIndex={0}
        aria-label={`${isRunning ? 'Pause' : 'Light'} the lantern (${title}, ${time} left)`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <svg className="paper-lantern-svg" viewBox="0 0 400 560" aria-hidden="true">
          <defs>
            <radialGradient id="plHalo">
              <stop offset="0%" stopColor={light.mid} stopOpacity={0.35 + progress * 0.45} />
              <stop offset="60%" stopColor={light.mid} stopOpacity={0.08 + progress * 0.12} />
              <stop offset="100%" stopColor={light.mid} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="plPaper" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6b3a3a" />
              <stop offset="18%" stopColor="#d9a978" />
              <stop offset="50%" stopColor="#f4dcc0" />
              <stop offset="82%" stopColor="#d9a978" />
              <stop offset="100%" stopColor="#6b3a3a" />
            </linearGradient>
            <linearGradient id="plLight" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={light.edge} />
              <stop offset="45%" stopColor={light.mid} />
              <stop offset="100%" stopColor={light.core} />
            </linearGradient>
            <linearGradient id="plLightSides" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
              <stop offset="22%" stopColor="#000" stopOpacity="0" />
              <stop offset="78%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </linearGradient>
            <clipPath id="plBodyClip"><path d={BODY} /></clipPath>
            <linearGradient id="plMeniscus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light.core} stopOpacity="0" />
              <stop offset="100%" stopColor={light.core} stopOpacity="0.85" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="262" r="250" fill="url(#plHalo)" className="pl-halo" />

          <g className="pl-sway">
            {/* string and hook */}
            <line x1="200" y1="0" x2="200" y2="86" stroke="#2a1422" strokeWidth="3" />
            <circle cx="200" cy="90" r="6" fill="none" stroke="#2a1422" strokeWidth="3" />

            {/* top cap */}
            <rect x="118" y="96" width="164" height="24" rx="6" fill="#2b1418" />
            <rect x="126" y="100" width="148" height="4" rx="2" fill="#6e3b2c" />

            {/* the paper body, unlit */}
            <path d={BODY} fill="url(#plPaper)" />

            {/* the light, rising from the bottom as the session runs */}
            <g clipPath="url(#plBodyClip)">
              <rect className="pl-light" x="40" y={fillTop} width="320" height={BOTTOM - fillTop + 4} fill="url(#plLight)" />
              <rect x="40" y={fillTop - 26} width="320" height="26" fill="url(#plMeniscus)" className="pl-meniscus" />
              <rect x="40" y={TOP} width="320" height={BOTTOM - TOP} fill="url(#plLightSides)" />
            </g>

            {/* bamboo ribs */}
            <g clipPath="url(#plBodyClip)" stroke="#7a3e2a" strokeOpacity="0.55" strokeWidth="2.2" fill="none">
              {Array.from({ length: 12 }, (_, i) => {
                const y = TOP + 14 + i * 22.5;
                return <path key={i} d={`M40 ${y} Q200 ${y + 10} 360 ${y}`} />;
              })}
            </g>

            {/* the time, brushed on the paper in ink */}
            <text x="200" y="232" textAnchor="middle" className="pl-mode">{title}</text>
            <text x="200" y="298" textAnchor="middle" className="pl-time">{time}</text>

            {/* bottom cap and tassel */}
            <rect x="118" y="402" width="164" height="24" rx="6" fill="#2b1418" />
            <g className="pl-tassel">
              <line x1="200" y1="426" x2="200" y2="452" stroke="#c0392b" strokeWidth="4" />
              <path d="M186 452 L214 452 L208 520 L192 520 Z" fill="#c0392b" />
              {[-6, -2, 2, 6].map((dx) => (
                <line key={dx} x1={200 + dx} y1="456" x2={200 + dx * 1.2} y2="522" stroke="#e05a4a" strokeWidth="1.2" />
              ))}
            </g>
          </g>

          {/* fireflies circle it while it burns */}
          <g className="pl-flies">
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} className="pl-fly" r={2.2 + (i % 3)} cx="200" cy="262"
                style={{ '--orbit': `${150 + (i % 4) * 26}px`, animationDelay: `${-i * 1.9}s`, animationDuration: `${9 + (i % 3) * 3}s` }} />
            ))}
          </g>
        </svg>
        <span className="pl-hint" aria-hidden="true">{isRunning ? 'tap to pause' : 'tap to light the lantern'}</span>
      </div>
    </div>
  );
}
