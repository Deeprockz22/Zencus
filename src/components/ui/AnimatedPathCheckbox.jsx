import React from 'react';

/**
 * AnimatedPathCheckbox
 * High-performance SVG stroke uncoil & check morph animation from Uiverse.
 */
export default function AnimatedPathCheckbox({
  checked = false,
  onChange,
  size = '22px',
  className = '',
  'aria-label': ariaLabel
}) {
  return (
    <label className={`animated-checkbox-container ${className}`} onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-label={ariaLabel || (checked ? 'Mark incomplete' : 'Mark complete')}
      />
      <svg
        viewBox="0 0 64 64"
        style={{ width: size, height: size }}
        className="animated-checkbox-svg"
      >
        <path
          d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
          pathLength="575.0541381835938"
          className="animated-checkbox-path"
        />
      </svg>
    </label>
  );
}
