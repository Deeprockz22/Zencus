import React, { useEffect, useMemo, useRef } from 'react';
import { LANTERN as L } from './lanternPalette';
import { LANTERN_NIGHT } from '../../themeFamilies';

/*
 * LanternWorld — the painted garden behind the app for the Lantern theme.
 *
 * Mist (day): a lavender forest in fog. Layers of trunks fade into the mist,
 * a crescent moon hangs over a winding path, and a greenhouse glows peach
 * from inside while fireflies drift around it.
 *
 * Sakura (night): a starry indigo sky full of cyan spirit-lights, blossom
 * canopies framing the top, paper lanterns swaying on their strings, and a
 * lantern-lit stone path running to a torii gate. Petals fall.
 *
 * Details borrowed from the Design Prompts library (DESIGN_RESOURCES.md):
 *   · Botanical/Organic: a paper-grain overlay (the "non-negotiable" texture),
 *     meandering 1px vines, slow honey-like motion (500–700ms, ease-out).
 *   · Modern Dark: layered ambient light pools that drift, a spotlight that
 *     follows the cursor, depth from light rather than hard shadows.
 * Plus: three-depth pointer parallax, lanterns that flicker like real flame,
 * shooting stars, dew glints on the path, light shafts through the mist.
 *
 * Everything is inline SVG with a deterministic layout (seeded, so it never
 * reshuffles between renders); only small groups animate, with CSS
 * transforms, and all motion stops under prefers-reduced-motion.
 */

// small seeded PRNG so the painting is identical on every render
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const W = 1600;
const H = 900;

