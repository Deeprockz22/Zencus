import React, { useEffect } from 'react';
import { X, Check, Sparkles, Heart, MinusCircle } from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import SpotlightCard from '../react-bits/SpotlightCard';
import { COMPANIONS } from '../../utils/companionPresets';
import confetti from 'canvas-confetti';

export default function CompanionPickerModal({
  isOpen,
  onClose,
  activeCompanion = 'dino',
  onSelectCompanion
}) {
  // Close modal on Escape key press
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

  const handleSelect = (companionId) => {
    onSelectCompanion(companionId);
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card companion-picker-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="companion-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="companion-header-title">
            <h2 id="companion-picker-title" className="modal-title">🐾 Focus Pet Wardrobe</h2>
            <span className="companion-header-sub">Choose your loyal productivity companion</span>
          </div>
          <div className="flex items-center gap-2">
            {activeCompanion && activeCompanion !== 'none' && (
              <button
                type="button"
                className="remove-pet-header-btn flex items-center"
                onClick={() => handleSelect('none')}
                title="Remove Pet & Collapse Space"
              >
                <MinusCircle size={13} className="mr-1 inline-block" />
                <span>Remove Pet</span>
              </button>
            )}
            <button className="icon-btn close-modal-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="companion-grid-body">
          {COMPANIONS.map((comp) => {
            const isSelected = activeCompanion === comp.id;

            return (
              <SpotlightCard
                key={comp.id}
                className={`companion-select-card ${isSelected ? 'selected' : ''} ${comp.id === 'none' ? 'none-companion-card' : ''}`}
                onClick={() => handleSelect(comp.id)}
                role="button"
                tabIndex={0}
                aria-label={`${isSelected ? 'Selected' : 'Select'} ${comp.name}, ${comp.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(comp.id);
                  }
                }}
              >
                <div className="companion-card-inner">
                  <div className="companion-card-top">
                    <span className="comp-avatar-icon">{comp.icon}</span>
                    <span className="comp-specialty-badge">{comp.specialty}</span>
                  </div>

                  <div className="companion-info">
                    <h3 className="comp-name">
                      {comp.name} <span className="comp-title">({comp.title})</span>
                    </h3>
                    <p className="comp-desc">{comp.description}</p>
                  </div>

                  <div className="companion-card-bottom">
                    {isSelected ? (
                      <span className="comp-active-pill">
                        <Check size={13} />
                        <span>{comp.id === 'none' ? 'No Pet (Active)' : 'Active Partner'}</span>
                      </span>
                    ) : (
                      <span className="comp-select-prompt">
                        {comp.id === 'none' ? 'Click to Remove Pet' : 'Click to Adopt'}
                      </span>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
