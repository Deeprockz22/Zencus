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
 * 2.5D: the stage and the clouds are Blender renders in depth layers; the
 * objects are inline SVG. All motion is CSS transforms (no canvas, no
 * WebGL); it sits behind the app with pointer-events: none, and freezes
 * under prefers-reduced-motion.
 */

// Theme-family helpers live in src/themeFamilies.js; re-exported here so
// existing imports keep working.
import { baseTheme } from '../../themeFamilies';
export {
  SURREAL_DAY, SURREAL_NIGHT, isSurrealTheme, baseTheme, isNightTheme,
} from '../../themeFamilies';

// Volumetric cumulus rendered in Blender (resources/blender/surreal-stage.blend),
// one sprite per cloud and per light; CSS drifts them across the sky.
const CLOUDS = import.meta.glob('./plates/cloud-*.webp', { eager: true, import: 'default' });
const cloudSrc = (key, night) => CLOUDS[`./plates/cloud-${key}-${night ? 'night' : 'day'}.webp`];

const Cloud = ({ className, cloud, night }) => (
  <img className={`sw-cloud ${className || ''}`} src={cloudSrc(cloud, night)} alt="" draggable="false" />
);

// The objects are Blender renders too (resources/blender/surreal-objects.blend):
// real models, lit like the room, laid out as 2.5D sprites at their depths.
const OBJ = import.meta.glob('./objects/*.webp', { eager: true, import: 'default' });
const SUNS = import.meta.glob('./plates/sun-*.webp', { eager: true, import: 'default' });
const obj = (name) => OBJ[`./objects/${name}.webp`];
const Sprite = ({ name, className }) => (
  <img className={className} src={obj(name)} alt="" draggable="false" />
);

// The False Mirror as three layers: the eyeball (only its almond opening),
// the sky-filled iris, which glides inside a mask of that same opening to
// follow the pointer, and the lashes on top.
const FalseMirrorEye = () => (
  <div className="sw-eye sw-eye-lid">
    <Sprite name="eye-ball" className="sw-eye-ball" />
    <div className="sw-eye-socket" style={{ '--sw-eye-mask': `url(${obj('eye-ball')})` }}>
      <Sprite name="eye-iris" className="sw-eye-iris" />
    </div>
    <Sprite name="eye-lashes" className="sw-eye-lashes" />
  </div>
);

const CastleRock = () => <Sprite name="rock" className="sw-rock" />;
const Apple = () => <Sprite name="apple" className="sw-apple" />;
const BowlerHat = () => <Sprite name="hat" className="sw-hat" />;
// a door that opens onto the other time of day
const NightDoor = ({ night }) => <Sprite name={night ? 'door-night' : 'door-day'} className="sw-door" />;
const MeltingWatch = () => <Sprite name="watch" className="sw-watch" />;

const Lamppost = () => (
  <svg className="sw-lamp" viewBox="0 0 80 260" aria-hidden="true">
    <circle cx="40" cy="30" r="30" fill="var(--sw-lamp-glow)" />
    <rect x="37" y="40" width="6" height="214" fill="#07090f" />
    <path d="M26 40 L54 40 L48 22 L32 22 Z" fill="#0c0f16" />
    <rect x="31" y="26" width="18" height="12" fill="#ffe7a8" />
    <rect x="28" y="250" width="24" height="8" fill="#07090f" />
  </svg>
);

/**
 * How far the sun has set: 0 = high in the sky, 1 = below the horizon.
 * It sinks through a focus session and rises again through a break.
 */
export const sunSetAmount = (mode, progress) => {
  const p = Math.max(0, Math.min(1, progress || 0));
  return mode === 'shortBreak' || mode === 'longBreak' ? 1 - p : p;
};

export default function SurrealWorld({ theme, progress = 0, mode = 'work' }) {
  const night = baseTheme(theme) === 'dark';
  const sunSet = sunSetAmount(mode, progress);
  const sun = (h) => SUNS[`./plates/sun-${night ? 'night' : 'day'}-${h}.webp`];
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
    <div ref={rootRef} className={`surreal-world sw-${baseTheme(theme)}`} style={{ '--sw-set': sunSet.toFixed(4) }}
      aria-hidden="true" data-sun-set={sunSet.toFixed(2)}>
      <div className="sw-sky" />
      {/* the stage, rendered in Blender (resources/blender) as 2.5D depth layers:
          sky + sun at the back, the mirror floor, the arcades on the horizon */}
      <div className="sw-plate sw-plate-back" />
      {/* the sun: a rendered orb that sets through a focus session and rises in a
          break; the floor layer in front of it is the horizon that hides it */}
      <div className="sw-sunlayer">
        <span className="sw-sun-halo" />
        <img className="sw-sun-disc" src={sun('high')} alt="" draggable="false" />
        <img className="sw-sun-disc sw-sun-low" src={sun('low')} alt="" draggable="false" />
      </div>
      <div className="sw-plate sw-plate-floor" />
      {/* its reflection, glittering on the mirror floor */}
      <div className="sw-sunglint"><img src={sun('low')} alt="" draggable="false" /></div>
      <div className="sw-plate sw-plate-far" />
      <div className="sw-dusk" />
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
        <Cloud className="sw-c1" cloud="a" night={night} />
        <Cloud className="sw-c2" cloud="b" night={night} />
        <Cloud className="sw-c3" cloud="c" night={night} />
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
        <div className="sw-obj sw-obj-door"><NightDoor night={night} /><span className="sw-cast" /></div>
        <div className="sw-obj sw-obj-lamp"><Lamppost /></div>
        <div className="sw-obj sw-obj-watch"><MeltingWatch /></div>
      </div>

      <div className="sw-layer sw-near">
        <div ref={eyeRef} className="sw-obj sw-obj-eye"><FalseMirrorEye /></div>
        <div className="sw-obj sw-obj-rock"><CastleRock /><span className="sw-drop-shadow" /></div>
        <div className="sw-obj sw-obj-apple"><Apple /></div>
        <div className="sw-obj sw-obj-hat"><BowlerHat /></div>
        <Cloud className="sw-c4" cloud="b" night={night} />
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
