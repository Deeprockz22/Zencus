/*
 * Visual effects: Full or Light.
 *
 * The art worlds (Surreal, Lantern, Komorebi) are painted with moving light,
 * blur and blend modes. That's cheap on a laptop at full power, but power-saving
 * mode throttles the GPU (Chrome's Energy Saver also caps pages at 30 fps), and
 * the same scene stutters. Light mode keeps each world still and flat: it's the
 * same room, just not moving.
 *
 * The user picks Auto (default), Full or Light in Settings. Auto switches to
 * Light when the page can't hold a smooth frame rate, when the battery is low
 * and not charging, or on a very low-end device.
 */
import { useSyncExternalStore } from 'react';

export const FX_KEY = 'fx_mode';
export const FX_MODES = ['auto', 'full', 'lite'];
export const FX_EVENT = 'zencus:fx';
export const LOW_FPS = 45; // Energy Saver caps at 30; a healthy page holds ~60
export const LOW_BATTERY = 0.2; // where Windows' battery saver switches on by default

/** Should Auto choose Light? Every input is optional; missing ones don't vote. */
export function shouldAutoLite({ fps, battery, cores, memory } = {}) {
  if (typeof fps === 'number' && fps < LOW_FPS) return true;
  if (battery && battery.charging === false && battery.level <= LOW_BATTERY) return true;
  if (typeof cores === 'number' && cores > 0 && cores <= 2) return true;
  if (typeof memory === 'number' && memory > 0 && memory <= 2) return true;
  return false;
}

/** Average frames per second over `ms` (null when the tab is hidden, since rAF sleeps). */
export function measureFps(ms = 1500) {
  return new Promise((resolve) => {
    if (typeof document !== 'undefined' && document.hidden) {
      resolve(null);
      return;
    }
    let frames = 0;
    let start = 0;
    const tick = (now) => {
      if (!start) start = now;
      frames += 1;
      if (now - start < ms) requestAnimationFrame(tick);
      else resolve(document.hidden ? null : ((frames - 1) * 1000) / (now - start));
    };
    requestAnimationFrame(tick);
  });
}

export const isFxLite = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('fx-lite');

/** Put the page in (or out of) Light mode and tell anything that draws by hand. */
export function applyFxLite(lite) {
  const html = document.documentElement;
  if (html.classList.contains('fx-lite') === lite) return;
  html.classList.toggle('fx-lite', lite);
  window.dispatchEvent(new Event(FX_EVENT));
}

const subscribe = (cb) => {
  window.addEventListener(FX_EVENT, cb);
  return () => window.removeEventListener(FX_EVENT, cb);
};

/** True while Light mode is on (for components that animate in JS, like canvases). */
export const useFxLite = () => useSyncExternalStore(subscribe, isFxLite, () => false);
