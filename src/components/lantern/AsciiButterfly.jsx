import React, { useEffect, useRef } from 'react';
import atlasUrl from './butterfly-atlas.webp';

/*
 * AsciiButterfly — a Blue Morpho made of coloured ASCII that visits the
 * Lantern Garden.
 *
 * Every 5 minutes exactly it flutters in from the edge of the screen and
 * lands in the middle, then flies away again. The app behind it drifts out
 * of focus as it approaches and comes back into focus as it leaves: the blur
 * is driven frame by frame by how close it is. While it rests it bobs
 * gently, slowly opening and closing its wings. A tap or keypress sends it
 * off early.
 *
 * The insect itself is a real 3D model rendered in Blender
 * (resources/blender: painted from Morpho references, structural-blue
 * upperside with black margins and white apex spots, iridescent toward
 * violet as the wings fold). butterfly-atlas.webp holds one wingbeat, 24
 * frames from wings-down (−35°) to clapped shut (88°). Each frame, every
 * cell of a fixed character grid samples the frame for the current wing
 * angle: its brightness picks the glyph, its colour paints it. So it reads
 * as true ASCII art, in perspective, while it moves. Only the butterfly's
 * bounding box is redrawn each frame.
 */

const FONT_PX = 6;
const CW = FONT_PX * 0.6; // monospace cell width
const CH = FONT_PX;       // cell height
// darkest → brightest
const RAMP = ".:-=+*cxoaeO0#%&8B@";
const VELVET = '#%&8B';

// atlas layout (must match the Blender render)
const FW = 160;
const FH = 128;
const COLS = 6;
const NF = 24;
const A0 = -35;
const A1 = 88;
const ASPECT = FW / FH;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** Wing angle in degrees → atlas frame index. */
export const frameForAngle = (deg) => Math.round(clamp01((deg - A0) / (A1 - A0)) * (NF - 1));

/** Decode the atlas once into raw RGBA (null where canvas can't, e.g. jsdom). */
function loadAtlas(onReady) {
  if (typeof Image === 'undefined') return;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext?.('2d');
    if (!g || typeof g.drawImage !== 'function' || typeof g.getImageData !== 'function') return;
    g.drawImage(img, 0, 0);
    onReady({ data: g.getImageData(0, 0, c.width, c.height).data, width: c.width });
  };
  img.src = atlasUrl;
}

