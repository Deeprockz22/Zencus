import React, { useEffect, useRef } from 'react';

/*
 * AsciiButterfly — a butterfly made of coloured ASCII that visits the
 * Lantern Garden.
 *
 * A small, cute visitor: every 5 minutes exactly it flutters in from the
 * edge of the screen and lands in the middle, then flies away again. The app
 * behind it drifts out of focus as it approaches and comes back into focus as
 * it leaves: the blur is driven frame by frame by how close it is. While it
 * rests it bobs gently, slowly opening and closing its wings. A tap or
 * keypress sends it off early.
 *
 * Every character is computed from a model of the insect, per frame:
 *   · forewings + hindwings (with tails), mirrored across the body
 *   · iridescent upperside: indigo root → cyan/violet shimmer → blossom tips
 *   · black margins with rows of white dots, a submarginal row of gold spots
 *   · veins radiating from the wing root, drawn as | / \ - along their angle
 *   · gold-ringed eyespots on the hindwings
 *   · per-cell "scale" noise for texture; a muted tawny underside that shows
 *     when the wings fold past vertical
 *   · a segmented body, and antennae with clubbed tips
 * Characters sit on a fixed screen grid, so it reads as true ASCII art while
 * it moves. Only the butterfly's bounding box is redrawn each frame.
 */

const FONT_PX = 7;
const CW = FONT_PX * 0.6; // monospace cell width
const CH = FONT_PX;       // cell height
const DENSE = '@#%&8B$WM';
const MID = '*+=xoaeX';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const UP = {
  root: hex('#23145e'),
  cyan: hex('#3fe6ff'),
  violet: hex('#7a5cff'),
  pink: hex('#ff5fb0'),
  coral: hex('#ffb08a'),
  gold: hex('#ffc24a'),
  black: hex('#2a1238'),
  white: hex('#fff8ee'),
  hindBase: hex('#5a2fb0'),
  hindMid: hex('#ff8fc8'),
};
const UNDER = {
  root: hex('#3a2a22'),
  a: hex('#b88a5c'),
  b: hex('#e2c49a'),
  edge: hex('#4a3526'),
};

// Wing geometry in butterfly space: x ∈ [-1,1] (wingspan), y downward.
// Radii are measured from each wing's root along a ray; t runs from the
// wing's leading edge to its trailing edge. Neither wing collapses to nothing
// along its trailing edge, so the hindwing tucks under the forewing the way
// a real butterfly's does, with no gap between them.
//   forewing: a swept triangle — short at the costa, a pointed apex, then a
//             long straight inner margin back toward the body
//   hindwing: a rounded fan with a scalloped edge and a tail
const FORE = { rx: 0.05, ry: -0.04, a0: -1.95, a1: 0.42 };
const HIND = { rx: 0.05, ry: 0.05, a0: -0.05, a1: 1.72 };

function foreRadius(t) {
  // a rounded, generous forewing (cute rather than sharp)
  if (t < 0.55) return 0.2 + 0.78 * Math.pow(Math.sin((t / 0.55) * Math.PI / 2), 1.2);
  return 0.98 - 0.42 * Math.pow((t - 0.55) / 0.45, 1.6);
}
function hindRadius(t) {
  const fan = 0.54 + 0.3 * Math.sin(Math.min(1, t / 0.7) * Math.PI * 0.95);
  const toBody = t > 0.78 ? -0.34 * Math.pow((t - 0.78) / 0.22, 1.4) : 0;
  const scallop = 0.025 * Math.sin(t * Math.PI * 14);
  const tail = 0.1 * Math.exp(-Math.pow((t - 0.72) / 0.05, 2)); // a short, sweet tail
  return fan + toBody + scallop + tail;
}

