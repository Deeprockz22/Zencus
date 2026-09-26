import { useCallback, useEffect, useState } from 'react';

/*
 * useDocumentPiP: an always-on-top mini window via the Document
 * Picture-in-Picture API (Chrome/Edge 116+). The window is a real document,
 * so React renders into it with a portal and shares the app's live state:
 * there is no second timer to drift.
 *
 * Where the API doesn't exist (Safari, Firefox) `supported` is false and
 * callers simply don't offer the feature.
 */

const pipApi = () => (typeof window !== 'undefined' ? window.documentPictureInPicture : undefined);

// Carry the app's CSS across: inline same-origin rules, link the rest.
function copyStyles(target) {
  [...document.styleSheets].forEach((sheet) => {
    try {
      const style = target.createElement('style');
      style.textContent = [...sheet.cssRules].map((r) => r.cssText).join('\n');
      target.head.appendChild(style);
    } catch {
      if (!sheet.href) return;
      const link = target.createElement('link');
      link.rel = 'stylesheet';
      link.href = sheet.href;
      target.head.appendChild(link);
    }
  });
}

// Mirror <html>'s theme class and data-theme so tokens resolve the same way.
function mirrorRoot(target) {
  const src = document.documentElement;
  const sync = () => {
    target.documentElement.className = src.className;
    const t = src.getAttribute('data-theme');
    if (t) target.documentElement.setAttribute('data-theme', t);
    else target.documentElement.removeAttribute('data-theme');
  };
  sync();
  const obs = new MutationObserver(sync);
  obs.observe(src, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  return () => obs.disconnect();
}

export default function useDocumentPiP({ width = 248, height = 136 } = {}) {
  const [blocked, setBlocked] = useState(false);
  const supported = !!pipApi()?.requestWindow && !blocked;
  const [pipWindow, setPipWindow] = useState(null);

  const close = useCallback(() => {
    setPipWindow((w) => {
      w?.close();
      return null;
    });
  }, []);

  const open = useCallback(async () => {
    const api = pipApi();
    if (!api?.requestWindow) return null;
    if (api.window) return api.window; // already open
    let win;
    try {
      win = await api.requestWindow({ width, height });
    } catch (err) {
      // e.g. an embedded browser that exposes the API but can't open windows:
      // hide the feature for this visit rather than leave a dead button
      if (err?.name === 'InvalidStateError' || err?.name === 'NotSupportedError') setBlocked(true);
      return null;
    }
    copyStyles(win.document);
    const unmirror = mirrorRoot(win.document);
    win.document.title = 'Zencus';
    win.addEventListener('pagehide', () => {
      unmirror();
      setPipWindow(null);
    }, { once: true });
    setPipWindow(win);
    return win;
  }, [width, height]);

  const toggle = useCallback(() => (pipWindow ? close() : open()), [pipWindow, open, close]);

  // close the mini window with the app
  useEffect(() => () => pipWindow?.close(), [pipWindow]);

  return { supported, pipWindow, open, close, toggle };
}
