/**
 * Tab Icon & Title Progress Ring (#34)
 * 
 * Dynamically draws an off-screen 32x32 canvas circular progress indicator
 * onto the browser favicon and formats the document title with visceral clarity.
 */

let originalFaviconHref = null;
let canvas = null;
let ctx = null;

function getCanvas() {
  if (typeof document === 'undefined') return null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    ctx = canvas.getContext('2d');
  }
  return { canvas, ctx };
}

function getFaviconLink() {
  if (typeof document === 'undefined') return null;
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  return link;
}

export function getThemeColor(theme, mode) {
  if (mode !== 'work') {
    return '#34d399'; // soothing emerald break
  }
  const t = theme || 'light';
  if (t.includes('komorebi')) {
    return t.includes('night') ? '#a7f3d0' : '#4d7c0f'; // mountain sage / washi green
  }
  if (t.includes('surreal')) {
    return '#a855f7'; // magritte dream violet
  }
  if (t.includes('lantern')) {
    return '#f59e0b'; // amber lantern glow
  }
  return '#3b82f6'; // crisp cobalt blue
}

/**
 * Updates the browser favicon with a smooth circular progress ring.
 * @param {number} progress - 0.0 to 1.0 (elapsed ratio)
 * @param {'work' | 'shortBreak' | 'longBreak'} mode 
 * @param {string} theme 
 * @param {boolean} isRunning 
 */
export function updateTabProgressRing(progress, mode, theme, isRunning) {
  if (typeof document === 'undefined') return;

  const link = getFaviconLink();
  if (!link) return;

  if (!originalFaviconHref) {
    originalFaviconHref = link.getAttribute('href') || '/favicon.ico';
  }

  // If not running, restore original icon
  if (!isRunning) {
    if (link.getAttribute('href') !== originalFaviconHref) {
      link.setAttribute('href', originalFaviconHref);
    }
    return;
  }

  const res = getCanvas();
  if (!res || !res.ctx) return;
  const { canvas, ctx } = res;

  ctx.clearRect(0, 0, 32, 32);

  const centerX = 16;
  const centerY = 16;
  const radius = 13;
  const lineWidth = 3.5;
  const primaryColor = getThemeColor(theme, mode);

  // Background track
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(128, 128, 128, 0.25)';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Progress arc (starts at 12 o'clock, clockwise)
  // progress goes 0 -> 1 as time elapses
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * safeProgress);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center indicator dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fillStyle = primaryColor;
  ctx.fill();

  try {
    link.href = canvas.toDataURL('image/png');
  } catch (err) {
    // Gracefully handle any security/canvas restrictions
  }
}

export function restoreTabFavicon() {
  if (typeof document === 'undefined') return;
  const link = getFaviconLink();
  if (link && originalFaviconHref) {
    link.setAttribute('href', originalFaviconHref);
  }
}
