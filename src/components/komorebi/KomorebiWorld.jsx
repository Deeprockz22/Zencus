import React, { useEffect, useMemo, useRef, useState } from 'react';
import CalicoCat from './CalicoCat';
import Sparrow, { useSparrowVisit } from './Sparrow';

import { drip, startPurr, stopPurr, purrHaptic } from './komorebiAudio';
import { KOMOREBI_NIGHT } from '../../themeFamilies';
import './komorebi-world.css';

/*
 * KomorebiWorld: the room behind the app for the Komorebi theme.
 *
 * A quiet engawa (veranda) with a washi shoji wall, sun coming through a
 * maple outside. The light is the session:
 *   · the patch of sunlight slides across the floorboards with `progress`,
 *     pale gold in the morning and warming to amber as the session ends;
 *   · a calico sleeps in the patch and shuffles along with it, so a glance
 *     tells you how far in you are, with no numbers;
 *   · when a focus session ends she wakes and does the long downward
 *     stretch (no chime), then sits in a loaf by the teacup for the break,
 *     purring if sound is on (and a haptic purr on Android phones);
 *   · every short break, she reminds you to drink some water;
 *   · during a running focus session, a drop falls from the bamboo spout
 *     into the stone basin every 6–14 s: a suikinkutsu note and a ripple.
 * Komorebi Night (Obsidian) is the same room by moonlight.
 *
 * Everything is DOM/SVG with a seeded layout; only transforms and opacity
 * animate, and all motion stops under prefers-reduced-motion.
 */


