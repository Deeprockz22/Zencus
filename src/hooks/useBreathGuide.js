// src/hooks/useBreathGuide.js
// Foundation for Idea #29: Mindful Breath Guide on Breaks
// Provides pure mathematical cadence and rhythm for restorative box breathing (4-4-4-4).

import { useState, useEffect, useMemo } from 'react';

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
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhaseIndex(0);
      return undefined;
    }

    // State moves only at phase boundaries (once per 4 s, not per frame). The phase is
    // read from the clock, never counted from ticks: a hidden tab throttles timers, so
    // a counted phase would fall behind the CSS ring (which follows the clock). We
    // re-read on every tick and the moment the tab is visible again.
    const start = Date.now();
    let timer = 0;
    const sync = () => {
      const elapsed = (Date.now() - start) / 1000;
      const now = calculateBreathState(elapsed);
      setPhaseIndex(PHASE_SEQUENCE.findIndex((p) => p.id === now.phase));
      const phase = PHASE_SEQUENCE.find((p) => p.id === now.phase);
      const untilNext = phase.duration * (1 - now.phaseProgress);
      timer = setTimeout(sync, Math.max(16, untilNext * 1000));
    };
    timer = setTimeout(sync, PHASE_SEQUENCE[0].duration * 1000);
    const onVisible = () => {
      if (document.hidden) return;
      clearTimeout(timer);
      sync();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isActive]);

  const currentPhase = PHASE_SEQUENCE[phaseIndex];

  return useMemo(() => ({
    phase: currentPhase.id,
    label: currentPhase.label,
    phaseProgress: 0,
    cycleProgress: (phaseIndex * 4) / TOTAL_CYCLE_DURATION,
    scale: currentPhase.id === 'hold_in' || currentPhase.id === 'inhale' ? 1.35 : 1.0,
    secondsInPhase: 0,
  }), [currentPhase, phaseIndex]);
}
