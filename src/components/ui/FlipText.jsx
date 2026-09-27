import React from 'react';
import './flip-text.css';

/**
 * Rolls in only the characters that changed (e.g. 24:59 -> 24:58 moves just the last digit).
 * Inspired by ObsidianUI's Flip Text (MIT). CSS-only, so a per-second tick costs one tiny remount.
 * `still` keeps the last N characters from rolling (Zen mode: the seconds change without moving).
 */
export default function FlipText({ text = '', className = '', still = 0 }) {
  const chars = String(text).split('');
  const firstStill = chars.length - still;
  return (
    <span className={`flip-text ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="flip-text-chars" aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i >= firstStill ? i : `${i}-${ch}`} className="flip-text-char">{ch}</span>
        ))}
      </span>
    </span>
  );
}
