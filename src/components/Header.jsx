import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import FocusLogo from './brand/FocusLogo';
import { COMPANIONS } from '../utils/companionPresets';

export default function Header({
  theme = 'light',
  setTheme,
  soundEnabled,
  toggleSound,
  openSettings,
  openFullscreen,
  companionType = 'dino',
  openCompanionPicker
}) {
  const toggleTheme = () => {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Pet Wardrobe Switcher Button */}
        <button
          className="theme-mode-trigger-btn pet-wardrobe-trigger-btn"
          onClick={openCompanionPicker}
          title="Change Active Companion Pet"
        >
          <span className="theme-mode-icon">
            {COMPANIONS.find((c) => c.id === companionType)?.icon || '🦖'}
          </span>
          <span className="theme-mode-name">Pets</span>
        </button>

        {/* Crisp Light / Dark Toggle Button */}
        <MagnetButton
          className="icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Crisp Light Mode' : 'Switch to Crisp Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </MagnetButton>

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
        <div className="brand-container symbol-only" title="Zencus">
          <FocusLogo size={38} className="brand-logo-icon" />
        </div>
      </div>

      <div className="header-right">
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
