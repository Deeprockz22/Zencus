import React, { useEffect, useRef } from 'react';
import { SPECTRUM as S } from './spectrum';
import { gazeOffset } from './gaze';

/*
 * SurrealWorld — the painted room the whole app floats in.
 *
 * Surreal (day): a Magritte afternoon. Pale sky, drifting cumulus, a de Chirico
 * floor running to the horizon, and a handful of objects that should not be
 * floating: the False Mirror eye, a rock carrying a castle, a green apple,
 * a bowler hat, a door that opens onto night, a melting pocket watch.
 * Surreal (night): The Empire of Light — a lit sky above a street that is already
 * night, one lamp burning, and the door now opens onto day.
 *
 * Everything is inline SVG + CSS transforms (no canvas, no WebGL), sits
 * behind the app with pointer-events: none, and freezes under
 * prefers-reduced-motion.
 */

// Theme-family helpers live in src/themeFamilies.js; re-exported here so
// existing imports keep working.
import { baseTheme } from '../../themeFamilies';
export {
  SURREAL_DAY, SURREAL_NIGHT, isSurrealTheme, baseTheme, isNightTheme,
} from '../../themeFamilies';

const Cloud = ({ className, style }) => (
  <svg className={`sw-cloud ${className || ''}`} style={style} viewBox="0 0 320 140" aria-hidden="true">
    <defs>
      <radialGradient id="swCloudFill" cx="45%" cy="30%" r="75%">
        <stop offset="0%" stopColor="var(--sw-cloud-hi)" />
        <stop offset="65%" stopColor="var(--sw-cloud-mid)" />
        <stop offset="100%" stopColor="var(--sw-cloud-lo)" />
      </radialGradient>
    </defs>
    <g fill="url(#swCloudFill)">
      <ellipse cx="160" cy="100" rx="150" ry="34" />
      <circle cx="95" cy="82" r="44" />
      <circle cx="150" cy="60" r="56" />
      <circle cx="212" cy="74" r="46" />
      <circle cx="255" cy="92" r="30" />
      <circle cx="58" cy="100" r="28" />
    </g>
  </svg>
);

const FalseMirrorEye = () => (
  <svg className="sw-eye" viewBox="0 0 300 170" aria-hidden="true">
    <defs>
      <radialGradient id="swIris" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="var(--sw-iris-hi)" />
        <stop offset="100%" stopColor="var(--sw-iris-lo)" />
      </radialGradient>
      <clipPath id="swEyeClip">
        <path d="M10 85 Q150 -25 290 85 Q150 195 10 85 Z" />
      </clipPath>
    </defs>
    <g className="sw-eye-lid">
      <path d="M10 85 Q150 -25 290 85 Q150 195 10 85 Z" fill="var(--sw-sclera)" />
      <g clipPath="url(#swEyeClip)">
        <g className="sw-eye-iris">
          <circle cx="150" cy="85" r="62" fill="url(#swIris)" />
          <g fill="var(--sw-iris-cloud)" opacity="0.92">
            <ellipse cx="128" cy="62" rx="24" ry="9" />
            <ellipse cx="142" cy="57" rx="14" ry="10" />
            <ellipse cx="178" cy="98" rx="22" ry="8" />
            <ellipse cx="188" cy="92" rx="12" ry="9" />
            <ellipse cx="118" cy="112" rx="16" ry="6" />
          </g>
          <circle cx="150" cy="85" r="23" fill="#0b0b10" />
          <circle cx="140" cy="76" r="6" fill="#ffffff" opacity="0.85" />
        </g>
      </g>
      <path d="M10 85 Q150 -25 290 85" fill="none" stroke="var(--sw-ink)" strokeWidth="5" strokeLinecap="round" />
      <path d="M10 85 Q150 195 290 85" fill="none" stroke="var(--sw-ink)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <g stroke="var(--sw-ink)" strokeWidth="3" strokeLinecap="round">
        <path d="M60 46 L48 26" /><path d="M100 26 L94 6" /><path d="M150 20 L150 0" />
        <path d="M200 26 L206 6" /><path d="M240 46 L252 26" />
      </g>
    </g>
  </svg>
);

const CastleRock = () => (
  <svg className="sw-rock" viewBox="0 0 220 240" aria-hidden="true">
    <defs>
      <linearGradient id="swRockFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--sw-rock-hi)" />
        <stop offset="100%" stopColor="var(--sw-rock-lo)" />
      </linearGradient>
    </defs>
    {/* castle */}
    <g fill="var(--sw-castle)">
      <rect x="82" y="30" width="56" height="44" />
      <rect x="70" y="18" width="18" height="56" />
      <rect x="132" y="12" width="18" height="62" />
      <path d="M70 18 l4 -8 l4 8 l4 -8 l4 8 Z" />
      <path d="M132 12 l4 -8 l5 8 l4 -8 l5 8 Z" />
      <rect x="104" y="48" width="10" height="16" fill="var(--sw-window)" />
    </g>
    {/* the rock itself — heavier at the bottom, as a rock should never be in the air */}
    <path
      d="M20 82 Q40 66 110 70 Q185 66 205 88 Q212 120 190 150 Q170 190 132 222 Q112 236 96 220 Q60 190 36 150 Q12 118 20 82 Z"
      fill="url(#swRockFill)"
    />
    <path d="M46 100 Q80 118 72 150 M130 96 Q150 130 128 170 M100 180 Q110 200 104 214" stroke="var(--sw-rock-crack)" strokeWidth="2" fill="none" />
  </svg>
);

