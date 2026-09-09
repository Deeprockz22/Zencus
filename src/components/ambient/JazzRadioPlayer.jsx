import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Radio
} from 'lucide-react';
import { jazzRadio, JAZZ_STATIONS } from '../../utils/jazzRadioAudio';
import ShinyButton from '../ui/ShinyButton';
import EqualizerWave from '../ui/EqualizerWave';

export default function JazzRadioPlayer({ className = '', compact = false }) {
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());

  useEffect(() => {
    return jazzRadio.subscribe((newState) => {
      setRadioState(newState);
    });
  }, []);

  const { isPlaying, isLoading, currentStation, volume } = radioState;

  const handleToggle = () => {
    jazzRadio.toggle();
  };

  const handleStationSelect = (stationId) => {
    jazzRadio.selectStation(stationId);
  };

  const handlePrevStation = () => {
    const currentIndex = JAZZ_STATIONS.findIndex((s) => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + JAZZ_STATIONS.length) % JAZZ_STATIONS.length;
    jazzRadio.selectStation(JAZZ_STATIONS[prevIndex].id);
  };

  const handleNextStation = () => {
    const currentIndex = JAZZ_STATIONS.findIndex((s) => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % JAZZ_STATIONS.length;
    jazzRadio.selectStation(JAZZ_STATIONS[nextIndex].id);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    jazzRadio.setVolume(val);
  };

  if (compact) {
    return (
      <div className={`jazz-radio-compact-bar ${className}`}>
        <ShinyButton
          variant="primary"
          size="sm"
          onClick={handleToggle}
          title={isPlaying ? 'Pause Radio' : 'Play Radio'}
          className="radio-compact-play-btn"
        >
          {isLoading ? (
            <div className="radio-spinner" />
          ) : isPlaying ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" style={{ marginLeft: 1 }} />
          )}
        </ShinyButton>

        <div className="radio-compact-meta">
          <div className="radio-compact-title-row">
            <span className="radio-compact-name">{currentStation.shortName}</span>
            <span className="radio-freq-pill">{currentStation.freq}</span>
            {isPlaying && <EqualizerWave isPlaying={true} barCount={3} />}
          </div>
          <span className="radio-compact-status">
            {isPlaying ? 'LIVE ON AIR' : 'CLICK TO TUNE IN'}
          </span>
        </div>

        <ShinyButton
          variant="icon"
          size="sm"
          onClick={handleNextStation}
          title="Next Station"
          className="radio-compact-next-btn"
        >
          <SkipForward size={13} />
        </ShinyButton>
      </div>
    );
  }

  return (
    <div className={`minimal-radio-deck ${className}`}>
      {/* Sleek Minimalist Hi-Fi Console */}
      <div className="minimal-radio-bar">
        
        {/* Left Wing: Shiny Play/Pause Hero Button + Live Station Meta */}
        <div className="radio-left-wing">
          <ShinyButton
            variant={isPlaying ? 'primary' : 'default'}
            size="md"
            onClick={handleToggle}
            active={isPlaying}
            title={isPlaying ? 'Pause Broadcast' : 'Tune In (Live 24/7)'}
            className="radio-main-play-btn"
          >
            {isLoading ? (
              <div className="radio-spinner" />
            ) : isPlaying ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" style={{ marginLeft: 2 }} />
            )}
          </ShinyButton>

          <div className="radio-meta-info">
            <div className="radio-station-title">
              <span className="radio-station-name">{currentStation.shortName}</span>
              <span className="radio-freq-badge">{currentStation.freq}</span>
              {isPlaying && <EqualizerWave isPlaying={true} barCount={3} />}
            </div>
            <div className="radio-genre-sub">
              {isPlaying ? (
                <span className="radio-live-indicator">
                  <span className="radio-live-dot" /> LIVE • {currentStation.bitrate}
                </span>
              ) : (
                currentStation.genre
              )}
            </div>
          </div>
        </div>

        {/* Right Wing: Skip Controls & Volume */}
        <div className="radio-right-wing">
          <ShinyButton
            variant="icon"
            size="sm"
            onClick={handlePrevStation}
            title="Previous Station"
            className="radio-nav-btn"
          >
            <SkipBack size={14} />
          </ShinyButton>

          <ShinyButton
            variant="icon"
            size="sm"
            onClick={handleNextStation}
            title="Next Station"
            className="radio-nav-btn"
          >
            <SkipForward size={14} />
          </ShinyButton>

          {/* Volume Control Slider */}
          <div className="radio-volume-section">
            <ShinyButton
              variant="icon"
              size="sm"
              onClick={() => jazzRadio.setVolume(volume > 0 ? 0 : 0.65)}
              title={volume === 0 ? 'Unmute' : 'Mute'}
              className="radio-mute-btn"
            >
              {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </ShinyButton>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="minimal-vol-slider"
              title={`Radio Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Station Quick-Pills (Single Clean Row with React Bits Shiny Pills) */}
      <div className="minimal-station-chips">
        {JAZZ_STATIONS.map((st) => {
          const isSelected = currentStation.id === st.id;
          return (
            <ShinyButton
              key={st.id}
              variant="pill"
              size="sm"
              active={isSelected}
              onClick={() => handleStationSelect(st.id)}
              className="radio-station-chip"
              title={`Tune to ${st.name} (${st.freq})`}
            >
              <span className="radio-chip-name">{st.shortName}</span>
              <span className="radio-chip-freq">{st.freq}</span>
              {isSelected && isPlaying && (
                <EqualizerWave isPlaying={true} barCount={2} className="ml-0.5" />
              )}
            </ShinyButton>
          );
        })}
      </div>
    </div>
  );
}