export default function AsciiButterfly() {
  const canvasRef = useRef(null);
  const focusRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const focus = focusRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext?.('2d');
    if (!ctx || typeof ctx.fillText !== 'function') return undefined; // jsdom / no canvas
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let atlas = null;
    loadAtlas((a) => { atlas = a; });

    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    const S = {
      phase: 'idle', // idle → arrive → rest → leave → idle
      t0: 0,
      flap: 0,
      from: [0, 0],
      c1: [0, 0],
      c2: [0, 0],
      to: [0, 0],
      bbox: null,
      frame: 0,
      timer: 0,
      leaveEarly: false,
    };
    const DUR = { arrive: 4.6, rest: 6.5, leave: 3.6 };
    const VISIT_EVERY_MS = 5 * 60 * 1000; // exactly every 5 minutes
    const landingSize = () => Math.min(W * 0.46, 280);

    // the blur is tied to the butterfly: 0 = sharp, 1 = fully out of focus
    const setFocus = (amount) => {
      if (focus) {
        const o = Math.max(0, Math.min(1, amount));
        focus.style.opacity = String(o);
        // a full-screen backdrop blur still costs a GPU pass at opacity 0, so it's
        // only visible while the butterfly is actually near
        focus.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      }
    };

    const begin = () => {
      if (S.phase !== 'idle' || document.hidden) return;
      const leftSide = Math.random() < 0.5;
      S.from = [leftSide ? -80 : W + 80, H * (0.15 + Math.random() * 0.45)];
      S.to = [W * 0.5, H * 0.46];
      S.c1 = [W * (leftSide ? 0.25 : 0.75), H * (0.05 + Math.random() * 0.3)];
      S.c2 = [W * (leftSide ? 0.62 : 0.38), H * (0.62 + Math.random() * 0.2)];
      S.phase = 'arrive';
      S.t0 = performance.now();
      S.leaveEarly = false;
      if (!S.frame) S.frame = requestAnimationFrame(loop);
    };

    const leave = () => {
      if (S.phase !== 'rest') return;
      S.phase = 'leave';
      S.t0 = performance.now();
      const right = Math.random() < 0.5;
      S.from = S.to;
      S.c1 = [W * (right ? 0.6 : 0.4), H * 0.25];
      S.c2 = [W * (right ? 0.85 : 0.15), H * 0.05];
      S.to = [right ? W + 120 : -120, -80];
    };

    const bezier = (p0, p1, p2, p3, t) => {
      const u = 1 - t;
      return [
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ];
    };

    let last = performance.now();
    const loop = (now) => {
      S.frame = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;
      const el = (now - S.t0) / 1000;

      let pos;
      let size;
      let angle = 0; // wing angle in degrees: 0 = flat open, 88 = clapped shut
      let tilt = 0;

      if (S.phase === 'arrive') {
        const t = clamp01(el / DUR.arrive);
        const e = easeInOut(t);
        pos = bezier(S.from, S.c1, S.c2, S.to, e);
        pos[1] += Math.sin(el * 9) * 14 * (1 - t);
        size = lerp(40, landingSize(), easeOut(Math.max(0, (t - 0.35) / 0.65)));
        // the world softens as it approaches
        setFocus(easeInOut(clamp01((t - 0.1) / 0.9)));
        S.flap += dt * (2 * Math.PI) * lerp(8, 2.2, t);
        // a full stroke: clapped above the back (88°) down to −35°
        angle = 26.5 + 61.5 * Math.cos(S.flap);
        const ahead = bezier(S.from, S.c1, S.c2, S.to, Math.min(1, e + 0.02));
        tilt = Math.max(-0.35, Math.min(0.35, (ahead[0] - pos[0]) * 0.02)) * (1 - t);
        if (t >= 1) { S.phase = 'rest'; S.t0 = now; }
      } else if (S.phase === 'rest') {
        pos = [S.to[0], S.to[1] + Math.sin(el * 1.8) * 4]; // a gentle bob while it rests
        size = landingSize();
        setFocus(1);
        // resting butterflies open and close their wings slowly
        angle = 8 + 50 * (0.5 - 0.5 * Math.cos(el * (Math.PI * 2 / 2.8)));
        if (el >= DUR.rest || S.leaveEarly) leave();
      } else if (S.phase === 'leave') {
        const t = clamp01(el / DUR.leave);
        const e = easeInOut(t);
        pos = bezier(S.from, S.c1, S.c2, S.to, e);
        size = lerp(landingSize(), 40, easeOut(t));
        // …and comes back into focus as it flies away
        setFocus(1 - easeInOut(clamp01(t / 0.85)));
        S.flap += dt * (2 * Math.PI) * lerp(3, 9, t);
        angle = 26.5 + 61.5 * Math.cos(S.flap);
        tilt = 0.25 * Math.sin(el * 3);
        if (t >= 1) {
          S.phase = 'idle';
          setFocus(0);
          if (S.bbox) ctx.clearRect(...S.bbox);
          S.bbox = null;
          return;
        }
      } else {
        return;
      }

      // clear last frame's box
      if (S.bbox) ctx.clearRect(...S.bbox);

      const half = size / 2;
      const halfH = half / ASPECT;
      const bx = Math.floor((pos[0] - half) / CW) * CW;
      const by = Math.floor((pos[1] - halfH) / CH) * CH;
      const bw = Math.ceil((size + CW * 2) / CW) * CW;
      const bh = Math.ceil((halfH * 2 + CH * 2) / CH) * CH;
      S.bbox = [bx - 2, by - 2, bw + 4, bh + 4];
      if (!atlas) { S.frame = requestAnimationFrame(loop); return; }

      const f = frameForAngle(angle);
      const ox = (f % COLS) * FW;
      const oy = Math.floor(f / COLS) * FH;
      const { data, width } = atlas;
      const cosT = Math.cos(-tilt);
      const sinT = Math.sin(-tilt);

      ctx.font = `700 ${FONT_PX}px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      for (let py = by; py < by + bh; py += CH) {
        for (let px = bx; px < bx + bw; px += CW) {
          // cell centre → frame pixel (undo tilt)
          const dx = px + CW / 2 - pos[0];
          const dy = py + CH / 2 - pos[1];
          const u = (dx * cosT - dy * sinT) / half;   // −1..1 across the frame
          const v = (dx * sinT + dy * cosT) / halfH;
          if (u < -1 || u >= 1 || v < -1 || v >= 1) continue;
          const sx = ox + ((u + 1) * 0.5 * FW) | 0;
          const sy = oy + ((v + 1) * 0.5 * FH) | 0;
          const k = (sy * width + sx) * 4;
          const a = data[k + 3];
          if (a < 90) continue;
          const r = data[k];
          const g = data[k + 1];
          const b = data[k + 2];
          // perceived brightness picks the glyph; edges (low alpha) stay light
          const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
          if (lum < 0.13 && a > 200) {
            // the black velvet (margins, body): heavy glyphs in a dark that still
            // reads on the night garden, so the wing keeps its outline
            ctx.fillStyle = `rgb(${(r * 0.4 + 52) | 0},${(g * 0.4 + 42) | 0},${(b * 0.4 + 72) | 0})`;
            ctx.fillText(VELVET[(sx * 7 + sy * 13) % VELVET.length], px, py);
            continue;
          }
          const ci = Math.min(RAMP.length - 1, Math.floor(Math.pow(lum, 0.8) * (a / 255) * RAMP.length * 1.15));
          ctx.fillStyle = `rgb(${Math.min(255, r * 1.12 + 22) | 0},${Math.min(255, g * 1.12 + 18) | 0},${Math.min(255, b * 1.12 + 30) | 0})`;
          ctx.fillText(RAMP[ci], px, py);
        }
      }

      S.frame = requestAnimationFrame(loop);
    };

    // exactly every 5 minutes (a visit is skipped if the tab is hidden)
    S.timer = setInterval(begin, VISIT_EVERY_MS);
    // development-only hook so the visit can be checked without waiting
    if (import.meta.env?.DEV) window.__zencusButterfly = begin;

    const onKey = () => { if (S.phase === 'rest') S.leaveEarly = true; };
    const onPointer = () => { if (S.phase === 'rest') S.leaveEarly = true; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);

    return () => {
      clearInterval(S.timer);
      if (S.frame) cancelAnimationFrame(S.frame);
      if (import.meta.env?.DEV && window.__zencusButterfly === begin) delete window.__zencusButterfly;
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      setFocus(0);
    };
  }, []);

  return (
    <>
      {/* everything behind the butterfly drifts out of focus while it rests */}
      <div ref={focusRef} className="butterfly-focus" aria-hidden="true" />
      <canvas ref={canvasRef} className="ascii-butterfly" aria-hidden="true" />
    </>
  );
}
