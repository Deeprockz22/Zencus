import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Settings,
  Sun,
  Moon,
  Music2,
  Volume2,
  PictureInPicture2
} from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import FocusLogo from './brand/FocusLogo';
import { jazzRadio } from '../utils/jazzRadioAudio';
import { ambientSoundscapes } from '../utils/ambientAudio';
import { isArtTheme, isNightTheme, toggleDayNight } from '../themeFamilies';

export default function Header({
  theme = 'dark',
  setTheme,
  openSettings,
  openFullscreen,
  openMiniTimer,
  miniTimerOpen = false,
  soundEnabled,
  toggleSound,
}) {
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());
  const [ambientActive, setAmbientActive] = useState(() => ambientSoundscapes.activeType);

  useEffect(() => {
    return jazzRadio.subscribe((st) => setRadioState(st));
  }, []);

  const toggleTheme = () => {
    if (setTheme) {
      // day ↔ night within the current family (Crisp, Surreal or Lantern)
      setTheme(toggleDayNight(theme));
    }
  };

  const isAudioPlaying = radioState.isPlaying || Boolean(ambientActive);

  const toggleQuickAudio = () => {
    if (radioState.isPlaying) {
      jazzRadio.pause();
    } else if (ambientActive) {
      ambientSoundscapes.stop();
      setAmbientActive(null);
    } else {
      // Start relaxing vinyl jazz
      jazzRadio.play('vinyl-lofi');
    }
  };

  return (
    <header className="app-header">
      {/* Left: Brand Identity */}
      <div className="header-left">
        <div className="header-brand-group flex items-center gap-2.5 select-none">
          <FocusLogo size={32} className="brand-logo-icon" />
          <span className="brand-wordmark font-bold text-sm tracking-tight text-[var(--text-primary)]">
            Zencus
          </span>
        </div>
      </div>

      {/* Right: Streamlined Control Suite */}
      <div className="header-right flex items-center gap-1.5 sm:gap-2">
        {/* Quick Audio / Lo-Fi Soundtrack Pill */}
        <button
          type="button"
          className={`header-radio-pill ${isAudioPlaying ? 'playing' : ''}`}
          onClick={toggleQuickAudio}
          aria-label={isAudioPlaying ? 'Pause Audio' : 'Play Lo-Fi Soundtrack'}
          title={
            isAudioPlaying
              ? `Playing: ${radioState.isPlaying ? radioState.currentStation.shortName : ambientActive} (Click to pause)`
              : 'Play Focus Lo-Fi Soundtrack'
          }
        >
          <Music2 size={13} className={isAudioPlaying ? 'text-white shrink-0' : 'text-[var(--text-secondary)] shrink-0'} />
          <span className="radio-label text-xs font-medium">
            {isAudioPlaying ? (radioState.isPlaying ? radioState.currentStation.shortName : 'Ambient') : 'Audio'}
          </span>
          {isAudioPlaying && (
            <div className="header-radio-bars">
              <span className="header-eq-bar" />
              <span className="header-eq-bar bar-2" />
              <span className="header-eq-bar bar-3" />
            </div>
          )}
        </button>

        {/* Crisp Light / Dark Toggle */}
        {setTheme && (
          <MagnetButton
            className="icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={isArtTheme(theme) ? (isNightTheme(theme) ? 'Switch to day' : 'Switch to night') : theme === 'dark' ? 'Switch to Crisp Light Mode' : 'Switch to Crisp Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isNightTheme(theme) ? <Sun size={17} /> : <Moon size={17} />}
          </MagnetButton>
        )}

        {/* Fullscreen Zen Focus Mode */}
        {openFullscreen && (
          <MagnetButton
            className="icon-btn"
            onClick={openFullscreen}
            title="Fullscreen Zen Mode (F)"
            aria-label="Fullscreen Zen Mode"
          >
            <Maximize2 size={17} />
          </MagnetButton>
        )}

        {/* Floating mini timer (Document Picture-in-Picture; Chrome/Edge only) */}
        {openMiniTimer && (
          <MagnetButton
            className={`icon-btn ${miniTimerOpen ? 'is-active' : ''}`}
            onClick={openMiniTimer}
            title={miniTimerOpen ? 'Close mini timer' : 'Float a mini timer over other windows'}
            aria-label={miniTimerOpen ? 'Close mini timer' : 'Open mini timer'}
            aria-pressed={miniTimerOpen}
          >
            <PictureInPicture2 size={17} />
          </MagnetButton>
        )}

        {/* Settings Modal Trigger */}
        {openSettings && (
          <MagnetButton
            className="icon-btn"
            onClick={openSettings}
            title="Settings & Soundtracks"
            aria-label="Settings"
          >
            <Settings size={17} />
          </MagnetButton>
        )}
      </div>
    </header>
  );
}