const Apple = () => (
  <svg className="sw-apple" viewBox="0 0 100 110" aria-hidden="true">
    <defs>
      <radialGradient id="swAppleFill" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#b9e36a" />
        <stop offset="60%" stopColor="#6aa83a" />
        <stop offset="100%" stopColor="#3f7424" />
      </radialGradient>
    </defs>
    <path d="M50 26 C30 12 6 22 8 52 C10 84 32 104 50 98 C68 104 90 84 92 52 C94 22 70 12 50 26 Z" fill="url(#swAppleFill)" />
    <path d="M50 28 Q52 12 60 4" stroke="#4a3320" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M54 18 Q70 4 84 14 Q70 26 54 18 Z" fill="#4f8f2c" />
    <ellipse cx="32" cy="42" rx="8" ry="12" fill="#ffffff" opacity="0.35" />
  </svg>
);

const BowlerHat = () => (
  <svg className="sw-hat" viewBox="0 0 140 80" aria-hidden="true">
    <ellipse cx="70" cy="64" rx="66" ry="12" fill="#15161b" />
    <path d="M28 64 Q26 10 70 8 Q114 10 112 64 Z" fill="#1d1e25" />
    <path d="M30 52 Q70 60 110 52 L111 60 Q70 68 29 60 Z" fill="#2c2d36" />
    <path d="M44 22 Q56 14 70 13" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const NightDoor = () => (
  <svg className="sw-door" viewBox="0 0 120 220" aria-hidden="true">
    <defs>
      <linearGradient id="swDoorView" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--sw-door-top)" />
        <stop offset="100%" stopColor="var(--sw-door-bottom)" />
      </linearGradient>
    </defs>
    <path d="M10 216 L10 60 Q10 10 60 10 Q110 10 110 60 L110 216 Z" fill="var(--sw-door-frame)" />
    <path d="M18 216 L18 62 Q18 18 60 18 Q102 18 102 62 L102 216 Z" fill="url(#swDoorView)" />
    <g className="sw-door-stars" fill="var(--sw-door-star)">
      <circle cx="38" cy="54" r="1.6" /><circle cx="76" cy="44" r="1.2" /><circle cx="84" cy="92" r="1.5" />
      <circle cx="44" cy="120" r="1.1" /><circle cx="62" cy="80" r="1" /><circle cx="30" cy="160" r="1.3" />
    </g>
    <path className="sw-door-moon" d="M72 64 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24 Z" fill="var(--sw-door-moon)" />
    {/* the door itself, swung open onto the floor */}
    <path d="M102 216 L102 62 L118 70 L118 212 Z" fill="var(--sw-door-leaf)" />
  </svg>
);

