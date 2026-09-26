// src/hooks/useSoftLanding.js
// Foundation for Idea #6: Soft Landing
// In the final 60 seconds of a focus session, eases the user out of hyperfocus
// by providing progress and audio volume dampening factors without startling chimes.

import { useMemo } from 'react';

export const SOFT_LANDING_SECONDS = 60;

export function calculateSoftLanding(timeLeft, isRunning, mode) {
  if (!isRunning || mode !== 'work' || timeLeft <= 0 || timeLeft > SOFT_LANDING_SECONDS) {
    return {
      isSoftLanding: false,
      softLandingProgress: 0,
      volumeFactor: 1.0,
      secondsRemaining: timeLeft,
    };
  }

  // Progress from 0 (at 60s remaining) to 1 (at 0s remaining)
  const softLandingProgress = (SOFT_LANDING_SECONDS - timeLeft) / SOFT_LANDING_SECONDS;
  // Volume gently drops to 0.70 at the very end
  const volumeFactor = 1.0 - (softLandingProgress * 0.30);

  return {
    isSoftLanding: true,
    softLandingProgress: Math.min(1, Math.max(0, softLandingProgress)),
    volumeFactor: Math.min(1, Math.max(0.70, volumeFactor)),
    secondsRemaining: timeLeft,
  };
}

export default function useSoftLanding(timeLeft, isRunning, mode) {
  return useMemo(
    () => calculateSoftLanding(timeLeft, isRunning, mode),
    [timeLeft, isRunning, mode]
  );
}
