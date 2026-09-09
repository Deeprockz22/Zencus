import React from 'react';

/**
 * ⚡ ZENCUS VECTOR BRAND LOGO
 * 4-Blade Geometric Origami Ribbon Emblem in Radiant Scarlet (#FF3B30) and Ink Black.
 */
export default function FocusLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`focus-brand-logo zencus-brand-logo ${className}`}
      aria-label="Zencus Logo"
    >
      {/* 4-Blade Folded Ribbon Mark */}
      <g transform="translate(24, 24)">
        {/* Top Blade */}
        <path d="M0,0 L10,-10 L20,0 L10,10 Z" fill="#ff3b30" />
        {/* Right Blade */}
        <path d="M0,0 L10,10 L0,20 L-10,10 Z" fill="#121212" />
        {/* Bottom Blade */}
        <path d="M0,0 L-10,10 L-20,0 L-10,-10 Z" fill="#ff3b30" />
        {/* Left Blade */}
        <path d="M0,0 L-10,-10 L0,-20 L10,-10 Z" fill="#121212" />
      </g>
    </svg>
  );
}

