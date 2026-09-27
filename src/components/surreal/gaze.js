/*
 * Where the False Mirror's iris should sit to look at a point on screen.
 * The direction is from the eye's centre to the pointer; the reach eases in
 * with distance (a cursor on the eye is looked at head-on, one across the
 * room pulls the iris to the rim). Returns an offset in the eye's own SVG
 * units (viewBox 300 × 170), inside an ellipse the almond can show.
 */
export const GAZE_REACH = { x: 58, y: 24 };
export const gazeOffset = (rect, px, py) => {
  const dx = px - (rect.left + rect.width / 2);
  const dy = py - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy);
  if (!dist) return { x: 0, y: 0 };
  const reach = 1 - Math.exp(-dist / 220);
  return {
    x: (dx / dist) * reach * GAZE_REACH.x,
    y: (dy / dist) * reach * GAZE_REACH.y,
  };
};
