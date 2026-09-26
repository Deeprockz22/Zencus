// src/components/timer/MindfulBreathGuide.jsx
// Foundation for Idea #29: Mindful Breath Guide on Breaks
// A serene, featherweight breathing guide that gracefully assists break-time relaxation.

import React, { useState } from 'react';
import useBreathGuide from '../../hooks/useBreathGuide';
import './mindful-breath-guide.css';

export default function MindfulBreathGuide({
  isActive = false,
  onDismiss,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(false);
  const breath = useBreathGuide(isActive && !dismissed);

  if (!isActive || dismissed) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`breath-guide-container breath-phase-${breath.phase} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Breathing guide: ${breath.label}`}
      style={{ '--breath-scale': breath.scale }}
    >
      <div className="breath-ring-wrapper" style={{ transform: `scale(${breath.scale})` }}>
        <div className="breath-ring-halo" />
        <div className="breath-ring-core" />
      </div>

      <div className="breath-label-badge">
        <span className="breath-phase-text">{breath.label}</span>
      </div>

      <button
        type="button"
        className="breath-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Dismiss breath guide"
        title="Dismiss breathing guide"
      >
        ×
      </button>
    </div>
  );
}
