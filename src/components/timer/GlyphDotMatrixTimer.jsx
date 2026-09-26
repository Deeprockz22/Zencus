import React from 'react';

// Authentic Nothing NDot 5x7 LED matrix patterns
const MATRIX_PATTERNS = {
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0]
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  '3': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '4': [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0]
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '6': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  ':': [
    [0],
    [1],
    [0],
    [0],
    [1],
    [0],
    [0]
  ]
};

/**
 * GlyphDotMatrixTimer
 * Renders countdown digits in Nothing's signature NDot 57 LED matrix format.
 * Features illuminated circular LEDs, ghosted inactive pixels, and accessibility support.
 */
export default function GlyphDotMatrixTimer({
  timeString,
  timeLeft,
  isRunning = false,
  dotRadius = 3.6,
  dotPitch = 9.8,
  activeColor = 'var(--text-primary)',
  inactiveColor = 'var(--text-primary)',
  inactiveOpacity = 0.06,
  glow = false,
  className = ''
}) {
  let displayString = timeString;
  if (!displayString && typeof timeLeft === 'number') {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    displayString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  if (!displayString) displayString = '25:00';
  const chars = displayString.split('');
  
  // Calculate horizontal layout with spacing proportional to dotPitch
  const colonSpacing = dotPitch * 0.75;
  const charSpacing = dotPitch * 1.15;
  let currentX = dotPitch * 0.5;
  const charLayouts = chars.map((ch) => {
    const pattern = MATRIX_PATTERNS[ch] || MATRIX_PATTERNS['0'];
    const cols = pattern[0].length;
    const x = currentX;
    const charWidth = cols * dotPitch;
    currentX += charWidth + (ch === ':' ? colonSpacing : charSpacing);
    return { ch, pattern, cols, x };
  });

  const totalWidth = currentX + dotPitch * 0.5;
  const totalHeight = 7 * dotPitch + dotPitch * 1.2;

  return (
    <div className={`glyph-ndot-display-wrap relative inline-flex flex-col select-none ${className}`}>
      <svg
        className="glyph-ndot-svg block overflow-visible"
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {glow && (
          <defs>
            <filter id="ndotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={Math.max(1.5, dotRadius * 0.25)} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {charLayouts.map((charItem, charIdx) => {
          const { ch, pattern, cols, x } = charItem;
          const isColon = ch === ':';

          return (
            <g key={charIdx} className={`ndot-char-group ndot-char-${ch}`}>
              {pattern.map((row, rowIdx) => {
                return row.map((isActive, colIdx) => {
                  const cx = x + colIdx * dotPitch + dotPitch / 2;
                  const cy = dotPitch * 0.6 + rowIdx * dotPitch + dotPitch / 2;

                  if (isActive) {
                    return (
                      <circle
                        key={`${rowIdx}-${colIdx}`}
                        cx={cx}
                        cy={cy}
                        r={dotRadius}
                        fill={activeColor}
                        filter={glow && isRunning ? 'url(#ndotGlow)' : undefined}
                        className={`ndot-dot-active ${isColon && isRunning ? 'ndot-colon-blink' : ''}`}
                      />
                    );
                  }

                  // Faint ghosted inactive LED dot (Nothing hardware matrix look)
                    return (
                      <circle
                        key={`${rowIdx}-${colIdx}`}
                        cx={cx}
                        cy={cy}
                        r={dotRadius * 0.7}
                        fill={inactiveColor}
                        opacity={inactiveOpacity}
                        className="ndot-dot-inactive"
                      />
                    );
                });
              })}
            </g>
          );
        })}
      </svg>

      {/* Visible accessible text node so React Testing Library and screen readers find the exact timeString */}
      <span className="sr-only">{displayString}</span>
    </div>
  );
}
