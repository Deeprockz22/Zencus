/**
 * Computes luminance and high-contrast text and UI colors
 * automatically based on the background color and theme.
 */
export function getContrastColors(bgHexOrRgb, theme = 'dark') {
  let r = 24, g = 24, b = 27; // Default dark charcoal

  if (typeof bgHexOrRgb === 'string') {
    if (bgHexOrRgb.startsWith('#')) {
      let hex = bgHexOrRgb.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      const num = parseInt(hex, 16);
      r = (num >> 16) & 255;
      g = (num >> 8) & 255;
      b = num & 255;
    } else if (bgHexOrRgb.includes('rgb')) {
      const parts = bgHexOrRgb.match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        r = parseFloat(parts[0]);
        g = parseFloat(parts[1]);
        b = parseFloat(parts[2]);
      }
    }
  }

  // Relative luminance according to WCAG formula
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const isLightBg = lum > 0.42;

  if (isLightBg) {
    return {
      isLight: true,
      textColor: '#111115',
      subtextColor: 'rgba(18, 18, 22, 0.78)',
      mutedColor: 'rgba(18, 18, 22, 0.55)',
      borderColor: 'rgba(18, 18, 22, 0.2)',
      panelBg: 'rgba(255, 255, 255, 0.82)',
      textShadow: '0 1px 12px rgba(255, 255, 255, 0.9), 0 0 2px rgba(255, 255, 255, 0.8)',
      accentColor: '#d92d20',
      tagBg: '#111115',
      tagText: '#ffffff'
    };
  }

  return {
    isLight: false,
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.82)',
    mutedColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    panelBg: 'rgba(18, 18, 22, 0.75)',
    textShadow: '0 2px 14px rgba(0, 0, 0, 0.85), 0 0 6px rgba(0, 0, 0, 0.6)',
    accentColor: '#ff3b30',
    tagBg: '#ffffff',
    tagText: '#0a0a0c'
  };
}