function Moon({ cx, cy, r, sky }) {
  return (
    <g className="lw-moon">
      <circle cx={cx} cy={cy} r={r * 3.2} fill="url(#lwMoonHalo)" />
      <mask id={`lwCrescent-${cx}`}>
        <rect x={cx - r - 2} y={cy - r - 2} width={r * 2 + 4} height={r * 2 + 4} fill="#fff" />
        <circle cx={cx + r * 0.45} cy={cy - r * 0.25} r={r * 0.92} fill="#000" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill={L.moonWhite} mask={`url(#lwCrescent-${cx})`} />
      {sky && <circle cx={cx} cy={cy} r={r} fill="none" />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Sakura (night)                                                      */
/* ------------------------------------------------------------------ */
function SakuraScene() {
  const { stars, canopyL, canopyR, petalsL, petalsR, orbs, petals, flies } = useMemo(() => {
    const r = rng(7);
    const stars = Array.from({ length: 150 }, () => ({
      x: r() * W, y: r() * 470, s: 0.6 + r() * 1.9, d: -r() * 6, g: Math.floor(r() * 3),
    }));
    // blossom clusters hug the two top corners, rim-lit from the lanterns below
    const cluster = (cx, cy, rx, ry, n, seed) => {
      const q = rng(seed);
      return Array.from({ length: n }, () => {
        const a = q() * Math.PI * 2;
        const d = Math.sqrt(q());
        return {
          x: cx + Math.cos(a) * rx * d,
          y: cy + Math.sin(a) * ry * d,
          rad: 16 + q() * 40,
          tone: Math.floor(q() * 4),
        };
      }).sort((a, b) => a.y - b.y);
    };
    const canopyL = [...cluster(230, 120, 430, 240, 170, 11), ...cluster(520, 330, 230, 125, 60, 12)];
    const canopyR = [...cluster(1390, 110, 440, 240, 175, 21), ...cluster(1120, 360, 210, 115, 55, 22)];
    // individual lit petals scattered over the clumps (the anime-painting texture)
    const speckle = (list, seed) => {
      const q = rng(seed);
      return list.flatMap((c) => Array.from({ length: 3 }, () => ({
        x: c.x + (q() - 0.5) * c.rad * 1.5,
        y: c.y + (q() - 0.6) * c.rad * 1.2,
        r: 1.2 + q() * 2.6,
        lit: q() > 0.45,
      })));
    };
    const petalsL = speckle(canopyL, 13);
    const petalsR = speckle(canopyR, 23);
    const orbs = Array.from({ length: 18 }, () => ({
      x: 200 + r() * 1200, y: 480 + r() * 380, s: 5 + r() * 12, d: -r() * 14, dur: 10 + r() * 10,
    }));
    const petals = Array.from({ length: 22 }, () => ({
      x: r() * W, d: -r() * 18, dur: 12 + r() * 12, s: 0.6 + r() * 0.9, sway: 40 + r() * 120,
    }));
    const flies = Array.from({ length: 26 }, () => ({
      x: 380 + r() * 840, y: 700 + r() * 190, d: -r() * 4, s: 1.4 + r() * 2.2,
    }));
    return { stars, canopyL, canopyR, petalsL, petalsR, orbs, petals, flies };
  }, []);

  const blossomFill = (t) => `url(#lwBlossom${t})`;

  return (
    <svg className="lw-svg lw-sakura" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lwSkyNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={L.inkNight} />
          <stop offset="34%" stopColor={L.indigo} />
          <stop offset="60%" stopColor={L.violet} />
          <stop offset="80%" stopColor={L.plum} />
          <stop offset="100%" stopColor={L.horizonRose} />
        </linearGradient>
        <radialGradient id="lwNebula" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={L.spiritDeep} stopOpacity="0.55" />
          <stop offset="60%" stopColor={L.spiritDeep} stopOpacity="0.12" />
          <stop offset="100%" stopColor={L.spiritDeep} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lwMoonHalo">
          <stop offset="0%" stopColor="#dfe6ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
        {[
          [L.blossomLight, L.blossom, L.blossomDeep],
          [L.coral, L.blossom, L.blossomDeep],
          ['#ffd0e2', L.blossomLight, L.blossom],
          [L.blossom, L.blossomDeep, '#7a2a6e'],
        ].map(([a, b, c], i) => (
          <radialGradient key={i} id={`lwBlossom${i}`} cx="45%" cy="62%" r="70%">
            <stop offset="0%" stopColor={a} />
            <stop offset="55%" stopColor={b} />
            <stop offset="100%" stopColor={c} />
          </radialGradient>
        ))}
        <radialGradient id="lwLanternGlow">
          <stop offset="0%" stopColor={L.lanternGold} stopOpacity="0.75" />
          <stop offset="45%" stopColor={L.lanternGold} stopOpacity="0.22" />
          <stop offset="100%" stopColor={L.lanternGold} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lwLanternBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={L.lanternEdge} />
          <stop offset="35%" stopColor={L.lanternGold} />
          <stop offset="55%" stopColor={L.lanternCore} />
          <stop offset="75%" stopColor={L.lanternGold} />
          <stop offset="100%" stopColor={L.lanternEdge} />
        </linearGradient>
        <linearGradient id="lwPath" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f7c07a" />
          <stop offset="45%" stopColor="#c9806e" />
          <stop offset="100%" stopColor="#5a2f6e" />
        </linearGradient>
        <radialGradient id="lwGateGlow">
          <stop offset="0%" stopColor="#ffd6f0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd6f0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lwOrb">
          <stop offset="0%" stopColor="#eaffff" />
          <stop offset="35%" stopColor={L.spirit} stopOpacity="0.9" />
          <stop offset="100%" stopColor={L.spirit} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lwStreak" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#aef6ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lwGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b1650" />
          <stop offset="100%" stopColor="#120a2c" />
        </linearGradient>
      </defs>

      {/* sky, nebula, stars, moon (the far layer barely moves) */}
      <rect width={W} height={H} fill="url(#lwSkyNight)" />
      <g className="lw-layer-far">
      <ellipse cx="820" cy="250" rx="520" ry="230" fill="url(#lwNebula)" />
      <ellipse cx="1020" cy="330" rx="260" ry="140" fill="url(#lwNebula)" />
      {[0, 1, 2].map((g) => (
        <g key={g} className={`lw-stars lw-stars-${g}`}>
          {stars.filter((s) => s.g === g).map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={i % 7 === 0 ? '#aef6ff' : '#ffffff'} />
          ))}
        </g>
      ))}
      <Moon cx={930} cy={170} r={24} />
      {/* shooting stars: a streak every so often, never two at once */}
      {[{ x: 520, y: 90, d: -2 }, { x: 1180, y: 60, d: -9 }].map((st, i) => (
        <g key={i} className="lw-shooting" style={{ animationDelay: `${st.d}s` }}>
          <line x1={st.x} y1={st.y} x2={st.x - 120} y2={st.y - 36} stroke="url(#lwStreak)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ))}
      </g>

      {/* horizon: the torii at the end of the path, glowing pink */}
      <ellipse cx="800" cy="610" rx="260" ry="120" fill="url(#lwGateGlow)" />
      <g fill="#3a1d52">
        <rect x="738" y="560" width="10" height="70" />
        <rect x="852" y="560" width="10" height="70" />
        <path d="M712 552 Q800 540 888 552 L884 562 Q800 552 716 562 Z" />
        <rect x="728" y="572" width="144" height="7" />
      </g>

      {/* ground and the lantern-lit stone path */}
      <path d={`M0 640 Q400 600 800 612 Q1200 600 ${W} 640 L${W} ${H} L0 ${H} Z`} fill="url(#lwGround)" />
      <path d="M770 612 L830 612 L1180 900 L420 900 Z" fill="url(#lwPath)" />
      <g stroke="#2b1650" strokeOpacity="0.35" strokeWidth="2">
        {[640, 672, 712, 762, 824, 896].map((y, i) => {
          const t = (y - 612) / 288;
          const l = 770 - t * 350;
          const rr = 830 + t * 350;
          return <line key={i} x1={l} y1={y} x2={rr} y2={y} />;
        })}
      </g>

      {/* dew glints on the stones catch the lantern light */}
      <g className="lw-dew">
        {[[720, 700], [868, 730], [640, 790], [955, 812], [770, 860], [560, 870], [1040, 878]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#fff6d8" style={{ animationDelay: `${-i * 0.9}s` }} />
        ))}
      </g>

      <g className="lw-layer-mid">
      {/* fences along the path */}
      <g fill="#3d2446">
        {[[300, 700, 90], [420, 690, 70], [520, 668, 56], [1080, 668, 56], [1180, 690, 70], [1300, 700, 90]].map(([x, y, h], i) => (
          <rect key={i} x={x} y={y} width="10" height={h} rx="2" />
        ))}
        <path d="M290 712 L540 676 L540 682 L290 720 Z" />
        <path d="M1310 712 L1060 676 L1060 682 L1310 720 Z" />
      </g>

      {/* trunks rising into the canopies */}
      <g fill={L.bark}>
        <path d="M60 900 C120 700 140 520 220 360 C250 300 330 250 420 230 L430 250 C340 280 280 330 250 400 C200 520 190 700 170 900 Z" />
        <path d="M1540 900 C1480 700 1460 520 1380 360 C1350 300 1270 250 1180 230 L1170 250 C1260 280 1320 330 1350 400 C1400 520 1410 700 1430 900 Z" />
        <path d="M230 380 C330 340 420 350 520 330 L522 342 C430 362 340 360 240 400 Z" />
        <path d="M1370 380 C1270 340 1180 350 1080 330 L1078 342 C1170 362 1260 360 1360 400 Z" />
      </g>

      {/* blossom canopies: a shadowed underside, clumps rim-lit from below, lit petals on top */}
      {[[canopyL, petalsL, 'left'], [canopyR, petalsR, 'right']].map(([clumps, specks, side]) => (
        <g key={side} className={`lw-canopy lw-canopy-${side}`}>
          <g fill="#5a1d5e" opacity="0.55">
            {clumps.map((c, i) => <circle key={i} cx={c.x + 6} cy={c.y + 10} r={c.rad} />)}
          </g>
          {clumps.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.rad} fill={blossomFill(c.tone)} />)}
          <g>
            {specks.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.lit ? '#ffe3ef' : L.blossomDeep} opacity={p.lit ? 0.9 : 0.55} />
            ))}
          </g>
        </g>
      ))}

      </g>

      <g className="lw-layer-near">
      {/* paper lanterns on their strings */}
      {[
        { x: 470, top: 300, len: 150, s: 1, d: 0 },
        { x: 1215, top: 290, len: 110, s: 1.15, d: -1.4 },
        { x: 1030, top: 400, len: 150, s: 0.62, d: -2.3 },
        { x: 250, top: 420, len: 150, s: 0.72, d: -0.8 },
      ].map((l, i) => (
        <g key={i} className="lw-lantern" style={{ transformOrigin: `${l.x}px ${l.top}px`, animationDelay: `${l.d}s` }}>
          <line x1={l.x} y1={l.top} x2={l.x} y2={l.top + l.len} stroke="#2a1030" strokeWidth="2" />
          <g transform={`translate(${l.x} ${l.top + l.len}) scale(${l.s})`}>
            <circle r="120" cy="42" fill="url(#lwLanternGlow)" className="lw-lantern-glow" style={{ animationDelay: `${l.d * 1.7}s` }} />
            <rect x="-20" y="0" width="40" height="8" rx="2" fill="#3a1a1a" />
            <path d="M-30 8 Q-40 42 -30 76 L30 76 Q40 42 30 8 Z" fill="url(#lwLanternBody)" />
            {[20, 32, 44, 56, 66].map((y) => (
              <path key={y} d={`M-34 ${y} Q0 ${y + 3} 34 ${y}`} stroke="#b0561f" strokeOpacity="0.45" strokeWidth="1.4" fill="none" />
            ))}
            <rect x="-20" y="76" width="40" height="8" rx="2" fill="#3a1a1a" />
            <line x1="0" y1="84" x2="0" y2="102" stroke="#c0392b" strokeWidth="3" />
          </g>
        </g>
      ))}

      </g>

      {/* spirit-lights rising */}
      <g className="lw-orbs">
        {orbs.map((o, i) => (
          <circle key={i} className="lw-orb" cx={o.x} cy={o.y} r={o.s} fill="url(#lwOrb)"
            style={{ animationDelay: `${o.d}s`, animationDuration: `${o.dur}s` }} />
        ))}
      </g>

      {/* fireflies over the path */}
      <g className="lw-flies">
        {flies.map((f, i) => (
          <circle key={i} className="lw-fly" cx={f.x} cy={f.y} r={f.s} fill={L.firefly}
            style={{ animationDelay: `${f.d}s` }} />
        ))}
      </g>

      {/* falling petals */}
      <g className="lw-petals">
        {petals.map((p, i) => (
          <ellipse key={i} className="lw-petal" cx={p.x} cy="-20" rx={7 * p.s} ry={4 * p.s} fill={i % 3 ? L.blossomLight : L.blossom}
            style={{ animationDelay: `${p.d}s`, animationDuration: `${p.dur}s`, '--sway': `${p.sway}px` }} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mist (day)                                                          */
/* ------------------------------------------------------------------ */
function MistScene() {
  const { far, mid, flies, leaves } = useMemo(() => {
    const r = rng(33);
    const trunks = (n, minW, maxW) => Array.from({ length: n }, () => ({
      x: r() * W, w: minW + r() * (maxW - minW), lean: (r() - 0.5) * 40,
    }));
    const flies = Array.from({ length: 34 }, () => ({
      x: 300 + r() * 1250, y: 380 + r() * 480, s: 1.5 + r() * 2.6, d: -r() * 5, pink: r() > 0.4,
    }));
    // clumps of pointed leaves along the bottom, fanning upward
    const leaves = Array.from({ length: 150 }, () => ({
      x: r() * W, y: 770 + r() * 150, len: 26 + r() * 46, rot: -70 + r() * 140, tone: r(),
    }));
    return { far: trunks(26, 8, 18), mid: trunks(12, 18, 34), flies, leaves };
  }, []);

  return (
    <svg className="lw-svg lw-mist" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lwSkyMist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={L.mistTop} />
          <stop offset="55%" stopColor={L.mist} />
          <stop offset="100%" stopColor={L.mistLow} />
        </linearGradient>
        <radialGradient id="lwMoonHalo">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lwHouseGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ffe6c8" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffc2a8" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#f3a6c8" stopOpacity="0.25" />
          <stop offset="100%" stopColor={L.peachGlow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lwPane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e6ff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#fff1dc" />
          <stop offset="75%" stopColor="#ffc9a3" />
          <stop offset="100%" stopColor="#f59fb8" />
        </linearGradient>
        <linearGradient id="lwMistPath" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#b9aef0" />
          <stop offset="60%" stopColor="#d9d0fb" />
          <stop offset="100%" stopColor="#fbe9ea" />
        </linearGradient>
        <linearGradient id="lwRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lwFog" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#lwSkyMist)" />
      <Moon cx={600} cy={210} r={26} />
      {/* light shafts slanting from the moon through the trees */}
      <g className="lw-rays">
        {[[560, 170], [640, 120], [720, 150], [480, 110]].map(([w, x], i) => (
          <path key={i} d={`M${600 + x - 80} 180 L${600 + x} 180 L${600 + x + w} ${H} L${600 + x + w - 180} ${H} Z`} fill="url(#lwRay)" style={{ animationDelay: `${-i * 2.3}s` }} />
        ))}
      </g>

      {/* far trees dissolve into the mist */}
      <g className="lw-layer-far" fill={L.treeFar} opacity="0.65">
        {far.map((t, i) => (
          <path key={i} d={`M${t.x} ${H} L${t.x + t.lean} 0 L${t.x + t.lean + t.w} 0 L${t.x + t.w} ${H} Z`} />
        ))}
      </g>
      <rect className="lw-fog lw-fog-1" x="-400" y="300" width="2400" height="260" fill="url(#lwFog)" />
      <g className="lw-layer-mid" fill={L.treeMid} opacity="0.8">
        {mid.map((t, i) => (
          <path key={i} d={`M${t.x} ${H} L${t.x + t.lean} 0 L${t.x + t.lean + t.w} 0 L${t.x + t.w} ${H} Z`} />
        ))}
      </g>

      {/* the greenhouse, glowing from inside */}
      <g className="lw-house">
        <ellipse cx="1250" cy="590" rx="520" ry="330" fill="url(#lwHouseGlow)" className="lw-house-glow" />
        <path d="M1030 700 L1030 520 L1180 420 L1330 420 L1470 520 L1470 700 Z" fill="url(#lwPane)" />
        <path d="M1030 520 L1180 420 L1330 420 L1470 520" fill="none" stroke={L.glassFrame} strokeWidth="6" />
        <g stroke={L.glassFrame} strokeWidth="3" fill="none">
          <rect x="1030" y="520" width="440" height="180" />
          {[1080, 1130, 1180, 1230, 1280, 1330, 1380, 1430].map((x) => <line key={x} x1={x} y1="520" x2={x} y2="700" />)}
          <line x1="1030" y1="580" x2="1470" y2="580" />
          <line x1="1030" y1="640" x2="1470" y2="640" />
          {[1210, 1250, 1290].map((x) => <line key={x} x1={x} y1="420" x2={x - 60} y2="520" />)}
          {[1360, 1400].map((x) => <line key={x} x1={x - 30} y1="420" x2={x} y2="520" />)}
        </g>
        {/* vines */}
        <g fill={L.treeNear} opacity="0.85">
          {[[1060, 470, 34], [1100, 440, 26], [1150, 425, 22], [1440, 505, 30], [1470, 560, 26], [1040, 610, 22], [1300, 700, 30]].map(([x, y, rr], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.6} />
          ))}
        </g>
      </g>

      {/* the winding path */}
      <path d="M380 900 C520 820 700 800 820 760 C960 715 1100 720 1190 700 L1230 700 C1120 735 980 745 870 790 C740 840 640 870 600 900 Z" fill="url(#lwMistPath)" opacity="0.92" />

      <rect className="lw-fog lw-fog-2" x="-600" y="560" width="2600" height="220" fill="url(#lwFog)" />

      {/* near trunks frame the scene */}
      <g className="lw-layer-near">
      <g fill={L.treeDeep}>
        <path d="M40 900 L70 0 L120 0 L130 900 Z" />
        <path d="M190 900 L230 0 L262 0 L258 900 Z" />
        <path d="M1500 900 L1520 0 L1560 0 L1570 900 Z" />
      </g>
      <g stroke={L.treeDeep} strokeWidth="6" fill="none" opacity="0.8">
        <path d="M110 260 C200 210 260 190 330 120" />
        <path d="M250 330 C330 300 400 260 460 180" />
        <path d="M1520 300 C1450 250 1400 210 1360 140" />
      </g>

      {/* fine vines trailing from the canopy: 1px, meandering, with tiny leaves */}
      <g className="lw-vines" stroke={L.treeDeep} strokeWidth="1.2" fill="none" opacity="0.75">
        {[[300, 0, 260], [420, 0, 180], [1380, 0, 240], [1460, 0, 320], [980, 0, 140]].map(([x, y, len], i) => (
          <g key={i} className="lw-vine" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-i * 1.3}s` }}>
            <path d={`M${x} ${y} C${x + 18} ${y + len * 0.3} ${x - 20} ${y + len * 0.6} ${x + 6} ${y + len}`} />
            {[0.25, 0.45, 0.65, 0.85].map((t) => (
              <ellipse key={t} cx={x + (t % 0.5 ? 7 : -7)} cy={y + len * t} rx="5" ry="2.6" fill={L.treeNear} stroke="none"
                transform={`rotate(${t % 0.5 ? 30 : -30} ${x} ${y + len * t})`} />
            ))}
          </g>
        ))}
      </g>
      </g>

      {/* foreground foliage */}
      <g>
        {leaves.map((l, i) => (
          <path key={i}
            d={`M0 0 C${l.len * 0.35} ${-l.len * 0.28} ${l.len * 0.75} ${-l.len * 0.2} ${l.len} 0 C${l.len * 0.75} ${l.len * 0.2} ${l.len * 0.35} ${l.len * 0.28} 0 0 Z`}
            transform={`translate(${l.x} ${l.y}) rotate(${l.rot - 90})`}
            fill={l.tone > 0.66 ? L.treeDeep : l.tone > 0.33 ? L.treeNear : L.treeMid}
            opacity={0.78 + l.tone * 0.2} />
        ))}
      </g>

      {/* fireflies */}
      <g className="lw-flies">
        {flies.map((f, i) => (
          <circle key={i} className="lw-fly" cx={f.x} cy={f.y} r={f.s} fill={f.pink ? '#ffd6f5' : '#fffbe0'}
            style={{ animationDelay: `${f.d}s` }} />
        ))}
      </g>
    </svg>
  );
}

export default function LanternWorld({ theme }) {
  const rootRef = useRef(null);

  // Tag <html> so the Lantern skin only styles its own two variants.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('lantern');
    return () => html.classList.remove('lantern');
  }, []);

  // Pointer: a little parallax between the three depths, and a soft lantern
  // light that follows the cursor through the garden (Modern Dark's
  // mouse-tracking spotlight, re-lit as your own paper lantern).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty('--lw-px', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty('--lw-py', (e.clientY / window.innerHeight - 0.5).toFixed(3));
        el.style.setProperty('--lw-cx', `${e.clientX}px`);
        el.style.setProperty('--lw-cy', `${e.clientY}px`);
        el.classList.add('has-pointer');
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const night = theme === LANTERN_NIGHT;
  return (
    <div ref={rootRef} className={`lantern-world ${night ? 'lw-night' : 'lw-day'}`} aria-hidden="true">
      {night ? <SakuraScene /> : <MistScene />}
      {/* ambient light pools drifting slowly over the scene */}
      <div className="lw-pool lw-pool-a" />
      <div className="lw-pool lw-pool-b" />
      <div className="lw-pool lw-pool-c" />
      <div className="lw-cursor-light" />
      <div className="lw-vignette" />
      <div className="lw-grain" />
    </div>
  );
}
