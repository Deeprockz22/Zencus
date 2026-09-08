import React from 'react';

/**
 * LottieAnimation Component
 * Renders smooth vector micro-animations for empty states, celebrations, and interactive UI feedback.
 */
export default function LottieAnimation({
  type = 'empty-notes',
  size = 140,
  className = '',
  text = null,
  subtext = null
}) {
  const renderGraphic = () => {
    switch (type) {
      case 'empty-notes':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lottie-svg-animated"
          >
            <style>
              {`
                @keyframes floatBook {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-6px) rotate(-1deg); }
                }
                @keyframes floatPen {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-10px) rotate(4deg); }
                }
                @keyframes pulseGlow {
                  0%, 100% { opacity: 0.25; transform: scale(0.95); }
                  50% { opacity: 0.6; transform: scale(1.05); }
                }
                @keyframes particleFloat1 {
                  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                  50% { transform: translate(4px, -8px) scale(1.3); opacity: 0.3; }
                }
                @keyframes particleFloat2 {
                  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                  50% { transform: translate(-6px, -10px) scale(1.2); opacity: 0.2; }
                }
                .lottie-book { animation: floatBook 4s ease-in-out infinite; transform-origin: center; }
                .lottie-pen { animation: floatPen 3s ease-in-out infinite; transform-origin: center; }
                .lottie-glow { animation: pulseGlow 4s ease-in-out infinite; transform-origin: center; }
                .lottie-p1 { animation: particleFloat1 2.5s ease-in-out infinite; }
                .lottie-p2 { animation: particleFloat2 3.2s ease-in-out infinite; }
              `}
            </style>

            {/* Ambient Glow */}
            <circle
              cx="80"
              cy="85"
              r="48"
              fill="url(#paint0_radial_notes)"
              className="lottie-glow"
            />

            {/* Notepad Base */}
            <g className="lottie-book">
              {/* Card Base */}
              <rect
                x="44"
                y="38"
                width="72"
                height="88"
                rx="10"
                fill="var(--bg-card, #121216)"
                stroke="var(--border-subtle, rgba(255,255,255,0.12))"
                strokeWidth="1.5"
              />

              {/* Spine Accent */}
              <rect
                x="44"
                y="38"
                width="14"
                height="88"
                rx="10"
                fill="var(--accent-color, #70a1ff)"
                fillOpacity="0.25"
              />
              <line
                x1="58"
                y1="38"
                x2="58"
                y2="126"
                stroke="var(--border-subtle, rgba(255,255,255,0.1))"
                strokeWidth="1.5"
              />

              {/* Note Content Lines */}
              <rect x="66" y="52" width="38" height="3" rx="1.5" fill="var(--text-primary, #ffffff)" fillOpacity="0.7" />
              <rect x="66" y="62" width="42" height="2.5" rx="1.25" fill="var(--text-secondary, #94a3b8)" fillOpacity="0.4" />
              <rect x="66" y="71" width="32" height="2.5" rx="1.25" fill="var(--text-secondary, #94a3b8)" fillOpacity="0.4" />
              <rect x="66" y="80" width="39" height="2.5" rx="1.25" fill="var(--text-secondary, #94a3b8)" fillOpacity="0.4" />

              {/* Checkmark Tag */}
              <circle cx="70" cy="98" r="4" fill="var(--accent-color, #70a1ff)" fillOpacity="0.3" />
              <path d="M68.5 98L69.5 99L71.5 97" stroke="var(--accent-color, #70a1ff)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="78" y="96.5" width="26" height="3" rx="1.5" fill="var(--text-secondary, #94a3b8)" fillOpacity="0.5" />
            </g>

            {/* Floating Quill / Pen */}
            <g className="lottie-pen">
              <rect
                x="108"
                y="32"
                width="6"
                height="34"
                rx="3"
                transform="rotate(28 108 32)"
                fill="var(--accent-color, #70a1ff)"
              />
              <polygon
                points="119.5,63.5 123.5,61.5 125,67.5"
                fill="var(--accent-color, #ffaa00)"
              />
            </g>

            {/* Floating Zen Particles */}
            <circle cx="36" cy="50" r="2.5" fill="var(--accent-color, #70a1ff)" className="lottie-p1" />
            <circle cx="128" cy="94" r="2" fill="var(--accent-color, #ff4757)" className="lottie-p2" />
            <circle cx="48" cy="116" r="1.5" fill="var(--accent-color, #2ed573)" className="lottie-p1" />

            <defs>
              <radialGradient
                id="paint0_radial_notes"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(80 85) rotate(90) scale(48)"
              >
                <stop stopColor="var(--accent-color, #70a1ff)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--accent-color, #70a1ff)" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        );

      case 'empty-search':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lottie-svg-animated"
          >
            <style>
              {`
                @keyframes scanSearch {
                  0%, 100% { transform: translate(0, 0) rotate(0deg); }
                  25% { transform: translate(6px, -4px) rotate(4deg); }
                  75% { transform: translate(-6px, 4px) rotate(-4deg); }
                }
                @keyframes radarWave {
                  0% { r: 16px; opacity: 0.8; stroke-width: 2px; }
                  100% { r: 44px; opacity: 0; stroke-width: 0.5px; }
                }
                .lottie-glass { animation: scanSearch 4s ease-in-out infinite; transform-origin: 75px 75px; }
                .lottie-wave { animation: radarWave 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
              `}
            </style>
            <circle cx="75" cy="75" r="22" stroke="var(--accent-color, #70a1ff)" fill="none" className="lottie-wave" />
            <g className="lottie-glass">
              <circle
                cx="75"
                cy="75"
                r="28"
                fill="var(--bg-card, #16161a)"
                stroke="var(--accent-color, #70a1ff)"
                strokeWidth="2.5"
              />
              <circle cx="75" cy="75" r="18" fill="var(--accent-color, #70a1ff)" fillOpacity="0.1" />
              <line
                x1="95"
                y1="95"
                x2="120"
                y2="120"
                stroke="var(--accent-color, #70a1ff)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path d="M68 68L78 78M78 68L68 78" stroke="var(--text-secondary, #64748b)" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'trash-empty':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lottie-svg-animated"
          >
            <style>
              {`
                @keyframes lidBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px) rotate(-3deg); }
                }
                .lottie-lid { animation: lidBounce 3s ease-in-out infinite; transform-origin: 80px 50px; }
              `}
            </style>
            <rect x="52" y="60" width="56" height="64" rx="8" fill="var(--bg-card, #16161a)" stroke="var(--border-subtle, rgba(255,255,255,0.15))" strokeWidth="1.5" />
            <line x1="68" y1="74" x2="68" y2="108" stroke="var(--text-secondary, #64748b)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="80" y1="74" x2="80" y2="108" stroke="var(--text-secondary, #64748b)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="92" y1="74" x2="92" y2="108" stroke="var(--text-secondary, #64748b)" strokeWidth="1.5" strokeLinecap="round" />
            <g className="lottie-lid">
              <rect x="46" y="50" width="68" height="6" rx="3" fill="var(--accent-color, #ff4757)" />
              <path d="M72 50V44C72 42.8954 72.8954 42 74 42H86C87.1046 42 88 42.8954 88 44V50" stroke="var(--accent-color, #ff4757)" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'empty-tasks':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lottie-svg-animated"
          >
            <style>
              {`
                @keyframes floatClipboard {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-5px) rotate(1deg); }
                }
                @keyframes checkPulse {
                  0%, 100% { transform: scale(1); opacity: 0.9; }
                  50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes sparklePop {
                  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
                  50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
                }
                .lottie-board { animation: floatClipboard 4s ease-in-out infinite; transform-origin: center; }
                .lottie-check-glow { animation: checkPulse 2.8s ease-in-out infinite; transform-origin: 58px 65px; }
                .lottie-sparkle { animation: sparklePop 2.2s ease-in-out infinite; transform-origin: center; }
              `}
            </style>
            <g className="lottie-board">
              <rect x="42" y="36" width="76" height="92" rx="12" fill="var(--bg-card, #121216)" stroke="var(--border-subtle, rgba(255,255,255,0.12))" strokeWidth="1.5" />
              {/* Header Clip */}
              <rect x="62" y="28" width="36" height="14" rx="5" fill="var(--accent-primary, #ffffff)" fillOpacity="0.85" />
              <circle cx="80" cy="34" r="2.5" fill="var(--bg-primary, #09090b)" />
              {/* Row 1 - Completed */}
              <circle cx="58" cy="62" r="6" fill="#22c55e" fillOpacity="0.2" className="lottie-check-glow" />
              <path d="M55 62L57.5 64.5L61.5 59.5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="68" y1="62" x2="104" y2="62" stroke="var(--text-secondary, #94a3b8)" strokeWidth="2" strokeLinecap="round" strokeDasharray="36" strokeOpacity="0.5" />
              {/* Row 2 - In progress */}
              <circle cx="58" cy="80" r="6" stroke="var(--border-active, rgba(255,255,255,0.3))" strokeWidth="1.5" fill="none" />
              <line x1="68" y1="80" x2="108" y2="80" stroke="var(--text-primary, #f4f4f5)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
              {/* Row 3 - Pending */}
              <circle cx="58" cy="98" r="6" stroke="var(--border-subtle, rgba(255,255,255,0.2))" strokeWidth="1.5" fill="none" />
              <line x1="68" y1="98" x2="96" y2="98" stroke="var(--text-secondary, #94a3b8)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
            </g>
            {/* Sparkles */}
            <path d="M126 44L128 50L134 52L128 54L126 60L124 54L118 52L124 50Z" fill="#eab308" className="lottie-sparkle" />
            <circle cx="32" cy="90" r="2" fill="#38bdf8" className="lottie-sparkle" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`lottie-animation-container flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {renderGraphic()}
      {text && <h4 className="lottie-text font-semibold text-lg mt-3 text-[var(--text-primary)]">{text}</h4>}
      {subtext && <p className="lottie-subtext text-xs text-[var(--text-secondary)] mt-1 max-w-[280px]">{subtext}</p>}
    </div>
  );
}
