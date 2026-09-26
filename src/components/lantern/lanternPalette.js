/*
 * Lantern Garden palette — sampled from the two reference paintings:
 *   Mist (day):    a lavender forest in fog, a crescent moon, a greenhouse
 *                  glowing peach from inside, fireflies.
 *   Sakura (night): a starry indigo sky with cyan spirit-lights, pink-to-coral
 *                  blossom canopies, warm paper lanterns, a lit stone path.
 * Complementary warm/cool pairs do the work: lantern gold against indigo,
 * blossom pink against spirit cyan, greenhouse peach against lavender mist.
 */

export const LANTERN = {
  // night
  inkNight: '#070b24',
  indigo: '#141a4e',
  violet: '#3a1f6e',
  plum: '#8a3a8e',
  horizonRose: '#e0709a',
  blossom: '#ff6fa8',
  blossomLight: '#ffa6c9',
  blossomDeep: '#c93f86',
  coral: '#ffb08a',
  lanternGold: '#ffc86b',
  lanternCore: '#fff3c4',
  lanternEdge: '#e0782a',
  spirit: '#5ef2ff',
  spiritDeep: '#2a9dff',
  firefly: '#e6ff8a',
  bark: '#2a1030',
  // day
  mistTop: '#d6cef5',
  mist: '#b6aaea',
  mistLow: '#9f93dd',
  treeFar: '#aea3e2',
  treeMid: '#9083cf',
  treeNear: '#6f62b2',
  treeDeep: '#54489a',
  glassFrame: '#5a4d9c',
  peachGlow: '#ffd7b8',
  peachCore: '#fff0de',
  moonWhite: '#fbf8ff',
};

// The timer lantern changes the colour of its light with the mode:
// focus burns warm, breaks glow with the cyan of the spirit-lights.
export const LANTERN_MODES = {
  work: { core: '#fff3c4', mid: '#ffc86b', edge: '#e0782a', glow: 'rgba(255, 190, 90, 0.55)' },
  shortBreak: { core: '#e6fdff', mid: '#5ef2ff', edge: '#2a9dff', glow: 'rgba(94, 242, 255, 0.5)' },
  longBreak: { core: '#fbe6ff', mid: '#ffa6c9', edge: '#c93f86', glow: 'rgba(255, 111, 168, 0.5)' },
};

export const lanternModeFor = (mode) => LANTERN_MODES[mode] || LANTERN_MODES.work;
