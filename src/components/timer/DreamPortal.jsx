import React, { useEffect, useRef } from 'react';
import FlipText from '../ui/FlipText';
import { MODE_PALETTES } from '../surreal/spectrum';

/*
 * DreamPortal — the timer as a piece of generative digital art.
 *
 * A round window onto liquid colour: six luminous blobs orbit and melt into
 * each other inside the portal (canvas, additive blending). Around it, a
 * gradient halo fills with progress while a small planet travels the ring.
 * The time sits in the middle in painted serif. Tap the portal to start or
 * pause. The palette follows the mode: focus burns hot, breaks run cool.
 */

const PALETTES = MODE_PALETTES;

const R = 200; // portal radius in the 560×560 view box
const RING = 236;
const CIRC = 2 * Math.PI * RING;

export default function DreamPortal({
  timeLeft,
  totalDuration,
  isRunning,
  mode = 'work',
  getModeTitle,
  formatTime,
  startTimer,
  pauseTimer,
  calmDigits = false,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ isRunning, mode });
  stateRef.current = { isRunning, mode };

  const palette = PALETTES[mode] || PALETTES.work;
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - timeLeft) / totalDuration)) : 0;
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const planetX = 280 + RING * Math.cos(angle);
  const planetY = 280 + RING * Math.sin(angle);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext?.('2d');
    // jsdom / mocked or partial canvas contexts: skip the art, keep the timer
    if (!ctx || typeof ctx.clip !== 'function' || typeof ctx.createRadialGradient !== 'function') return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const size = 440;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const seeds = Array.from({ length: 6 }, (_, i) => ({
      orbit: 60 + (i * 23) % 110,
      speed: 0.00012 + i * 0.000035,
      phase: i * 1.7,
      radius: 150 + (i * 37) % 100,
      wobble: 0.6 + (i % 3) * 0.35,
    }));

    let t = 0;
    let last = performance.now();
    let frame = 0;

    const draw = (now) => {
      const { isRunning: running, mode: m } = stateRef.current;
      const pal = PALETTES[m] || PALETTES.work;
      const dt = Math.min(64, now - last);
      last = now;
      t += dt * (running ? 2.4 : 1);

      const c = size / 2;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(c, c, size / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = pal.base;
      ctx.fillRect(0, 0, size, size);

      ctx.globalCompositeOperation = 'lighter';
      seeds.forEach((s, i) => {
        const a = s.phase + t * s.speed * (i % 2 ? 1 : -1);
        const x = c + Math.cos(a) * s.orbit + Math.sin(t * 0.0004 * s.wobble + i) * 30;
        const y = c + Math.sin(a * 1.3) * s.orbit * 0.9;
        const r = s.radius * (0.85 + 0.15 * Math.sin(t * 0.0009 + i));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, pal.blobs[i]);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      });

      // slow bands of light sweeping through the liquid
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.35;
      for (let k = 0; k < 5; k++) {
        const y = ((t * 0.02 + k * 90) % (size + 120)) - 60;
        const band = ctx.createLinearGradient(0, y - 30, 0, y + 30);
        band.addColorStop(0, 'rgba(255,255,255,0)');
        band.addColorStop(0.5, 'rgba(255,255,255,0.9)');
        band.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = band;
        ctx.fillRect(0, y - 30, size, 60);
      }

      // glass vignette so the portal reads as a sphere of light
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      const v = ctx.createRadialGradient(c * 0.8, c * 0.7, size * 0.1, c, c, size / 2);
      v.addColorStop(0, 'rgba(255,255,255,0.18)');
      v.addColorStop(0.7, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(10,0,30,0.4)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();

      if (!reduced) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = () => (isRunning ? pauseTimer?.() : startTimer?.());
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  const title = getModeTitle ? getModeTitle() : 'Focus';
  const time = formatTime ? formatTime(timeLeft) : '';

  return (
    <div className={`dream-portal ${isRunning ? 'is-running' : ''} dream-portal--${mode}`}>
      <div
        className="dream-portal-stage"
        role="button"
        tabIndex={0}
        aria-label={`${isRunning ? 'Pause' : 'Begin'} the portal (${title}, ${time} left)`}
        onClick={toggle}
        onKeyDown={onKey}
      >
        <div className="dream-portal-glow" />
        <canvas ref={canvasRef} className="dream-portal-canvas" aria-hidden="true" />
        <svg className="dream-portal-svg" viewBox="0 0 560 560" aria-hidden="true">
          <defs>
            <linearGradient id="dpRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.ring[0]} />
              <stop offset="50%" stopColor={palette.ring[1]} />
              <stop offset="100%" stopColor={palette.ring[2]} />
            </linearGradient>
            <radialGradient id="dpPlanet" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={palette.ring[0]} />
              <stop offset="100%" stopColor={palette.ring[2]} />
            </radialGradient>
          </defs>

          {/* ticks: 60 minutes around the halo */}
          <g className="dream-portal-ticks">
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const r1 = i % 5 === 0 ? 256 : 260;
              return (
                <line
                  key={i}
                  x1={280 + Math.cos(a) * r1}
                  y1={280 + Math.sin(a) * r1}
                  x2={280 + Math.cos(a) * 266}
                  y2={280 + Math.sin(a) * 266}
                  strokeWidth={i % 5 === 0 ? 2.5 : 1.2}
                />
              );
            })}
          </g>

          <circle className="dream-portal-track" cx="280" cy="280" r={RING} />
          <circle
            className="dream-portal-progress"
            cx="280"
            cy="280"
            r={RING}
            stroke="url(#dpRing)"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform="rotate(-90 280 280)"
          />
          <g className="dream-portal-planet" transform={`translate(${planetX} ${planetY})`}>
            <ellipse rx="22" ry="6" className="dream-portal-planet-ring" transform="rotate(-20)" />
            <circle r="12" fill="url(#dpPlanet)" />
          </g>

          <circle className="dream-portal-rim" cx="280" cy="280" r={R + 20} />
        </svg>

        <div className="dream-portal-readout">
          <span className="dream-portal-mode">{title}</span>
          <FlipText className="dream-portal-time" text={time} still={calmDigits ? 2 : 0} />
          <span className="dream-portal-hint">{isRunning ? 'tap to pause' : 'tap to begin'}</span>
        </div>
      </div>
    </div>
  );
}
