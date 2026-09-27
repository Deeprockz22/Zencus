/*
 * Theme families.
 *
 * Every selectable look is a family with a day and a night variant:
 *   Crisp    — light / dark            (the original minimal app)
 *   Surreal  — surreal / surreal-night (Magritte digital art, html.surreal)
 *   Lantern  — lantern / lantern-night (anime night garden, html.lantern)
 * Each variant rides on a base theme (day → light, night → dark), which is
 * what goes into data-theme, so every base rule keeps applying and the
 * family's skin layers on top.
 */

export const SURREAL_DAY = 'surreal';
export const SURREAL_NIGHT = 'surreal-night';
export const LANTERN_DAY = 'lantern';
export const LANTERN_NIGHT = 'lantern-night';
export const KOMOREBI_DAY = 'komorebi';
export const KOMOREBI_NIGHT = 'komorebi-night';

export const isSurrealTheme = (theme) => theme === SURREAL_DAY || theme === SURREAL_NIGHT;
export const isLanternTheme = (theme) => theme === LANTERN_DAY || theme === LANTERN_NIGHT;
export const isKomorebiTheme = (theme) => theme === KOMOREBI_DAY || theme === KOMOREBI_NIGHT;
/** The art families (as opposed to Crisp), which get the art pages (Atelier, zen art…). */
export const isArtTheme = (theme) => isSurrealTheme(theme) || isLanternTheme(theme) || isKomorebiTheme(theme);

/** Night variants: used by the header's day/night toggle. */
export const isNightTheme = (theme) =>
  theme === 'dark' || theme === SURREAL_NIGHT || theme === LANTERN_NIGHT || theme === KOMOREBI_NIGHT;

/** The base light/dark theme a theme is built on (what goes in data-theme). */
export const baseTheme = (theme) => {
  if (theme === SURREAL_DAY || theme === LANTERN_DAY || theme === KOMOREBI_DAY) return 'light';
  if (theme === SURREAL_NIGHT || theme === LANTERN_NIGHT || theme === KOMOREBI_NIGHT) return 'dark';
  return theme;
};

/** The other side of the day within the same family. */
export const toggleDayNight = (theme) => {
  if (isSurrealTheme(theme)) return theme === SURREAL_NIGHT ? SURREAL_DAY : SURREAL_NIGHT;
  if (isLanternTheme(theme)) return theme === LANTERN_NIGHT ? LANTERN_DAY : LANTERN_NIGHT;
  if (isKomorebiTheme(theme)) return theme === KOMOREBI_NIGHT ? KOMOREBI_DAY : KOMOREBI_NIGHT;
  return theme === 'dark' ? 'light' : 'dark';
};

/** Pick a family, landing on the same side of the day you're on now. */
export const pickFamily = (family, currentTheme) => {
  const night = isNightTheme(currentTheme);
  if (family === 'surreal') return night ? SURREAL_NIGHT : SURREAL_DAY;
  if (family === 'lantern') return night ? LANTERN_NIGHT : LANTERN_DAY;
  if (family === 'komorebi') return night ? KOMOREBI_NIGHT : KOMOREBI_DAY;
  return family;
};

/*
 * Timer scenes per family. Each family shows its own set in the switcher;
 * a scene another family owns falls back to that family's signature scene
 * (e.g. the Dream Portal in Crisp → the vinyl; anything foreign in Lantern →
 * the Paper Lantern). The vinyl belongs to Crisp alone.
 */
const SCENES = {
  crisp: [
    { value: 'wall', label: 'Matrix Wall' },
    { value: 'turntable', label: 'Vinyl Studio' },
    { value: 'minimal', label: 'Minimal Dial' },
  ],
  surreal: [
    { value: 'portal', label: 'Dream Portal' },
    { value: 'wall', label: 'Golconda' },
    { value: 'turntable', label: 'Prism Record' },
    { value: 'minimal', label: 'Melting Clock' },
  ],
  lantern: [
    { value: 'lantern', label: 'Paper Lantern' },
    { value: 'wall', label: 'Matrix Wall' },
    { value: 'minimal', label: 'Minimal Dial' },
  ],
  // Komorebi keeps one quiet scene: the room is the visual
  komorebi: [
    { value: 'minimal', label: 'Minimal Dial' },
  ],
};
const SIGNATURE = { crisp: 'turntable', surreal: 'portal', lantern: 'lantern', komorebi: 'minimal' };

export const themeFamily = (theme) =>
  isSurrealTheme(theme)
    ? 'surreal'
    : isLanternTheme(theme)
      ? 'lantern'
      : isKomorebiTheme(theme)
        ? 'komorebi'
        : 'crisp';
export const scenesFor = (theme) => SCENES[themeFamily(theme)];
export const resolveScene = (theme, visualizerType) => {
  const family = themeFamily(theme);
  return SCENES[family].some((s) => s.value === visualizerType) ? visualizerType : SIGNATURE[family];
};