const MeltingWatch = () => (
  <svg className="sw-watch" viewBox="0 0 200 150" aria-hidden="true">
    {/* the ledge it drapes over */}
    <rect x="0" y="52" width="120" height="14" rx="2" fill="var(--sw-ledge)" />
    <rect x="0" y="66" width="120" height="70" fill="var(--sw-ledge-side)" />
    <path
      d="M20 52 Q18 26 60 22 Q108 18 126 46 Q134 58 138 80 Q142 104 150 118 Q156 132 146 136 Q134 138 132 118 Q128 92 118 70 Q112 58 100 56 Z"
      fill="var(--sw-watch-case)"
    />
    <path
      d="M28 50 Q28 32 62 29 Q102 26 118 48 Q124 58 128 78 Q131 98 138 114 Q141 124 136 126 Q131 124 128 110 Q122 84 112 64 Q106 54 94 53 Z"
      fill="var(--sw-watch-face)"
    />
    <g stroke="var(--sw-ink)" strokeWidth="2" strokeLinecap="round">
      <path d="M68 40 L70 34" /><path d="M98 38 L102 33" /><path d="M116 60 L122 58" /><path d="M126 90 L132 90" />
      <path d="M72 42 L92 48" /><path d="M72 42 L78 30" />
    </g>
    <circle cx="72" cy="42" r="2.5" fill="var(--sw-ink)" />
    <path d="M40 30 Q36 18 44 12" stroke="var(--sw-watch-case)" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const Lamppost = () => (
  <svg className="sw-lamp" viewBox="0 0 80 260" aria-hidden="true">
    <circle cx="40" cy="30" r="30" fill="var(--sw-lamp-glow)" />
    <rect x="37" y="40" width="6" height="214" fill="#07090f" />
    <path d="M26 40 L54 40 L48 22 L32 22 Z" fill="#0c0f16" />
    <rect x="31" y="26" width="18" height="12" fill="#ffe7a8" />
    <rect x="28" y="250" width="24" height="8" fill="#07090f" />
  </svg>
);

export default function SurrealWorld({ theme }) {
  const rootRef = useRef(null);
  const eyeRef = useRef(null);

  // Tag <html> so the surreal skin only styles the themes it was painted for.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('surreal');
    return () => html.classList.remove('surreal');
  }, []);

  // Gentle pointer parallax (near objects drift more than far ones), and the
  // False Mirror looks at the pointer wherever it goes.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    let last = null;
    const lookAt = (x, y) => {
      const eye = eyeRef.current;
      if (!eye) return;
      const g = x == null ? { x: 0, y: 0 } : gazeOffset(eye.getBoundingClientRect(), x, y);
      eye.style.setProperty('--sw-gx', g.x.toFixed(2));
      eye.style.setProperty('--sw-gy', g.y.toFixed(2));
    };
    const onMove = (e) => {
      last = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = last.clientX / window.innerWidth - 0.5;
        const y = last.clientY / window.innerHeight - 0.5;
        el.style.setProperty('--sw-px', x.toFixed(3));
        el.style.setProperty('--sw-py', y.toFixed(3));
        lookAt(last.clientX, last.clientY);
      });
    };
    // the pointer left the window: the eye drifts back to looking at you
    const onOut = (e) => {
      if (!e.relatedTarget) lookAt(null, null);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    // phones have no hover: a tap draws its gaze too
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      window.removeEventListener('mouseout', onOut);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={`surreal-world sw-${baseTheme(theme)}`} aria-hidden="true">
      <div className="sw-sky" />
      <div className="sw-aurora">
        <span className="sw-blob sw-blob-a" />
        <span className="sw-blob sw-blob-b" />
        <span className="sw-blob sw-blob-c" />
        <span className="sw-blob sw-blob-d" />
      </div>
      <div className="sw-stars" />
      <div className="sw-sun" />
      <div className="sw-synth-sun" />

      <div className="sw-layer sw-far">
        <Cloud className="sw-c1" />
        <Cloud className="sw-c2" />
        <Cloud className="sw-c3" />
      </div>

      <div className="sw-floor">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="swFloorFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sw-floor-far)" />
              <stop offset="100%" stopColor="var(--sw-floor-near)" />
            </linearGradient>
          </defs>
          <rect width="1440" height="300" fill="url(#swFloorFade)" />
          <g stroke="var(--sw-floor-line)" strokeWidth="1.2" fill="none">
            {Array.from({ length: 25 }, (_, i) => {
              const x = -1440 + i * 180;
              return <path key={`v${i}`} d={`M720 0 L${x} 300`} />;
            })}
            {[6, 16, 30, 50, 78, 116, 166, 230].map((y) => (
              <path key={`h${y}`} d={`M0 ${y} L1440 ${y}`} />
            ))}
          </g>
        </svg>
      </div>
      <div className="sw-horizon" />

      <div className="sw-layer sw-mid">
        <div className="sw-obj sw-obj-door"><NightDoor /><span className="sw-cast" /></div>
        <div className="sw-obj sw-obj-lamp"><Lamppost /></div>
        <div className="sw-obj sw-obj-watch"><MeltingWatch /></div>
      </div>

      <div className="sw-layer sw-near">
        <div ref={eyeRef} className="sw-obj sw-obj-eye"><FalseMirrorEye /></div>
        <div className="sw-obj sw-obj-rock"><CastleRock /><span className="sw-drop-shadow" /></div>
        <div className="sw-obj sw-obj-apple"><Apple /></div>
        <div className="sw-obj sw-obj-hat"><BowlerHat /></div>
        <Cloud className="sw-c4" />
      </div>

      <div className="sw-grain" />

      {/* Shared paint: gradients the rest of the app can reference with fill: url(#...) */}
      <svg className="sw-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          {[
            ['srSphere0', S.milkCloud, S.dreamberry, S.deepPlum],
            ['srSphere1', S.solarNectar, S.tangerineDusk, S.dreamberry],
            ['srSphere2', S.milkCloud, S.mintGhost, S.ultraviolet],
            ['srSphere3', S.milkCloud, S.lagoonGlass, S.ultraviolet],
            ['srSphere4', S.orchidHaze, S.ultraviolet, S.nightglass],
          ].map(([id, hi, mid, lo]) => (
            <radialGradient key={id} id={id} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor={hi} />
              <stop offset="45%" stopColor={mid} />
              <stop offset="100%" stopColor={lo} />
            </radialGradient>
          ))}
          <linearGradient id="srVinyl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={S.nightglass} />
            <stop offset="30%" stopColor={S.deepPlum} />
            <stop offset="48%" stopColor="#063a4f" />
            <stop offset="62%" stopColor={S.deepPlum} />
            <stop offset="100%" stopColor={S.nightglass} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
