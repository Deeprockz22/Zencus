// src/hooks/useBreathGuide.js
// Foundation for Idea #29: Mindful Breath Guide on Breaks
// Provides pure mathematical cadence and rhythm for restorative box breathing (4-4-4-4).

import { useState, useEffect, useMemo, useRef } from 'react';

export const BREATH_PHASES = {
  INHALE: { id: 'inhale', label: 'Breathe in', duration: 4 },
  HOLD_IN: { id: 'hold_in', label: 'Hold', duration: 4 },
  EXHALE: { id: 'exhale', label: 'Breathe out', duration: 4 },
  HOLD_OUT: { id: 'hold_out', label: 'Rest', duration: 4 },
};

const PHASE_SEQUENCE = [
  BREATH_PHASES.INHALE,
  BREATH_PHASES.HOLD_IN,
  BREATH_PHASES.EXHALE,
  BREATH_PHASES.HOLD_OUT,
];

export const TOTAL_CYCLE_DURATION = PHASE_SEQUENCE.reduce((acc, p) => acc + p.duration, 0); // 16s

/**
 * Pure calculation function for deterministic testing
 */
export function calculateBreathState(elapsedSeconds) {
  const modTime = Math.max(0, elapsedSeconds) % TOTAL_CYCLE_DURATION;
  let accumulated = 0;

  for (let i = 0; i < PHASE_SEQUENCE.length; i++) {
    const p = PHASE_SEQUENCE[i];
    if (modTime < accumulated + p.duration) {
      const phaseElapsed = modTime - accumulated;
      const phaseProgress = phaseElapsed / p.duration;

      // Scale calculations:
      // Inhale: 1.0 -> 1.35
      // Hold in: 1.35
      // Exhale: 1.35 -> 1.0
      // Hold out: 1.0
      let scale = 1.0;
      if (p.id === 'inhale') {
        scale = 1.0 + (0.35 * Math.sin((phaseProgress * Math.PI) / 2));
      } else if (p.id === 'hold_in') {
        scale = 1.35;
      } else if (p.id === 'exhale') {
        scale = 1.35 - (0.35 * Math.sin((phaseProgress * Math.PI) / 2));
      } else {
        scale = 1.0;
      }

      return {
        phase: p.id,
        label: p.label,
        phaseProgress,
        cycleProgress: modTime / TOTAL_CYCLE_DURATION,
        scale: Math.round(scale * 1000) / 1000,
        secondsInPhase: Math.floor(phaseElapsed),
      };
    }
    accumulated += p.duration;
  }

  return {
    phase: BREATH_PHASES.INHALE.id,
    label: BREATH_PHASES.INHALE.label,
    phaseProgress: 0,
    cycleProgress: 0,
    scale: 1.0,
    secondsInPhase: 0,
  };
}

export default function useBreathGuide(isActive = true) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      startTimeRef.current = null;
      return undefined;
    }

    let rafId;
    const start = performance.now();
    startTimeRef.current = start;

    const tick = (now) => {
      const sec = (now - start) / 1000;
      setElapsed(sec);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  return useMemo(() => calculateBreathState(elapsed), [elapsed]);
}
