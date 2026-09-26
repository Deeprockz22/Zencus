/**
 * Document Picture-in-Picture Manager (#33)
 * 
 * Provides native desktop floating always-on-top window support via the
 * Chrome / Edge Document Picture-in-Picture API. Allows deep work in Xcode,
 * Figma, or VS Code while keeping the timer visible without window switching.
 */

let activePiPWindow = null;

export const canUseDocumentPiP = () => {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
};

export const isPiPOpen = () => {
  return activePiPWindow !== null && !activePiPWindow.closed;
};

/**
 * Opens a Document Picture-in-Picture window and clones all styles for seamless theme harmony.
 * @param {Object} options
 * @param {number} [options.width=280]
 * @param {number} [options.height=180]
 * @param {string} [options.theme='komorebi']
 * @param {Function} [options.onClose]
 * @returns {Promise<{ pipWindow: Window, container: HTMLElement }>}
 */
export async function openDocumentPiP({
  width = 280,
  height = 180,
  theme = 'komorebi',
  onClose
} = {}) {
  if (!canUseDocumentPiP()) {
    throw new Error('Document Picture-in-Picture API is not supported in this browser.');
  }

  // If already open, focus it
  if (isPiPOpen()) {
    activePiPWindow.focus();
    return {
      pipWindow: activePiPWindow,
      container: activePiPWindow.document.getElementById('pip-root')
    };
  }

  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width,
    height,
    disallowReturnToOpener: false
  });

  activePiPWindow = pipWindow;

  // Copy root classes (theme skin, dark mode, komorebi, etc.)
  pipWindow.document.documentElement.className = document.documentElement.className;
  pipWindow.document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || theme);

  // Copy all stylesheets from main window
  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      if (styleSheet.href) {
        const link = pipWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type || 'text/css';
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      } else if (styleSheet.cssRules) {
        const style = pipWindow.document.createElement('style');
        style.textContent = Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
        pipWindow.document.head.appendChild(style);
      }
    } catch (err) {
      // In case of cross-origin stylesheet security restrictions, use link directly
      if (styleSheet.href) {
        const link = pipWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    }
  });

  // Base PiP container styling
  const pipStyle = pipWindow.document.createElement('style');
  pipStyle.textContent = `
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-primary, #0f1412);
      color: var(--text-primary, #e2e8f0);
      user-select: none;
      -webkit-user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
    }
    #pip-root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 12px;
      backdrop-filter: blur(12px);
    }
  `;
  pipWindow.document.head.appendChild(pipStyle);

  const container = pipWindow.document.createElement('div');
  container.id = 'pip-root';
  pipWindow.document.body.appendChild(container);

  pipWindow.addEventListener('pagehide', () => {
    activePiPWindow = null;
    if (onClose) onClose();
  });

  return { pipWindow, container };
}

export function closeDocumentPiP() {
  if (isPiPOpen()) {
    try {
      activePiPWindow.close();
    } catch (_) {}
    activePiPWindow = null;
  }
}
