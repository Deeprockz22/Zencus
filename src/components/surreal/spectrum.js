/*
 * Dream Spectrum — Zencus colour system.
 *
 * Authored in OKLCH (perceptually uniform: equal L steps look equal across
 * hues), converted to sRGB hex here for canvas/SVG. CSS uses the oklch()
 * originals in surreal.css so wide-gamut (P3) screens get the full chroma.
 *
 * Harmony: split-complementary around one anchor.
 *   anchor      Dreamberry  h≈355 (magenta)
 *   analogous   Ultraviolet h≈292, Orchid Haze h≈318   → the sky field (≈60%)
 *   warm light  Ember Coral h≈32, Tangerine Dusk h≈60, Solar Nectar h≈88
 *               → the sun, objects, primary actions (≈30%)
 *   split comps Mint Ghost h≈158 (355+163), Lagoon Glass h≈208 (355+213)
 *               → glows, focus rings, progress (≈10%) — the complement is
 *               what makes the magenta field feel electric (simultaneous contrast)
 * Neutrals are never grey: they carry a trace of the anchor hue.
 * Warm light, cool shadows: every shadow is tinted ultraviolet.
 */

export const SPECTRUM = {
  dreamberry: '#ff1f9a',      // oklch(0.66 0.27 355)
  ultraviolet: '#7114eb',     // oklch(0.50 0.27 292)
  orchidHaze: '#d785ef',      // oklch(0.74 0.17 318)
  nightglass: '#18083b',      // oklch(0.20 0.09 290)
  deepPlum: '#3f0c64',        // oklch(0.30 0.14 305)
  solarNectar: '#ffd25c',     // oklch(0.88 0.17 88)
  emberCoral: '#ff745b',      // oklch(0.72 0.19 32)
  tangerineDusk: '#ff9c3f',   // oklch(0.78 0.17 60)
  mintGhost: '#6af7ae',       // oklch(0.88 0.16 158)
  lagoonGlass: '#04d5ec',     // oklch(0.80 0.14 208)
  chartreusePulse: '#c6fb50', // oklch(0.92 0.20 125)
  milkCloud: '#fff7fe',       // oklch(0.985 0.012 330)
  ink: '#1b1434',             // oklch(0.22 0.06 290)
};

const S = SPECTRUM;

/*
 * Mode palettes follow colour psychology as well as harmony:
 * focus runs warm and high-arousal (analogous magenta → gold with one cool
 * accent); a short break moves to the split-complements (fresh, green-blue);
 * a long break sinks into violet and lagoon (deep, slow).
 */
export const MODE_PALETTES = {
  work: {
    base: S.nightglass,
    blobs: [S.dreamberry, S.emberCoral, S.solarNectar, S.ultraviolet, S.tangerineDusk, S.lagoonGlass],
    ring: [S.solarNectar, S.dreamberry, S.ultraviolet],
    face: [S.solarNectar, S.tangerineDusk, S.dreamberry, S.ultraviolet],
  },
  shortBreak: {
    base: '#04243a',
    blobs: [S.mintGhost, S.lagoonGlass, S.chartreusePulse, S.ultraviolet, S.mintGhost, S.orchidHaze],
    ring: [S.chartreusePulse, S.mintGhost, S.lagoonGlass],
    face: [S.chartreusePulse, S.mintGhost, S.lagoonGlass, S.ultraviolet],
  },
  longBreak: {
    base: S.nightglass,
    blobs: [S.ultraviolet, S.lagoonGlass, S.orchidHaze, S.deepPlum, S.lagoonGlass, S.solarNectar],
    ring: [S.lagoonGlass, S.ultraviolet, S.orchidHaze],
    face: [S.lagoonGlass, S.orchidHaze, S.ultraviolet, S.deepPlum],
  },
};

export const paletteFor = (mode) => MODE_PALETTES[mode] || MODE_PALETTES.work;
