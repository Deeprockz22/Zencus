import React from 'react';

/**
 * EqualizerWave - Live audio reactive indicator inspired by React Bits
 * Shows animated dynamic soundwave bars when playback is active.
 */
export default function EqualizerWave({ isPlaying = true, barCount = 3, className = '' }) {
  if (!isPlaying) return null;

  return (
    <span className={`rb-equalizer-wave ${className}`} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className="rb-equalizer-bar"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.65 + (i % 3) * 0.2}s`
          }}
        />
      ))}
    </span>
  );
}
