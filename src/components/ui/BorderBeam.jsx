import React from 'react';

/**
 * BorderBeam Component (Inspired by Aceternity UI)
 * Creates a continuous animated laser / beam gliding along the perimeter of a container.
 */
export default function BorderBeam({
  className = '',
  size = 180,
  duration = 8,
  borderWidth = 1.5,
  anchor = 90,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  delay = 0,
  reverse = false
}) {
  return (
    <div
      style={{
        '--size': size,
        '--duration': `${duration}s`,
        '--anchor': `${anchor}%`,
        '--border-width': `${borderWidth}px`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--delay': `-${delay}s`
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className={`absolute aspect-square w-[calc(var(--size)*1px)] animate-border-beam ${
          reverse ? 'direction-reverse' : ''
        }`}
        style={{
          offsetAnchor: 'calc(var(--anchor)) 50%',
          offsetPath: 'rect(0 auto auto 0 round calc(var(--border-width) * 1px))',
          background: `linear-gradient(to left, var(--color-from), var(--color-to), transparent)`
        }}
      />
    </div>
  );
}
