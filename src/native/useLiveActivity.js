import { useEffect, useRef } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

/*
 * useLiveActivity: mirrors the timer into an iOS Live Activity, so the
 * session shows in the Dynamic Island and on the Lock Screen.
 *
 * The native side (ios/App/App/ZencusLiveActivityPlugin.swift) hands iOS an
 * end date, and iOS counts down by itself. So we only talk to it when
 * something changes (start, pause, resume, mode, reset), never every second.
 * On the web, and in tests, this does nothing.
 */

export const LiveActivity = registerPlugin('ZencusLiveActivity');

const onIOSApp = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export default function useLiveActivity({ isRunning, mode, timeLeft, totalDuration, endsAtRef, taskTitle = '' }, enabled = onIOSApp()) {
  const timeRef = useRef(timeLeft);
  timeRef.current = timeLeft;
  const active = useRef(false);
  // stopped at the very start of a session (fresh, or after a reset or skip).
  // Only meaningful while stopped, so ticking never re-runs the effect.
  const idleAtStart = !isRunning && timeLeft >= totalDuration;

  useEffect(() => {
    if (!enabled) return;
    const remaining = Math.max(0, Math.round(timeRef.current));
    const payload = { mode, remaining, total: totalDuration, taskTitle };
    const quiet = () => {}; // a missing island must never break the timer

    if (isRunning) {
      // the app's own end time (ms since epoch), so the island counts to the same moment
      const running = { ...payload, isRunning: true, endsAt: endsAtRef?.current || Date.now() + remaining * 1000 };
      if (active.current) {
        LiveActivity.update(running).catch(quiet);
      } else {
        active.current = true;
        LiveActivity.start(running).catch(() => { active.current = false; });
      }
    } else if (active.current) {
      if (idleAtStart || remaining <= 0) {
        active.current = false;
        LiveActivity.end().catch(quiet); // reset, skipped or finished
      } else {
        LiveActivity.update({ ...payload, isRunning: false }).catch(quiet); // paused
      }
    }
  }, [enabled, isRunning, mode, totalDuration, taskTitle, idleAtStart, endsAtRef]);
}
