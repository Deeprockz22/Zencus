import React from 'react';
import './hanko-seal.css';

/**
 * HankoSeal — Traditional Japanese stone seal (判子 / Hankō) of accomplishment.
 * Emblazoned with '禅' (Zen) and '完' (Complete), stamped in cinnabar vermilion red.
 */
export default function HankoSeal({
  size = 48,
  className = '',
  animate = false,
  text = '禅完',
  title = 'Sealed with Zen mark'
}) {
  return (
    <div
      className={`hanko-seal-wrapper ${animate ? 'is-stamping' : ''} ${className}`}
      style={{ width: size, height: size }}
      title={title}
      aria-label={title}
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="hanko-seal-svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="hanko-ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Outer carved stone border with organic wabi-sabi irregularities */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="12"
          className="hanko-border"
          filter="url(#hanko-ink-bleed)"
        />

        {/* Seal Characters in classical seal-block style */}
        <g className="hanko-kanji" filter="url(#hanko-ink-bleed)">
          <text
            x="50"
            y="42"
            textAnchor="middle"
            dominantBaseline="central"
            className="hanko-text hanko-text-top"
          >
            {text[0] || '禅'}
          </text>
          <text
            x="50"
            y="74"
            textAnchor="middle"
            dominantBaseline="central"
            className="hanko-text hanko-text-bottom"
          >
            {text[1] || '完'}
          </text>
        </g>
      </svg>
    </div>
  );
}
