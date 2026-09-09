import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, Radio, Waves, Volume2, VolumeX, Sparkles, Music2, Disc } from 'lucide-react';
import { ambientSoundscapes } from '../../utils/ambientAudio';
import { jazzRadio, JAZZ_STATIONS } from '../../utils/jazzRadioAudio';

export default function AmbientSoundscapes() {
  const [activeSound, setActiveSound] = useState(null); // null | 'window-rain' | 'zen-rain' | 'whitenoise' | 'alphabeats'
  const [volume, setVolume] = useState(35);
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());
  const [showRadioMenu, setShowRadioMenu] = useState(false);

  useEffect(() => {
    return jazzRadio.subscribe((st) => setRadioState(st));
  }, []);

  const toggleSound = (type) => {
    if (activeSound === type) {
      ambientSoundscapes.stop();
      setActiveSound(null);
    } else {
      if (type === 'window-rain') ambientSoundscapes.playWindowRain();
      if (type === 'zen-rain') ambientSoundscapes.playZenRain();
      if (type === 'whitenoise') ambientSoundscapes.playWhiteNoise();
      if (type === 'alphabeats') ambientSoundscapes.playAlphaBeats();
      setActiveSound(type);
    }
  };

  const toggleRadio = (stationId = null) => {
    if (stationId) {
      if (radioState.isPlaying && radioState.currentStation.id === stationId) {
        jazzRadio.pause();
      } else {
        jazzRadio.play(stationId);
      }
    } else {
      jazzRadio.toggle();
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    ambientSoundscapes.setVolume(val / 100);
  };

  return (
    <div className="ambient-soundscape-bar">
      <div className="ambient-label">
        <Sparkles size={14} className="ambient-icon" />
        <span>Focus Soundscapes:</span>
      </div>

      <div className="ambient-buttons-group flex flex-wrap items-center gap-1.5">
        {/* Relaxing Saxophone Radio Button */}
        <button
          className={`ambient-btn ${radioState.isPlaying && radioState.currentStation.category === 'Saxophone' ? 'active' : ''}`}
          onClick={() => toggleRadio('sax-ella')}
          title="Relaxing Saxophone Radio (98.5 FM • Live 24/7)"
        >
          <span className="text-xs">🎷</span>
          <span>Sax Radio</span>
          {radioState.isPlaying && radioState.currentStation.category === 'Saxophone' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping ml-0.5" />
          )}
        </button>

        {/* Relaxing Classic Jazz Radio Button */}
        <button
          className={`ambient-btn ${radioState.isPlaying && radioState.currentStation.id === 'jazz24' ? 'active' : ''}`}
          onClick={() => toggleRadio('jazz24')}
          title="Jazz24 Seattle (Miles Davis, Coltrane & Evans)"
        >
          <span className="text-xs">☕</span>
          <span>Jazz24</span>
          {radioState.isPlaying && radioState.currentStation.id === 'jazz24' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping ml-0.5" />
          )}
        </button>

        {/* Window Rain: Realistic rain droplets tapping on window pane */}
        <button
          className={`ambient-btn ${activeSound === 'window-rain' ? 'active' : ''}`}
          onClick={() => toggleSound('window-rain')}
          title="Window Rain: Crisp rain with distinct droplets tapping on your window"
        >
          <span className="text-xs">🪟</span>
          <span>Window Rain</span>
        </button>

        {/* Zen Rain: Soothing, deep meditative rainfall in a tranquil courtyard */}
        <button
          className={`ambient-btn ${activeSound === 'zen-rain' ? 'active' : ''}`}
          onClick={() => toggleSound('zen-rain')}
          title="Zen Rain: Deep, soothing meditative rainfall in a peaceful garden"
        >
          <CloudRain size={14} />
          <span>Zen Rain</span>
        </button>

        <button
          className={`ambient-btn ${activeSound === 'whitenoise' ? 'active' : ''}`}
          onClick={() => toggleSound('whitenoise')}
          title="Deep White/Brown Noise"
        >
          <Radio size={14} />
          <span>Deep Noise</span>
        </button>

        <button
          className={`ambient-btn ${activeSound === 'alphabeats' ? 'active' : ''}`}
          onClick={() => toggleSound('alphabeats')}
          title="10Hz Binaural Alpha Waves for Flow State"
        >
          <Waves size={14} />
          <span>Alpha Beats</span>
        </button>
      </div>

      {activeSound && (
        <div className="ambient-volume-slider-wrapper">
          <Volume2 size={13} className="vol-icon" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="ambient-vol-slider"
            title={`Volume: ${volume}%`}
          />
        </div>
      )}
    </div>
  );
}
