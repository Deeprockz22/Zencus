import React from 'react';
import FlipText from '../ui/FlipText';
import { SPECTRUM as S } from '../surreal/spectrum';

/*
 * PrismRecord — the vinyl, rebuilt as a piece of digital art.
 *
 * An iridescent record: saturated colour swept around the disc, pressed with
 * grooves, a synthwave-sun label. The disc spins at 33⅓ while you focus, but
 * the reflection of light on it stays still, the way a real record catches
 * a lamp. The tonearm swings in from its rest and tracks toward the label as
 * the session runs, so the arm itself is the progress bar. Tap to play/pause.
 */

const ARM_REST = -32;  // degrees, off the record
const ARM_START = 3;   // needle on the outer groove
const ARM_END = 24;    // needle at the run-out groove

export default function PrismRecord({
  timeLeft,
  totalDuration,
  isRunning,
  mode = 'work',
  getModeTitle,
  formatTime,
  startTimer,
  pauseTimer,
  calmDigits = false,
}) {
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - timeLeft) / totalDuration)) : 0;
  const engaged = isRunning || progress > 0;
  const armAngle = engaged ? ARM_START + (ARM_END - ARM_START) * progress : ARM_REST;

  const title = getModeTitle ? getModeTitle() : 'Focus';
  const time = formatTime ? formatTime(timeLeft) : '';
  const toggle = () => (isRunning ? pauseTimer?.() : startTimer?.());

  return (
    <div className={`prism-record prism-record--${mode} ${isRunning ? 'is-running' : ''}`}>
      <div className="prism-stage">
        <div className="prism-aura" aria-hidden="true" />
        <div
          className="prism-disc-hit"
          role="button"
          tabIndex={0}
          aria-label={`${isRunning ? 'Pause' : 'Play'} the record (${title}, ${time} left)`}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          <div className="prism-disc" aria-hidden="true">
            <div className="prism-grooves" />
            <div className="prism-label">
              <svg viewBox="0 0 200 200" className="prism-label-text">
                <defs>
                  <path id="prismLabelArc" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
                </defs>
                <text>
                  {/* textLength = the arc's circumference, so the words close the circle exactly */}
                  <textPath href="#prismLabelArc" startOffset="0" textLength="486" lengthAdjust="spacing">
                    ZENCUS RECORDS · SIDE A · {title.toUpperCase()} · 33⅓ RPM ·
                  </textPath>
                </text>
              </svg>
              <span className="prism-spindle" />
            </div>
          </div>
          {/* the light on the record doesn't turn with it */}
          <div className="prism-sheen" aria-hidden="true" />
          <div className="prism-readout" aria-hidden="true">
            <span className="prism-readout-mode">{title}</span>
            <FlipText className="prism-readout-time" text={time} still={calmDigits ? 2 : 0} />
          </div>
        </div>

        <svg className="prism-arm" viewBox="0 0 120 420" aria-hidden="true" style={{ transform: `rotate(${armAngle}deg)` }}>
          <defs>
            <linearGradient id="prismArmMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={S.lagoonGlass} />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={S.orchidHaze} />
            </linearGradient>
            <radialGradient id="prismArmPivot" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor={S.dreamberry} />
              <stop offset="100%" stopColor={S.ultraviolet} />
            </radialGradient>
          </defs>
          <circle cx="60" cy="50" r="40" fill="url(#prismArmPivot)" />
          <circle cx="60" cy="50" r="14" fill={S.nightglass} />
          <path d="M60 50 L60 300 Q60 340 40 372" stroke="url(#prismArmMetal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="22" y="362" width="34" height="46" rx="6" transform="rotate(28 39 385)" fill={S.nightglass} stroke="url(#prismArmMetal)" strokeWidth="3" />
          <circle cx="33" cy="398" r="4" fill={S.mintGhost} className="prism-needle-led" />
        </svg>

        <span className="prism-hint" aria-hidden="true">{isRunning ? 'tap the record to pause' : 'tap the record to play'}</span>
      </div>
    </div>
  );
}