// Sample the butterfly at local point (x, y). Returns [char, rgb] or null.
function sample(x, y, time, underside) {
  const ax = Math.abs(x);

  // --- antennae: thin curves from the head up and outward, clubbed tips
  if (y < -0.3 && ax < 0.34) {
    const t = clamp01((-0.3 - y) / 0.46);
    const cx = 0.03 + 0.26 * Math.pow(t, 1.4);
    if (Math.abs(ax - cx) < 0.03 + (t > 0.9 ? 0.035 : 0)) {
      if (t > 0.9) return ['@', [255, 206, 110]];
      return [x > 0 ? '/' : '\\', [120, 96, 120]];
    }
  }

  // --- body: head, thorax, segmented abdomen
  const head = (x * x) / (0.075 * 0.075) + ((y + 0.27) * (y + 0.27)) / (0.075 * 0.075);
  const thorax = (x * x) / (0.07 * 0.07) + ((y + 0.13) * (y + 0.13)) / (0.13 * 0.13);
  const abd = (x * x) / (0.06 * 0.06) + ((y - 0.17) * (y - 0.17)) / (0.22 * 0.22);
  if (head < 1 || thorax < 1 || abd < 1) {
    const seg = abd < 1 && Math.floor((y - 0.0) * 22) % 2 === 0;
    const fuzz = hash(Math.round(x * 90), Math.round(y * 90));
    if (head < 1) return ['@', [40, 26, 40]];
    if (thorax < 1) return [fuzz > 0.7 ? '%' : '8', fuzz > 0.82 ? [210, 170, 90] : [52, 34, 44]];
    return [seg ? '=' : '8', seg ? [150, 110, 70] : [44, 30, 38]];
  }

  // --- wings (mirror to the right side)
  const wing = (w, radiusFn) => {
    const dx = ax - w.rx;
    const dy = y - w.ry;
    const ang = Math.atan2(dy, dx);
    if (ang < w.a0 || ang > w.a1) return null;
    const t = (ang - w.a0) / (w.a1 - w.a0);
    const r = radiusFn(t);
    const dist = Math.hypot(dx, dy);
    if (dist > r) return null;
    return { t, d: dist / r, ang };
  };
  const fw = wing(FORE, foreRadius);
  const hw = fw ? null : wing(HIND, hindRadius);
  const w = fw || hw;
  if (!w) return null;
  const fore = !!fw;
  const { t, d, ang } = w;
  const grain = hash(Math.round(x * 140), Math.round(y * 140));

  // veins: radial lines from the root, plus the cross-vein that closes the cell
  const veinCount = fore ? 7 : 6;
  const vf = Math.abs(((t * veinCount) % 1) - 0.5);
  const isVein = (vf > 0.455 && d > 0.12) || (Math.abs(d - (fore ? 0.46 : 0.4)) < 0.022 && t > 0.2 && t < 0.8);

  // outer margin: black band with rows of white dots
  const margin = d > 0.86;
  const dotLine = fore ? t * 16 : t * 13;
  const isDot = margin && d > 0.9 && d < 0.965 && Math.abs((dotLine % 1) - 0.5) < 0.2;
  const subDot = !margin && d > 0.76 && d < 0.83 && Math.abs(((t * (fore ? 11 : 9)) % 1) - 0.5) < 0.16;

  // hindwing eyespot
  let eye = -1;
  if (!fore) {
    const ex = HIND.rx + Math.cos(HIND.a0 + 0.52 * (HIND.a1 - HIND.a0)) * 0.44;
    const ey = HIND.ry + Math.sin(HIND.a0 + 0.52 * (HIND.a1 - HIND.a0)) * 0.44;
    eye = Math.hypot(ax - ex, y - ey);
  }

  if (underside) {
    // the underside: muted tawny, a faint echo of the same pattern
    let c = mix(UNDER.root, d < 0.5 ? UNDER.a : UNDER.b, clamp01(d * 1.3));
    if (margin) c = UNDER.edge;
    if (isVein) c = mix(c, UNDER.root, 0.6);
    if (isDot || subDot) c = [236, 222, 196];
    c = c.map((v) => v * (0.82 + grain * 0.3));
    return [isVein ? veinChar(ang) : margin ? '#' : DENSE[Math.floor(grain * DENSE.length)], c];
  }

  // upperside colour field
  const shimmer = 0.5 + 0.5 * Math.sin(time * 1.6 + t * 4 + d * 3);
  let c;
  if (fore) {
    const irid = mix(UP.cyan, UP.violet, shimmer);
    c = d < 0.16 ? mix(UP.root, irid, d / 0.16)
      : d < 0.62 ? mix(irid, UP.pink, (d - 0.16) / 0.46)
      : mix(UP.pink, UP.coral, (d - 0.62) / 0.24);
    // apex flush of gold near the wing tip
    if (t > 0.5 && t < 0.78 && d > 0.62) c = mix(c, UP.gold, 0.35 * (1 - Math.abs(t - 0.64) / 0.14));
  } else {
    const irid = mix(UP.violet, UP.cyan, shimmer * 0.7);
    c = d < 0.18 ? mix(UP.root, UP.hindBase, d / 0.18)
      : d < 0.7 ? mix(irid, UP.hindMid, (d - 0.18) / 0.52)
      : mix(UP.hindMid, UP.coral, (d - 0.7) / 0.16);
  }
  let ch = (d < 0.5 ? DENSE : MID)[Math.floor(grain * (d < 0.5 ? DENSE.length : MID.length))];

  if (eye >= 0 && eye < 0.13) {
    if (eye < 0.035) return ['@', [80, 230, 255]];        // blue pupil
    if (eye < 0.06) return ['O', [20, 12, 30]];           // black ring
    if (eye < 0.1) return ['o', UP.gold];                 // gold ring
    return ['0', [30, 18, 40]];                           // outer rim
  }
  if (isVein) return [veinChar(ang), [18, 12, 26]];
  if (isDot) return [grain > 0.5 ? '@' : 'o', UP.white];
  if (margin) return ['#', UP.black];
  if (subDot) return ['*', UP.gold];

  c = c.map((v) => Math.min(255, v * (1.0 + grain * 0.28)));
  return [ch, c];
}

