import React from 'react';

/*
 * The calico who lives in the Komorebi light. Three poses, cross-faded:
 *   asleep  — curled in a ring, tail over her nose, breathing slowly
 *   stretch — the long downward stretch: front paws reaching, rear up, a yawn
 *   awake   — a loaf by the teacup, slow blinks, tail tip swishing
 * Colours are the classic calico: cream white with orange and black patches.
 */

const WHITE = '#f8f1e4';
const ORANGE = '#e3924a';
const BLACK = '#2c2622';
const PINK = '#e9a3a0';
const LINE = '#6b5a4c';

function Asleep() {
  return (
    <g className="cat-pose cat-asleep">
      <g className="cat-breathe">
        {/* body curled into a ring */}
        <ellipse cx="104" cy="92" rx="66" ry="40" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
        <path d="M70 60 Q104 44 140 58 Q150 74 132 80 Q104 70 78 78 Q62 72 70 60 Z" fill={ORANGE} />
        <path d="M134 84 Q160 80 166 98 Q150 116 128 110 Q138 98 134 84 Z" fill={BLACK} />
        {/* head tucked in at the front */}
        <circle cx="56" cy="94" r="27" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
        <path d="M36 80 L32 60 L50 72 Z" fill={ORANGE} stroke={LINE} strokeWidth="1.2" />
        <path d="M64 70 L74 54 L78 74 Z" fill={BLACK} stroke={LINE} strokeWidth="1.2" />
        <path d="M38 88 Q44 82 52 86 Q48 78 40 80 Z" fill={ORANGE} opacity="0.85" />
        {/* closed eyes */}
        <path d="M42 96 Q47 100 52 96" stroke={LINE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M60 96 Q65 100 70 96" stroke={LINE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M54 104 L56 106 L58 104" stroke={PINK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
      {/* tail wrapped over her nose */}
      <path d="M168 104 Q150 132 96 128 Q60 126 40 114" stroke={ORANGE} strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M52 119 Q44 116 40 114" stroke={BLACK} strokeWidth="13" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Stretch() {
  return (
    <g className="cat-pose cat-stretch">
      {/* rear up, spine sloping down to the reaching front paws */}
      <path d="M150 58 Q170 60 172 84 L168 118 L156 118 L156 92 Q120 96 82 104 Q62 108 44 110 L20 116 L20 106 L46 98 Q72 72 110 64 Q132 56 150 58 Z"
        fill={WHITE} stroke={LINE} strokeWidth="1.5" />
      <path d="M100 68 Q126 58 150 60 Q158 72 146 80 Q122 78 104 84 Z" fill={ORANGE} />
      <path d="M150 62 Q168 64 170 82 Q160 88 152 80 Z" fill={BLACK} />
      {/* tail up, curling */}
      <path d="M166 62 Q184 40 176 18 Q172 10 180 6" stroke={ORANGE} strokeWidth="11" fill="none" strokeLinecap="round" />
      {/* head low, mid-yawn */}
      <circle cx="42" cy="92" r="23" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
      <path d="M24 80 L20 62 L36 72 Z" fill={ORANGE} stroke={LINE} strokeWidth="1.2" />
      <path d="M50 72 L60 58 L62 78 Z" fill={BLACK} stroke={LINE} strokeWidth="1.2" />
      <path d="M30 88 Q35 84 40 88" stroke={LINE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M46 88 Q51 84 56 88" stroke={LINE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="43" cy="102" rx="6" ry="7" fill={PINK} stroke={LINE} strokeWidth="1.2" className="cat-yawn" />
      {/* kneading front paws */}
      <ellipse cx="18" cy="114" rx="9" ry="5" fill={WHITE} stroke={LINE} strokeWidth="1.2" className="cat-knead" />
      <ellipse cx="34" cy="116" rx="9" ry="5" fill={WHITE} stroke={LINE} strokeWidth="1.2" className="cat-knead cat-knead-2" />
    </g>
  );
}

function Awake() {
  return (
    <g className="cat-pose cat-awake">
      {/* a loaf */}
      <path d="M52 124 Q46 80 92 72 Q138 66 150 100 Q156 124 150 126 Z" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
      <path d="M92 74 Q128 68 146 94 Q130 96 112 88 Q98 84 92 74 Z" fill={ORANGE} />
      <path d="M136 108 Q152 104 152 124 L134 126 Z" fill={BLACK} />
      {/* tail wrapped round the front, tip swishing */}
      <g className="cat-tail-swish">
        <path d="M150 122 Q128 136 88 132" stroke={ORANGE} strokeWidth="11" fill="none" strokeLinecap="round" />
      </g>
      {/* head up, eyes open, slow blink */}
      <circle cx="74" cy="70" r="27" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
      <path d="M54 56 L50 34 L68 48 Z" fill={ORANGE} stroke={LINE} strokeWidth="1.2" />
      <path d="M84 46 L96 28 L98 52 Z" fill={BLACK} stroke={LINE} strokeWidth="1.2" />
      <g className="cat-blink">
        <ellipse cx="64" cy="70" rx="4" ry="5" fill="#3f6b3a" />
        <ellipse cx="84" cy="70" rx="4" ry="5" fill="#3f6b3a" />
        <ellipse cx="64" cy="70" rx="1.4" ry="4" fill="#111" />
        <ellipse cx="84" cy="70" rx="1.4" ry="4" fill="#111" />
      </g>
      <path d="M72 80 L74 82 L76 80" stroke={PINK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M74 82 Q70 88 66 86 M74 82 Q78 88 82 86" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <g stroke={LINE} strokeWidth="0.9" opacity="0.7">
        <line x1="58" y1="80" x2="38" y2="76" /><line x1="58" y1="83" x2="38" y2="84" />
        <line x1="90" y1="80" x2="110" y2="76" /><line x1="90" y1="83" x2="110" y2="84" />
      </g>
    </g>
  );
}

export default function CalicoCat({ pose = 'asleep' }) {
  return (
    <svg className={`calico-cat is-${pose}`} viewBox="0 0 200 140" aria-hidden="true">
      <ellipse cx="100" cy="130" rx="80" ry="9" fill="rgba(60, 40, 20, 0.18)" className="cat-shadow" />
      <Asleep />
      <Stretch />
      <Awake />
    </svg>
  );
}
