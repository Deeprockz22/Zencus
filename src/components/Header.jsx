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
  openCompanionPicker
}) {
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
        {/* Quick Relaxing Sax & Jazz Radio Mini Widget */}
        <button
          className={`header-radio-pill flex items-center gap-1.5 px-2.5 py-1 rounded border-2 border-[#121212] font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 ${
            radioState.isPlaying
              ? 'bg-[#ff3b30] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => jazzRadio.toggle()}
          title={
            radioState.isPlaying
              ? `Playing: ${radioState.currentStation.name} (Click to pause)`
              : 'Turn on Relaxing Saxophone & Jazz Radio'
          }
        >
          <span>{radioState.isPlaying && radioState.currentStation.category === 'Saxophone' ? '🎷' : '📻'}</span>
          <span className="hidden sm:inline text-[11px]">
            {radioState.isPlaying ? radioState.currentStation.shortName : 'Radio'}
          </span>
          {radioState.isPlaying && (
            <div className="flex items-end gap-0.5 h-3 ml-0.5">
              <span className="w-0.5 h-full bg-white animate-pulse" />
              <span className="w-0.5 h-2/3 bg-white animate-pulse delay-75" />
              <span className="w-0.5 h-4/5 bg-white animate-pulse delay-150" />
            </div>
          )}
        </button>

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
