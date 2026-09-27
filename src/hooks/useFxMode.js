import { useCallback, useEffect, useState } from 'react';
import { Storage } from '../utils/storage';
import { FX_KEY, FX_MODES, applyFxLite, measureFps, shouldAutoLite } from '../utils/fxMode';

const SESSION_KEY = 'zencus_fx_auto_lite';
const readSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};
const writeSession = (on) => {
  try {
    if (on) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: Auto simply re-detects next time */
  }
};

/**
 * Owns the visual-effects mode. Returns the chosen mode, a setter, and whether
 * Auto has switched to Light (so Settings can say so).
 *
 * Auto starts in Full, samples the frame rate after the page settles and every
 * 20 s while visible, and switches to Light after two low samples in a row (one
 * hiccup isn't enough). Once Auto picks Light it stays for the session, so a
 * reload doesn't stutter again; plugging in the charger gives Full another try.
 */
export default function useFxMode() {
  const [mode, setModeState] = useState(() => {
    const saved = Storage.get(FX_KEY, 'auto');
    return FX_MODES.includes(saved) ? saved : 'auto';
  });
  const [autoLite, setAutoLite] = useState(() => {
    if (readSession()) return true;
    return shouldAutoLite({ cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory });
  });

  const setMode = useCallback((next) => {
    if (!FX_MODES.includes(next)) return;
    setModeState(next);
    Storage.set(FX_KEY, next);
  }, []);

  const lite = mode === 'lite' || (mode === 'auto' && autoLite);
  useEffect(() => {
    applyFxLite(lite);
  }, [lite]);

  const goLite = useCallback(() => {
    setAutoLite(true);
    writeSession(true);
  }, []);

  // frame-rate watch (Auto, while still in Full)
  useEffect(() => {
    if (mode !== 'auto' || autoLite) return undefined;
    let cancelled = false;
    let timer = 0;
    let lows = 0;
    const check = async () => {
      if (cancelled) return;
      const fps = await measureFps(1500);
      if (cancelled) return;
      if (fps == null) lows = 0;
      else if (shouldAutoLite({ fps })) lows += 1;
      else lows = 0;
      if (lows >= 2) {
        goLite();
        return;
      }
      timer = window.setTimeout(check, lows ? 250 : 20000);
    };
    timer = window.setTimeout(check, 2500); // let the page settle first
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode, autoLite, goLite]);

  // battery: low and discharging → Light; the charger going in → try Full again
  useEffect(() => {
    if (mode !== 'auto' || typeof navigator.getBattery !== 'function') return undefined;
    let battery = null;
    let cancelled = false;
    const onChange = () => {
      if (!battery) return;
      if (shouldAutoLite({ battery })) goLite();
      else if (battery.charging) {
        setAutoLite(false);
        writeSession(false);
      }
    };
    navigator
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        battery = b;
        b.addEventListener('levelchange', onChange);
        b.addEventListener('chargingchange', onChange);
        if (shouldAutoLite({ battery: b })) goLite();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener('levelchange', onChange);
        battery.removeEventListener('chargingchange', onChange);
      }
    };
  }, [mode, goLite]);

  return { mode, setMode, autoLite, lite };
}
