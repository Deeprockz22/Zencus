import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  SkipForward,
  Music2,
  Disc3,
  Waves
} from 'lucide-react';
import { jazzRadio, JAZZ_STATIONS } from '../../utils/jazzRadioAudio';
import MagnetButton from '../react-bits/MagnetButton';

export default function JazzRadioPlayer({ className = '', compact = false }) {
  const [radioState, setRadioState] = useState(() => jazzRadio.getState());

  useEffect(() => {
    const unsubscribe = jazzRadio.subscribe((newState) => {
      setRadioState(newState);
    });
    return unsubscribe;
  }, []);

  const { isPlaying, isLoading, currentStation, volume, error } = radioState;

  const handleToggle = () => {
    jazzRadio.toggle();
  };

  const handleStationSelect = (stationId) => {
    jazzRadio.selectStation(stationId);
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
      <div className={`jazz-radio-compact-bar flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-secondary)] border-2 border-[#121212] shadow-[3px_3px_0px_#121212] ${className}`}>
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center w-7 h-7 rounded bg-[#ff3b30] text-white border border-[#121212] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${isPlaying ? 'animate-pulse' : ''}`}
          title={isPlaying ? 'Pause Radio' : 'Play Radio'}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={13} fill="currentColor" />
          ) : (
            <Play size={13} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-black text-[var(--text-primary)] truncate">
              {currentStation.shortName}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#121212] text-white font-bold">
              {currentStation.freq}
            </span>
          </div>
          <span className="text-[9px] font-mono text-[var(--text-secondary)] truncate">
            {isPlaying ? '● ON AIR LIVE' : 'CLICK TO TUNE IN'}
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
    <div className={`vintage-radio-tuner-card w-full max-w-xl mx-auto rounded-lg border-2 border-[#121212] bg-[var(--bg-secondary)] shadow-[6px_6px_0px_#121212] p-4 my-4 select-none ${className}`}>
      {/* Editorial Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] border border-[#121212] shadow-sm animate-pulse" />
          <span className="text-xs font-mono font-black tracking-widest uppercase text-[var(--text-primary)]">
            HI-FI STEREO TUNER • RELAXING JAZZ & SAXOPHONE
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
          <span className={`px-2 py-0.5 rounded border border-[#121212] ${isPlaying ? 'bg-[#22c55e] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
            {isLoading ? 'TUNING IN...' : isPlaying ? '● ON AIR' : 'STANDBY'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#121212] text-white">
            {currentStation.bitrate}
          </span>
        </div>
      </div>

      {/* Analog Frequency Dial & Station Display Screen */}
      <div className="analog-display-screen rounded border-2 border-[#121212] bg-[#141416] text-[#f5f5f0] p-3 mb-3 relative overflow-hidden shadow-inner">
        {/* Background Frequency Grid Scan Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,59,48,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2 font-mono">
                {currentStation.name}
              </h3>
              <span className="text-xs font-mono font-bold text-[#ff3b30] bg-[#ff3b30] bg-opacity-15 px-2 py-0.5 rounded border border-[#ff3b30]">
                {currentStation.freq}
              </span>
            </div>
            <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">
              {currentStation.genre} • {currentStation.city}
            </p>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-1 h-7 pl-1">
            {[45, 80, 60, 100, 70, 90, 50, 85].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-t bg-[#ff3b30] transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (0.5 + Math.random() * 0.5)))}%` : '20%',
                  opacity: isPlaying ? 1 : 0.35,
                  animation: isPlaying ? `bounce 0.8s ease-in-out infinite ${i * 0.1}s` : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Vintage Radio Dial Frequency Scale */}
        <div className="mt-3 pt-2 border-t border-[#333338] flex items-center justify-between text-[9px] font-mono text-[#71717a]">
          <span>88 MHz</span>
          <span className="text-[#a1a1aa]">92</span>
          <span className="text-[#ff3b30] font-bold">98.5 (SAX)</span>
          <span className="text-[#ff3b30] font-bold">101.5 (JAZZ)</span>
          <span className="text-[#a1a1aa]">104</span>
          <span>108 MHz</span>
        </div>
      </div>

      {/* Station Pills Category Selector */}
      <div className="stations-grid grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {JAZZ_STATIONS.map((st) => {
          const isSelected = currentStation.id === st.id;
          return (
            <button
              key={st.id}
              onClick={() => handleStationSelect(st.id)}
              className={`flex flex-col text-left p-2 rounded border-2 transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isSelected
                  ? 'border-[#ff3b30] bg-[#ff3b30] bg-opacity-10 text-[var(--text-primary)] shadow-[2px_2px_0px_#ff3b30]'
                  : 'border-[#121212] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-[2px_2px_0px_#121212]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-[#121212] text-white">
                  {st.freq}
                </span>
                {isSelected && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                )}
              </div>
              <span className="text-xs font-black tracking-tight mt-1 truncate text-[var(--text-primary)]">
                {st.shortName}
              </span>
              <span className="text-[9px] font-mono opacity-75 truncate">
                {st.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Controls Deck: Play/Pause, Next, Volume */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t-2 border-[#121212]">
        <div className="flex items-center gap-2">
          {/* Main Tactile Play/Pause Button */}
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono font-black text-xs uppercase tracking-wider text-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              isPlaying ? 'bg-[#121212] hover:bg-[#27272a]' : 'bg-[#ff3b30] hover:bg-[#e03126]'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause Radio</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Tune In</span>
              </>
            )}
          </button>

          {/* Skip / Next Station Button */}
          <button
            onClick={handleNextStation}
            className="p-2 rounded border-2 border-[#121212] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] shadow-[2px_2px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 text-[var(--text-primary)] transition-all"
            title="Next Station"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => jazzRadio.setVolume(volume > 0 ? 0 : 0.65)}
            className="text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-28 accent-[#ff3b30] cursor-pointer"
            title={`Radio Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] w-7 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
