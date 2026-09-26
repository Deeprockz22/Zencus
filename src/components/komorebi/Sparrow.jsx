import React, { useEffect, useState } from 'react';

/*
 * The sparrow (#26): once a day, before your first session, a tree sparrow
 * drops onto the rim of the tsukubai, drinks twice, hops, and leaves.
 * About 11 seconds, no sound, no badge; if you miss it, it comes back
 * tomorrow. Skipped entirely under prefers-reduced-motion.
 */

export const SPARROW_KEY = 'thelidhu_komorebi_sparrow_day';
const PHASES = [['in', 1600], ['perch', 7600], ['out', 1800]];

const today = () => new Date().toISOString().slice(0, 10);
const readDay = () => { try { return localStorage.getItem(SPARROW_KEY); } catch { return null; } };
const markDay = () => { try { localStorage.setItem(SPARROW_KEY, today()); } catch { /* private mode */ } };

export function useSparrowVisit(eligible) {
  const [arrived, setArrived] = useState(false);
  const [phase, setPhase] = useState(null);

  // wait for a quiet moment on a day she hasn't visited yet
  useEffect(() => {
    if (!eligible || arrived || readDay() === today()) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setTimeout(() => { markDay(); setArrived(true); setPhase('in'); }, 2500); // let the room settle first
    return () => clearTimeout(t);
  }, [eligible, arrived]);

  // once she's here she finishes her visit, even if a session starts
  useEffect(() => {
    if (!arrived) return undefined;
    const timers = [];
    let t = 0;
    PHASES.forEach(([name, dur]) => {
      if (t > 0) timers.push(setTimeout(() => setPhase(name), t)); // 'in' was set on arrival
      t += dur;
    });
    timers.push(setTimeout(() => setPhase('gone'), t));
    return () => timers.forEach(clearTimeout);
  }, [arrived]);

  return phase === 'gone' ? null : phase;
}

export default function Sparrow({ phase }) {
  if (!phase) return null;
  return (
    <div className={`kw-sparrow is-${phase}`} aria-hidden="true">
      <svg viewBox="0 0 60 44">
        <g className="sp-body">
          <path className="sp-tail" d="M6 22 L-4 16 L-2 26 Z" />
          <ellipse className="sp-belly" cx="22" cy="26" rx="17" ry="11" />
          <path className="sp-back" d="M8 22 Q16 10 32 13 Q38 16 36 22 Q24 20 8 22 Z" />
          <g className="sp-wing">
            <path d="M12 20 Q24 12 34 20 Q26 28 12 24 Z" />
            <path className="sp-wingbar" d="M18 21 Q25 18 31 21" />
          </g>
          <g className="sp-head">
            <circle cx="38" cy="15" r="9" className="sp-cheek" />
            <path className="sp-cap" d="M30 12 Q36 4 45 10 Q40 12 30 12 Z" />
            <circle className="sp-spot" cx="38" cy="17" r="2.2" />
            <circle className="sp-eye" cx="41" cy="13" r="1.4" />
            <path className="sp-beak" d="M46 14 L52 16 L46 18 Z" />
          </g>
          <g className="sp-legs">
            <line x1="20" y1="36" x2="18" y2="43" />
            <line x1="26" y1="36" x2="27" y2="43" />
          </g>
        </g>
      </svg>
    </div>
  );
}
