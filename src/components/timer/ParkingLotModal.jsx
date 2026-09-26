import React, { useState, useEffect, useRef } from 'react';
import { X, Feather, Check, AlertCircle } from 'lucide-react';
import './parking-lot.css';

/**
 * Stray Thought Parking Lot & Distraction Tally (#5 & #4)
 * 
 * Protects flow by giving intrusive thoughts a 3-second parking space.
 * Press Enter to seal the thought until break; press Escape to dismiss.
 */
export default function ParkingLotModal({
  isOpen,
  onClose,
  onParkThought,
  onTallyDistraction,
  distractionCount = 0,
  parkedThoughts = []
}) {
  const [thought, setThought] = useState('');
  const [justParked, setJustParked] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setThought('');
      setJustParked(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = thought.trim();
    if (!trimmed) {
      // Just record a quick distraction tally
      onTallyDistraction();
      setJustParked(true);
      setTimeout(() => {
        onClose();
      }, 500);
      return;
    }

    onParkThought(trimmed);
    setJustParked(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="parking-lot-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="parking-lot-card" onClick={(e) => e.stopPropagation()}>
        <div className="parking-lot-header">
          <div className="parking-lot-badge">
            <Feather size={14} className="parking-lot-icon" />
            <span>Stray Thought Tray</span>
          </div>
          <button
            type="button"
            className="parking-lot-close"
            onClick={onClose}
            aria-label="Close tray"
          >
            <X size={15} />
          </button>
        </div>

        {justParked ? (
          <div className="parking-lot-success">
            <Check size={18} className="parking-lot-check" />
            <span>Thought sealed until break. Back to flow.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="parking-lot-form">
            <p className="parking-lot-prompt">
              A leaf on the stream. Drop your intrusive thought here so your mind can let it go.
            </p>
            <div className="parking-lot-input-row">
              <input
                ref={inputRef}
                type="text"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g. Call dentist, reply to email, buy groceries…"
                maxLength={120}
                className="parking-lot-input"
              />
              <button type="submit" className="parking-lot-submit">
                Park
              </button>
            </div>
            <div className="parking-lot-footer">
              <span className="parking-lot-hint">Press <strong>Enter</strong> to park · <strong>Esc</strong> to return</span>
              <button
                type="button"
                className="parking-lot-tally-btn"
                onClick={() => {
                  onTallyDistraction();
                  setJustParked(true);
                  setTimeout(() => onClose(), 400);
                }}
              >
                +1 Tally Distraction ({distractionCount})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
