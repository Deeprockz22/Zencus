import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Sun,
  Moon,
  Radio
} from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import FocusLogo from './brand/FocusLogo';
import { COMPANIONS } from '../utils/companionPresets';
import { jazzRadio } from '../utils/jazzRadioAudio';

export default function Header({
  theme = 'light',
  setTheme,
  soundEnabled,
  toggleSound,
  openSettings,
  openFullscreen,
  companionType = 'dino',
  openCompanionPicker,
  toggleSketchMode
}) {
  const isSketch = theme === 'sketch';
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());

  useEffect(() => {
    return jazzRadio.subscribe((st) => setRadioState(st));
  }, []);

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Pet Wardrobe Switcher Button */}
        {!isSketch && (
        <button
          className={`theme-mode-trigger-btn pet-wardrobe-trigger-btn ${companionType === 'none' ? 'pet-disabled' : ''}`}
          onClick={openCompanionPicker}
          title={companionType === 'none' ? 'Adopt a Focus Companion Pet' : 'Change or Remove Active Companion Pet'}
        >
          <span className="theme-mode-icon">
            {companionType === 'none' ? '🐾' : COMPANIONS.find((c) => c.id === companionType)?.icon || '🦖'}
          </span>
          <span className="theme-mode-name">
            {companionType === 'none' ? '+ Add Pet' : 'Pets'}
          </span>
        </button>
        )}

        {/* Crisp Light / Dark Toggle — sketch is light-only, so it has no meaning there */}
        {!isSketch && (
          <MagnetButton
            className="icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Crisp Light Mode' : 'Switch to Crisp Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </MagnetButton>
        )}

        {/* Sound toggle */}
        <MagnetButton
          className="icon-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="muted-icon" />}
        </MagnetButton>
      </div>

      <div className="header-center">
        <button
          type="button"
          className={`brand-container symbol-only brand-sketch-toggle ${isSketch ? 'is-sketch' : ''}`}
          onClick={toggleSketchMode}
          title={isSketch ? 'Zencus — leave Sketch Mode' : 'Zencus — switch to Sketch Mode'}
          aria-label={isSketch ? 'Leave Sketch Mode' : 'Switch to Sketch Mode'}
          aria-pressed={isSketch}
        >
          <FocusLogo size={38} className="brand-logo-icon" />
        </button>
      </div>

      <div className="header-right">
        {/* Quick Relaxing Sax & Jazz Radio Mini Widget */}
        {!isSketch && (
        <button
          type="button"
          className={`header-radio-pill ${radioState.isPlaying ? 'playing' : ''}`}
          onClick={() => jazzRadio.toggle()}
          aria-label={radioState.isPlaying ? 'Pause Radio' : 'Play Radio'}
          title={
            radioState.isPlaying
              ? `Playing: ${radioState.currentStation.name} (Click to pause)`
              : 'Turn on Relaxing Saxophone & Jazz Radio'
          }
        >
          <span>{radioState.isPlaying && radioState.currentStation.category === 'Saxophone' ? '🎷' : '📻'}</span>
          <span className="radio-label">
            {radioState.isPlaying ? radioState.currentStation.shortName : 'Radio'}
          </span>
          {radioState.isPlaying && (
            <div className="header-radio-bars">
              <span className="header-eq-bar" />
              <span className="header-eq-bar bar-2" />
              <span className="header-eq-bar bar-3" />
            </div>
          )}
        </button>
        )}

        <MagnetButton
          className="icon-btn"
          onClick={openFullscreen}
          title="Fullscreen Zen Mode"
          aria-label="Fullscreen Zen Mode"
        >
          <Maximize2 size={18} />
        </MagnetButton>

        <MagnetButton
          className="icon-btn"
          onClick={openSettings}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </MagnetButton>
      </div>
    </header>
  );
}