// seeded PRNG so the canopy never reshuffles between renders
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Clumps of maple leaves whose blurred shadows fall across the room. */
function Canopy({ seed, count, spread }) {
  const leaves = useMemo(() => {
    const r = rng(seed);
    const clumps = Array.from({ length: 7 }, () => ({ x: r() * 1600, y: r() * 900 * spread }));
    return Array.from({ length: count }, () => {
      const c = clumps[Math.floor(r() * clumps.length)];
      return {
        x: c.x + (r() - 0.5) * 260,
        y: c.y + (r() - 0.5) * 180,
        s: 10 + r() * 22,
        a: r() * 360,
      };
    });
  }, [seed, count, spread]);
  return (
    <svg className="kw-canopy-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      {leaves.map((l, i) => (
        // a five-lobed maple leaf, drawn as overlapping ellipses
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.a.toFixed(0)}) scale(${(l.s / 20).toFixed(2)})`}>
          <ellipse rx="6" ry="16" />
          <ellipse rx="5" ry="13" transform="rotate(58)" />
          <ellipse rx="5" ry="13" transform="rotate(-58)" />
          <ellipse rx="4" ry="9" transform="rotate(118)" />
          <ellipse rx="4" ry="9" transform="rotate(-118)" />
        </g>
      ))}
    </svg>
  );
}

function Room() {
  const planks = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className="kw-room" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="kwWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="kw-wall-top" />
          <stop offset="1" className="kw-wall-bottom" />
        </linearGradient>
        <linearGradient id="kwFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="kw-floor-far" />
          <stop offset="1" className="kw-floor-near" />
        </linearGradient>
      </defs>
      {/* washi shoji wall */}
      <rect width="1600" height="560" fill="url(#kwWall)" />
      <g className="kw-shoji">
        {Array.from({ length: 17 }, (_, i) => (
          <rect key={`v${i}`} x={i * 100 - 2} y="0" width="4" height="540" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={`h${i}`} x="0" y={i * 96 + 40} width="1600" height="3" />
        ))}
        <rect className="kw-shoji-rail" x="0" y="536" width="1600" height="14" />
      </g>
      {/* engawa floorboards, receding a little toward the wall */}
      <rect y="550" width="1600" height="350" fill="url(#kwFloor)" />
      <g className="kw-planks">
        {planks.map((i) => {
          const y = 550 + Math.pow(i / 8, 1.35) * 350;
          return <line key={i} x1="0" x2="1600" y1={y} y2={y} />;
        })}
        {/* staggered butt joints */}
        {planks.slice(0, 8).map((i) => {
          const y0 = 550 + Math.pow(i / 8, 1.35) * 350;
          const y1 = 550 + Math.pow((i + 1) / 8, 1.35) * 350;
          const x = ((i * 523) % 1400) + 100;
          return <line key={`j${i}`} x1={x} x2={x} y1={y0} y2={y1} />;
        })}
      </g>
      <rect className="kw-floor-edge" y="890" width="1600" height="10" />
    </svg>
  );
}

function Basin({ drops, stones = 0, sparrow = null }) {
  const stoneList = useMemo(() => {
    const count = Math.min(stones, 7);
    const coords = [
      { cx: 32, cy: 162, rx: 7, ry: 4, a: -12 },
      { cx: 48, cy: 165, rx: 9, ry: 5, a: 8 },
      { cx: 168, cy: 162, rx: 8, ry: 4.5, a: -6 },
      { cx: 186, cy: 164, rx: 10, ry: 5.5, a: 14 },
      { cx: 202, cy: 166, rx: 7, ry: 4, a: -18 },
      { cx: 62, cy: 167, rx: 6, ry: 3.5, a: 4 },
      { cx: 154, cy: 166, rx: 7, ry: 4, a: -5 }
    ];
    return coords.slice(0, count);
  }, [stones]);

  return (
    <div className="kw-basin">
      <svg viewBox="0 0 220 170" aria-hidden="true">
        {/* bamboo spout (kakei) */}
        <g className="kw-kakei">
          <rect x="96" y="0" width="12" height="46" rx="3" />
          <rect x="60" y="34" width="84" height="12" rx="6" />
          <rect x="60" y="34" width="84" height="3" className="kw-kakei-hi" />
          <line x1="80" y1="34" x2="80" y2="46" />
          <line x1="124" y1="34" x2="124" y2="46" />
        </g>
        {/* stone basin (tsukubai) */}
        <path className="kw-stone" d="M18 118 Q14 86 46 80 Q110 70 176 80 Q206 88 202 118 Q198 152 150 160 Q100 166 58 158 Q20 150 18 118 Z" />
        <path className="kw-stone-hi" d="M40 90 Q110 76 186 90" />
        <ellipse className="kw-water" cx="110" cy="96" rx="66" ry="12" />
        {drops > 0 && (
          <g key={drops}>
            <ellipse className="kw-drop" cx="66" cy="50" rx="2.6" ry="3.6" />
            <ellipse className="kw-ripple" cx="66" cy="96" rx="12" ry="2.4" />
            <ellipse className="kw-ripple kw-ripple-2" cx="66" cy="96" rx="12" ry="2.4" />
          </g>
        )}
        {/* moss at the foot */}
        <path className="kw-moss" d="M10 160 Q40 146 70 158 Q110 148 150 160 Q190 150 214 162 L214 170 L10 170 Z" />
        {/* Garden permanence river stones (#23) */}
        {stoneList.map((st, i) => (
          <ellipse
            key={i}
            className="kw-garden-stone"
            cx={st.cx}
            cy={st.cy}
            rx={st.rx}
            ry={st.ry}
            transform={`rotate(${st.a} ${st.cx} ${st.cy})`}
          />
        ))}
      </svg>
      <Sparrow phase={sparrow} />
    </div>
  );
}

function Teacup() {
  return (
    <svg className="kw-teacup" viewBox="0 0 60 50" aria-hidden="true">
      <g className="kw-steam">
        <path d="M24 16 Q20 10 25 5 Q29 0 25 -6" />
        <path d="M34 16 Q30 9 35 4 Q39 -1 35 -7" />
      </g>
      <ellipse cx="30" cy="46" rx="22" ry="3.5" className="kw-cup-shadow" />
      <path className="kw-cup" d="M10 20 L50 20 Q48 44 30 45 Q12 44 10 20 Z" />
      <ellipse className="kw-tea" cx="30" cy="20" rx="20" ry="4" />
      <path className="kw-cup-glaze" d="M12 28 Q30 33 48 28" />
    </svg>
  );
}

const STRETCH_MS = 4200;

/** Her break-time reminder: a small speech bubble. */
function DrinkWater() {
  return (
    <div className="kw-say">
      <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M6 1 C6 1 1 7.5 1 10.5 A5 5 0 0 0 11 10.5 C11 7.5 6 1 6 1 Z" /></svg>
      <span>Drink water</span>
    </div>
  );
}

export default function KomorebiWorld({
  theme,
  progress = 0,
  mode = 'work',
  isRunning = false,
  sessionsCompleted = 0,
  soundEnabled = false,
  gardenProgress = { stones: 0 },
}) {
  const [drops, setDrops] = useState(0);
  const [stretching, setStretching] = useState(false);
  const prevSessions = useRef(sessionsCompleted);
  const reduced = typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Tag <html> so the Komorebi skin only styles its own two variants.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('komorebi');
    return () => html.classList.remove('komorebi');
  }, []);

  // A finished focus session: she wakes and stretches instead of a chime.
  useEffect(() => {
    if (sessionsCompleted > prevSessions.current) {
      setStretching(true);
      purrHaptic();
      const t = setTimeout(() => setStretching(false), STRETCH_MS);
      prevSessions.current = sessionsCompleted;
      return () => clearTimeout(t);
    }
    prevSessions.current = sessionsCompleted;
    return undefined;
  }, [sessionsCompleted]);

  // Suikinkutsu: a drop every 6–14 s while a focus session runs.
  const focusing = mode === 'work' && isRunning;
  useEffect(() => {
    if (!focusing) return undefined;
    let timer;
    let soundTimer;
    const schedule = () => {
      timer = setTimeout(() => {
        setDrops((n) => n + 1);
        // the note sounds as the drop meets the water
        if (soundEnabled) soundTimer = setTimeout(() => drip(), reduced ? 0 : 320);
        schedule();
      }, 6000 + Math.random() * 8000);
    };
    schedule();
    return () => { clearTimeout(timer); clearTimeout(soundTimer); };
  }, [focusing, soundEnabled, reduced]);

  // Her purr: only in a running break, only with sound on.
  const onBreak = mode !== 'work';
  const purring = onBreak && isRunning && soundEnabled && !stretching;
  useEffect(() => {
    if (!purring) return undefined;
    const t = setTimeout(() => startPurr(), 1200);
    return () => { clearTimeout(t); stopPurr(); };
  }, [purring]);

  // Once a day, while the room is idle, a sparrow comes to drink (#26).
  const sparrow = useSparrowVisit(!isRunning);

  // Break keeps the late-afternoon light; a new session starts at morning.
  const sun = onBreak ? 1 : Math.min(1, Math.max(0, progress || 0));
  const pose = stretching ? 'stretch' : onBreak ? 'awake' : 'asleep';
  const night = theme === KOMOREBI_NIGHT;

  return (
    <div
      className={`komorebi-world ${night ? 'kw-night' : 'kw-day'} ${onBreak ? 'kw-break' : 'kw-focus'}`}
      style={{ '--kw-sun': sun.toFixed(4) }}
      data-pose={pose}
      aria-hidden="true"
    >
      <Room />
      {/* the patch of light from the window, with the shoji lattice in it */}
      <div className="kw-sunpatch">
        <div className="kw-dapples" />
      </div>
      <div className="kw-shaft" />
      {/* leaf shadows: far (soft), mid, near (sharper), each swaying on its own */}
      <div className="kw-canopy kw-canopy-far"><Canopy seed={11} count={70} spread={0.9} /></div>
      <div className="kw-canopy kw-canopy-mid"><Canopy seed={29} count={55} spread={0.7} /></div>
      <div className="kw-canopy kw-canopy-near"><Canopy seed={47} count={30} spread={0.45} /></div>
      <Basin drops={drops} stones={gardenProgress?.stones || 0} sparrow={sparrow} />
      <div className="kw-cat-track">
        <div className="kw-cat">
          {mode === 'shortBreak' && !stretching && <DrinkWater />}
          <CalicoCat pose={pose} />
          <Teacup />
        </div>
      </div>
      <div className="kw-motes" />
      <div className="kw-vignette" />
      <div className="kw-grain" />
    </div>
  );
}
