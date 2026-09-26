// src/components/ui/ShortcutSheetModal.jsx
// Foundation for Idea #17: Minimalist Keybinding Discovery (?)
// A serene, unbleached washi slate card displaying essential keyboard shortcuts.

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import './shortcut-sheet.css';

export const SHORTCUTS = [
  { key: 'Space', desc: 'Toggle timer play / pause' },
  { key: 'P', desc: 'Stray thought parking lot drawer' },
  { key: 'D', desc: 'Quick distraction tally (+1)' },
  { key: 'F', desc: 'Toggle Fullscreen Zen view' },
  { key: 'Esc', desc: 'Dismiss active drawer or modal' },
  { key: '?', desc: 'Toggle this keyboard shortcut guide' },
];

export default function ShortcutSheetModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape' || (e.key === '?' && !e.target.closest('input, textarea'))) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="shortcut-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts">
      <div className="shortcut-sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-header">
          <div className="shortcut-title-group">
            <Keyboard size={16} className="shortcut-icon" />
            <h3 className="shortcut-title">Keyboard Shortcuts</h3>
          </div>
          <button className="shortcut-close-btn" onClick={onClose} aria-label="Close shortcuts">
            <X size={15} />
          </button>
        </div>

        <ul className="shortcut-list">
          {SHORTCUTS.map((item) => (
            <li key={item.key} className="shortcut-row">
              <span className="shortcut-desc">{item.desc}</span>
              <kbd className="shortcut-kbd">{item.key}</kbd>
            </li>
          ))}
        </ul>

        <div className="shortcut-footer">
          <span>Crafted for frictionless, mouse-free flow</span>
        </div>
      </div>
    </div>
  );
}
