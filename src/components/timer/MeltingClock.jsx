import React, { useMemo } from 'react';
import { paletteFor } from '../surreal/spectrum';

/*
 * MeltingClock — "The Persistence of Memory", as a timer.
 *
 * A Dalí clock whose face is already soft, and melts further as the session
 * runs: the lower half sags and three drips lengthen until, at the end, the
 * clock is pouring off itself. Every mark on the face (ticks, hand, hub) is
 * pushed through the same melt, so the whole object bends together.
 * Tap the clock to start or pause.
 */

const CX = 200;
const CY = 190;
const R = 150;

// three drips hanging off the bottom of the face: x, width, length
const DRIPS = [
  [-62, 20, 1.0],
  [8, 26, 1.6],
  [74, 16, 0.75],
];

function melt(x, y, amount) {
  const dx = (x - CX) / R;
  const below = Math.max(0, (y - CY + 20) / (R + 20)); // starts sagging just above the middle
  const centre = Math.max(0, 1 - dx * dx);
  let dy = amount * 95 * Math.pow(below, 1.7) * (0.3 + 0.7 * centre);
  DRIPS.forEach(([ox, w, len]) => {
    const k = Math.exp(-(((x - CX - ox) / w) ** 2));
    dy += amount * 62 * len * k * Math.pow(below, 3);
  });
  const nx = x + (CX - x) * 0.1 * amount * below;
  return [nx, y + dy];
}

export default function MeltingClock({
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
  // it's a Dalí clock: already soft before it starts
  const amount = 0.28 + 0.72 * progress;
  const colours = paletteFor(mode).face;

  const { face, rim, ticks, hand } = useMemo(() => {
    const pts = [];
    const N = 180;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts.push(melt(CX + Math.cos(a) * R, CY + Math.sin(a) * R, amount));
    }
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';

    const inner = [];
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      inner.push(melt(CX + Math.cos(a) * (R - 16), CY + Math.sin(a) * (R - 16), amount));
    }
    const dRim = inner.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';

    const tickList = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const [x1, y1] = melt(CX + Math.cos(a) * (R - 30), CY + Math.sin(a) * (R - 30), amount);
      const [x2, y2] = melt(CX + Math.cos(a) * (R - (i % 3 === 0 ? 52 : 42)), CY + Math.sin(a) * (R - (i % 3 === 0 ? 52 : 42)), amount);
      return { x1, y1, x2, y2, major: i % 3 === 0 };
    });

    const ha = progress * Math.PI * 2 - Math.PI / 2;
    const [hx, hy] = melt(CX + Math.cos(ha) * (R - 40), CY + Math.sin(ha) * (R - 40), amount);
    const [mx, my] = melt(CX + Math.cos(ha) * (R - 90), CY + Math.sin(ha) * (R - 90) + 6, amount);
    return {
      face: d,
      rim: dRim,
      ticks: tickList,
      hand: `M${CX} ${CY} Q${mx.toFixed(1)} ${my.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`,
    };
  }, [amount, progress]);

  const title = getModeTitle ? getModeTitle() : 'Focus';
  const time = formatTime ? formatTime(timeLeft) : '';
  const toggle = () => (isRunning ? pauseTimer?.() : startTimer?.());

  return (
    <div className={`melt-clock melt-clock--${mode} ${isRunning ? 'is-running' : ''}`}>
      <div
        className="melt-stage"
        role="button"
        tabIndex={0}
        aria-label={`${isRunning ? 'Pause' : 'Begin'} the soft clock (${title}, ${time} left)`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="melt-readout" aria-hidden="true">
          <span className="melt-readout-mode">{title}</span>
          <span className="melt-readout-time">{time}</span>
          <span className="melt-readout-hint">{isRunning ? 'tap to pause' : 'tap to begin'}</span>
        </div>
        <svg viewBox="0 0 400 540" className="melt-svg" aria-hidden="true">
          <defs>
            <linearGradient id="meltFace" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor={colours[0]} />
              <stop offset="40%" stopColor={colours[1]} />
              <stop offset="75%" stopColor={colours[2]} />
              <stop offset="100%" stopColor={colours[3]} />
            </linearGradient>
            <radialGradient id="meltGloss" cx="35%" cy="22%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* winding crown and ring, still solid — only the face melts */}
          <rect x="188" y="16" width="24" height="18" rx="5" className="melt-crown" />
          <circle cx="200" cy="12" r="9" fill="none" className="melt-bow" />

          <path d={face} fill="url(#meltFace)" className="melt-face" />
          <path d={face} fill="url(#meltGloss)" />
          <path d={rim} fill="none" className="melt-rim" />

          <g className="melt-ticks">
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 5 : 2.5} />
            ))}
          </g>

          <path d={hand} className="melt-hand" />
          <circle cx={CX} cy={CY} r="9" className="melt-hub" />
        </svg>

      </div>
    </div>
  );
}