function veinChar(ang) {
  const a = ((ang % Math.PI) + Math.PI) % Math.PI; // 0..π
  if (a < 0.39 || a > 2.75) return '-';
  if (a < 1.18) return '\\';
  if (a < 1.96) return '|';
  return '/';
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
    const landingSize = () => Math.min(W * 0.34, 170);

    // the blur is tied to the butterfly: 0 = sharp, 1 = fully out of focus
    const setFocus = (amount) => {
      if (focus) focus.style.opacity = String(Math.max(0, Math.min(1, amount)));
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
      let open; // 0..1 how open the wings are (projected width)
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
        open = 0.1 + 0.9 * Math.abs(Math.cos(S.flap));
        const ahead = bezier(S.from, S.c1, S.c2, S.to, Math.min(1, e + 0.02));
        tilt = Math.max(-0.35, Math.min(0.35, (ahead[0] - pos[0]) * 0.02)) * (1 - t);
        if (t >= 1) { S.phase = 'rest'; S.t0 = now; }
      } else if (S.phase === 'rest') {
        pos = [S.to[0], S.to[1] + Math.sin(el * 1.8) * 4]; // a gentle bob while it rests
        size = landingSize();
        setFocus(1);
        // resting butterflies open and close their wings slowly
        open = 0.62 + 0.38 * (0.5 + 0.5 * Math.cos(el * (Math.PI * 2 / 2.8)));
        if (el >= DUR.rest || S.leaveEarly) leave();
      } else if (S.phase === 'leave') {
        const t = clamp01(el / DUR.leave);
        const e = easeInOut(t);
        pos = bezier(S.from, S.c1, S.c2, S.to, e);
        size = lerp(landingSize(), 40, easeOut(t));
        // …and comes back into focus as it flies away
        setFocus(1 - easeInOut(clamp01(t / 0.85)));
        S.flap += dt * (2 * Math.PI) * lerp(3, 9, t);
        open = 0.1 + 0.9 * Math.abs(Math.cos(S.flap));
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
      const bx = Math.floor((pos[0] - half) / CW) * CW;
      const by = Math.floor((pos[1] - half * 0.95) / CH) * CH;
      const bw = Math.ceil((size + CW * 2) / CW) * CW;
      const bh = Math.ceil((size * 0.95 + CH * 2) / CH) * CH;
      S.bbox = [bx - 2, by - 2, bw + 4, bh + 4];

      // wings past vertical show their underside
      const underside = S.phase !== 'rest' && Math.cos(S.flap) < -0.2;
      const cosT = Math.cos(-tilt);
      const sinT = Math.sin(-tilt);

      ctx.font = `700 ${FONT_PX}px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      for (let py = by; py < by + bh; py += CH) {
        for (let px = bx; px < bx + bw; px += CW) {
          // cell centre → butterfly space (undo tilt, undo wing projection)
          let lx = (px + CW / 2 - pos[0]) / half;
          let ly = (py + CH / 2 - pos[1]) / half;
          const rx = lx * cosT - ly * sinT;
          const ry = lx * sinT + ly * cosT;
          lx = rx; ly = ry;
          const bodyZone = Math.abs(lx) < 0.075;
          const x = bodyZone ? lx : lx / Math.max(0.08, open);
          if (Math.abs(x) > 1.02 || ly < -0.8 || ly > 0.95) continue;
          const hit = sample(x, ly, time, underside && !bodyZone);
          if (!hit) continue;
          const [c, rgb] = hit;
          // folding wings catch less light
          const shade = bodyZone ? 1 : 0.72 + 0.28 * open;
          ctx.fillStyle = `rgb(${rgb[0] * shade | 0},${rgb[1] * shade | 0},${rgb[2] * shade | 0})`;
          ctx.fillText(c, px, py);
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
