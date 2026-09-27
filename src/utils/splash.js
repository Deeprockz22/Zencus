// Fades out the logo splash drawn by index.html once the app is on screen.
// The splash stays `minMs` from when it first went up (window.__splashAt, set by index.html):
// long enough for the logo to finish drawing and be seen. If the app took longer than that
// to load, the splash leaves right away.
export function hideSplash(minMs = 1100) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('splash');
  if (!el || el.classList.contains('is-leaving')) return;
  const shownAt = typeof window.__splashAt === 'number' ? window.__splashAt : 0;
  const wait = Math.max(0, shownAt + minMs - performance.now());
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 400);
  }, wait);
}
