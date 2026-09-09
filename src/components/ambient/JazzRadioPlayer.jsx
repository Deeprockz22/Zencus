import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { jazzRadio, JAZZ_STATIONS } from '../../utils/jazzRadioAudio';

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
      <div className={`jazz-radio-compact-bar flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] ${className}`}>
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center w-7 h-7 rounded-full bg-[#ff3b30] text-white transition-transform active:scale-95 ${isPlaying ? 'animate-pulse' : ''}`}
          title={isPlaying ? 'Pause Radio' : 'Play Radio'}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] truncate">
              {currentStation.shortName}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {currentStation.freq}
            </span>
          </div>
          <span className="text-[9px] font-mono text-[var(--text-tertiary)] truncate">
            {isPlaying ? '● LIVE ON AIR' : 'CLICK TO TUNE IN'}
          </span>
        </div>

        <button
          onClick={handleNextStation}
          className="p-1 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors ml-auto"
          title="Next Station"
        >
          <SkipForward size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className={`minimal-radio-deck w-full max-w-md mx-auto select-none ${className}`}>
      {/* Sleek Minimalist Main Bar */}
      <div className="minimal-radio-bar flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-[2px_2px_0px_#121212] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.14)]">
        
        {/* Left: Play/Pause Icon Button + Live Station Meta */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={handleToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ${
              isPlaying
                ? 'bg-[#ff3b30] text-white border-[#ff3b30] shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.3)]'
                : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-strong)] hover:border-[#ff3b30] hover:text-[#ff3b30]'
            }`}
            title={isPlaying ? 'Pause Radio' : 'Tune In'}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] truncate">
                {currentStation.shortName}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {currentStation.freq}
              </span>
              {isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping shrink-0" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">
              {isPlaying ? `● LIVE • ${currentStation.bitrate}` : currentStation.genre}
            </div>
          </div>
        </div>

        {/* Right: Previous / Next & Volume */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrevStation}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Previous Station"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={handleNextStation}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Next Station"
          >
            <SkipForward size={13} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-[var(--border-subtle)]">
            <button
              onClick={() => jazzRadio.setVolume(volume > 0 ? 0 : 0.65)}
              className="text-[var(--text-tertiary)] hover:text-[#ff3b30] transition-colors p-0.5"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="minimal-vol-slider w-12 h-1 accent-[#ff3b30] cursor-pointer"
              title={`Radio Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Station Quick-Pills (Single Clean Row) */}
      <div className="minimal-station-chips flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
        {JAZZ_STATIONS.map((st) => {
          const isSelected = currentStation.id === st.id;
          return (
            <button
              key={st.id}
              onClick={() => handleStationSelect(st.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                isSelected
                  ? 'bg-[#ff3b30] text-white font-bold shadow-[1.5px_1.5px_0px_#121212] dark:shadow-[1.5px_1.5px_0px_rgba(255,255,255,0.2)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{st.shortName}</span>
              <span className="opacity-70 text-[9px]">{st.freq}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
