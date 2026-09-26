import React, { useState, useEffect } from 'react';
import { X, Clock, Database, Info, Download, Upload, Trash2, Sparkles, Palette, Volume2, VolumeX, Music, Compass, Lock, Check } from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import AsciiImage from './ui/AsciiImage';
import { COMPANIONS } from '../utils/companionPresets';
import { sfx, SOUND_PACKS } from '../utils/sfx';
import { Link001, Link002, Link003, Link004, Link005 } from './ui/skiper-ui/skiper40';
import { jazzRadio } from '../utils/jazzRadioAudio';
import { ambientSoundscapes } from '../utils/ambientAudio';

import { Storage } from '../utils/storage';
import { SOUNDTRACK_OPTIONS } from '../utils/soundtracks';
import { pickFamily, themeFamily } from '../themeFamilies';

const CORE_THEMES = [
  { id: 'dark', name: 'Sleek Dark Mode', desc: 'Editorial deep charcoal slate with high contrast' },
  { id: 'light', name: 'Crisp Light Mode', desc: 'Airy warm paper white with sharp typography' },
  { id: 'surreal', name: 'Surreal', desc: 'A painted dream: floating objects and living colour' },
  { id: 'lantern', name: 'Lantern Garden', desc: 'Misty lavender forest by day, blossoms and lanterns by night' },
  { id: 'komorebi', name: 'Komorebi', desc: 'Dappled sun through leaves, washi parchment, wet river slate' }
];

export default function ClassicSettingsModal({
  isOpen,
  onClose,
  timerSettings,
  saveTimerSettings,
  onClearAllData,
  onExportAllData,
  onImportAllData,
  companionType = 'dino',
  onSelectCompanion,
  theme,
  setTheme,
  onLockApp
}) {
  const [focusSoundtrack, setFocusSoundtrack] = useState(() => Storage.get('focus_soundtrack', 'vinyl-lofi'));
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => Storage.get('focus_autoplay_audio', false));
  const [workMins, setWorkMins] = useState(timerSettings.workDuration || 25);
  const [breakMins, setBreakMins] = useState(timerSettings.breakDuration || 5);
  const [longBreakMins, setLongBreakMins] = useState(timerSettings.longBreakDuration || 15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(timerSettings.sessionsBeforeLong || 4);

  // UI SFX States
  const [sfxEnabled, setSfxEnabled] = useState(() => sfx.isEnabled());
  const [sfxVolume, setSfxVolume] = useState(() => sfx.getVolume());
  const [sfxPack, setSfxPack] = useState(() => sfx.getPack());
  const [sfxAdaptive, setSfxAdaptive] = useState(() => sfx.isAdaptive());

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    sfx.setEnabled(next);
    sfx.toggle(next);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setSfxVolume(val);
    sfx.setVolume(val);
  };

  const handleVolumeCommit = () => {
    sfx.play('volume-change');
  };

  const handleToggleAdaptive = () => {
    const next = !sfxAdaptive;
    setSfxAdaptive(next);
    sfx.setAdaptive(next);
    sfx.toggle(next);
  };

  const handleSelectPack = (packId) => {
    setSfxPack(packId);
    sfx.previewPack(packId);
  };

  // Close SettingsModal on Escape key press
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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveTimerSettings({
      workDuration: parseInt(workMins, 10),
      breakDuration: parseInt(breakMins, 10),
      longBreakDuration: parseInt(longBreakMins, 10),
      sessionsBeforeLong: parseInt(sessionsBeforeLong, 10)
    });
    onClose();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportAllData(json);
        alert('Data imported successfully!');
        onClose();
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Preferences & Settings</h2>
          <button className="icon-btn close-modal-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-body">
          {/* Timer Settings Section */}
          <div className="settings-section">
            <div className="settings-section-title">
              <Clock size={16} />
              <span>Timer Configuration</span>
            </div>

            <div className="settings-grid">
              <div className="setting-field">
                <label>Work Duration (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={workMins}
                  onChange={(e) => setWorkMins(e.target.value)}
                  className="setting-input"
                />
              </div>

              <div className="setting-field">
                <label>Short Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={breakMins}
                  onChange={(e) => setBreakMins(e.target.value)}
                  className="setting-input"
                />
              </div>

              <div className="setting-field">
                <label>Long Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={longBreakMins}
                  onChange={(e) => setLongBreakMins(e.target.value)}
                  className="setting-input"
                />
              </div>

              <div className="setting-field">
                <label>Sessions before long break</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={sessionsBeforeLong}
                  onChange={(e) => setSessionsBeforeLong(e.target.value)}
                  className="setting-input"
                />
              </div>
            </div>
          </div>

          {/* Visual Theme Appearance */}
          <div className="settings-section">
            <div className="settings-section-title">
              <Palette size={16} />
              <span>Theme Appearance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CORE_THEMES.map((t) => {
                const family = themeFamily(theme);
                const isActive =
                  t.id === 'surreal' || t.id === 'lantern' || t.id === 'komorebi'
                    ? family === t.id
                    : theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (!setTheme) return;
                      // the art families keep you on your current side of the day
                      setTheme(pickFamily(t.id, theme));
                    }}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all  ${
                      isActive
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] ring-1 ring-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {t.name}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Soundtracks & Ambience */}
          <div className="settings-section">
            <div className="settings-section-title flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Music size={16} />
                <span>Focus Soundtracks & Audio</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Select your preferred focus soundtrack. Procedural options run offline with zero buffering or network delays.
            </p>

            {/* Auto-Play Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--text-secondary)] transition-all mb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Auto-Play on Focus Start
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Automatically start this soundtrack when timer starts, and pause when timer is paused.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoPlayAudio(next);
                  Storage.set('focus_autoplay_audio', next);
                  sfx.play('select');
                }}
                className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer ml-3"
              />
            </label>

            {/* Soundtrack Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUNDTRACK_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setFocusSoundtrack(st.id);
                    Storage.set('focus_soundtrack', st.id);
                    sfx.play('select');
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    focusSoundtrack === st.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] ring-1 ring-[var(--accent-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{st.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{st.name}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{st.desc}</span>
                    </div>
                  </div>
                  {focusSoundtrack === st.id && (
                    <Check size={14} className="text-[var(--accent-primary)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* UI SFX & Sound Design Section */}
          <div className="settings-section">
            <div className="settings-section-title flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Music size={16} />
                <span>UI Sound Effects (UI SFX)</span>
              </div>
              <button
                type="button"
                className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                  sfxEnabled 
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] text-[var(--accent-primary)]' 
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-60'
                }`}
                onClick={handleToggleSfx}
              >
                {sfxEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>{sfxEnabled ? 'SFX Active' : 'Muted'}</span>
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Tactile, semantic audio feedback synthesized dynamically with <strong>uisfx</strong>. Zero network lag, rich sonic feel.
            </p>

            {sfxEnabled && (
              <div className="space-y-4 pt-1">
                {/* Master Volume Slider */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                    <Volume2 size={15} />
                    <span>SFX Volume</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sfxVolume}
                      onChange={handleVolumeChange}
                      onMouseUp={handleVolumeCommit}
                      onTouchEnd={handleVolumeCommit}
                      className="sfx-volume-slider accent-[var(--accent-primary)] cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right">
                      {Math.round(sfxVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Adaptive Feel Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--text-secondary)] transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Adaptive Zen Mode Feel
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Automatically syncs sound feel to the active visualizer (Vinyl, Minimal, or Matrix).
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sfxAdaptive}
                    onChange={handleToggleAdaptive}
                    className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer ml-3"
                  />
                </label>

                {/* 12 Switchable Feels (Packs) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Sonic Personality ({SOUND_PACKS.length} Feels)
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      Click to audition
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SOUND_PACKS.map((p) => {
                      const isActive = sfxPack === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPack(p.id)}
                          className={`flex flex-col text-left p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                            isActive
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] shadow-sm scale-[1.02]'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span
                              className="text-xs font-bold"
                              style={{ color: isActive ? 'var(--accent-primary)' : p.color }}
                            >
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-tight">
                            {p.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Companion Pet Section */}
          <div className="settings-section">
            <div className="settings-section-title">
              <Sparkles size={16} />
              <span>Focus Companion Pet</span>
            </div>

            <div className="settings-companion-card">
              <div className="settings-companion-info">
                <div className="settings-companion-header">
                  <span>{companionType === 'none' ? 'Companion Mascot Disabled' : `${COMPANIONS.find(c => c.id === companionType)?.icon || '🦖'} ${COMPANIONS.find(c => c.id === companionType)?.name || 'Neo'}`}</span>
                  {companionType !== 'none' && (
                    <span className="settings-companion-badge">
                      Active
                    </span>
                  )}
                </div>
                <p className="settings-companion-desc">
                  {companionType === 'none'
                    ? 'Pets are hidden and the UI space is cleanly collapsed with zero distractions.'
                    : 'Interactive motivational pet companion on timer and notes.'}
                </p>
              </div>

              {onSelectCompanion && (
                <button
                  type="button"
                  className={`btn-setting-action ${companionType === 'none' ? '' : 'danger'}`}
                  onClick={() => onSelectCompanion(companionType === 'none' ? 'dino' : 'none')}
                >
                  {companionType === 'none' ? 'Enable Pet' : 'Remove Pet'}
                </button>
              )}
            </div>
          </div>

          {/* Privacy & Dashboard Lock */}
          {onLockApp && (
            <div className="settings-section">
              <div className="settings-section-title flex items-center gap-2">
                <Lock size={16} />
                <span>Security & Privacy</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Lock Dashboard</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Require PIN 1234 to access your notes and timer.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLockApp();
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold hover:border-[var(--text-primary)] transition-all bg-[var(--bg-primary)] text-[var(--text-primary)]"
                >
                  Lock Now
                </button>
              </div>
            </div>
          )}

          {/* Data Backup & Management */}
          <div className="settings-section">
            <div className="settings-section-title">
              <Database size={16} />
              <span>Data & Backup</span>
            </div>

            <div className="settings-actions-group">
              <button
                type="button"
                className="btn-setting-action"
                onClick={onExportAllData}
              >
                <Download size={15} />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="btn-setting-action file-upload-label">
                <Upload size={15} />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                type="button"
                className="btn-setting-action danger"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all tasks, notes, and stats? This cannot be undone.')) {
                    onClearAllData();
                    onClose();
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* About & Creator ASCII Profile Card */}
          <div className="settings-section about-card-section">
            <div className="settings-section-title">
              <Info size={16} />
              <span>About Zencus</span>
            </div>

            <div className="about-ascii-profile-card">
              <AsciiImage
                src="./user-avatar.png"
                width={130}
                height={130}
                charSize={4.5}
                mask="linear-gradient(to bottom, black 40%, transparent 100%)"
                baseMask="linear-gradient(to bottom, transparent 35%, black 100%)"
                className="about-ascii-avatar"
              />
              <div className="about-ascii-details">
                <div className="about-badge-role">CREATOR & DESIGN ENGINEER</div>
                <h4 className="about-creator-name">Jakka Sai Srinivasa Manideep</h4>
                <p className="about-text">
                  Crafting hyper-minimalist ambient productivity suites with real-time WebGL shaders, chiptune audio, and fluid micro-interactions.
                </p>
                <div className="about-meta-row">
                  <span className="about-version">Zencus v2.1.0 • PWA</span>
                  <span className="about-status-pill flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Design Resources & Precedents Section with Skiper UI Animated Links */}
          <div className="settings-section">
            <div className="settings-section-title flex items-center gap-2">
              <Compass size={16} />
              <span>Design Resources & Toolkits</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Crafted with inspiration and components from premier design systems and creative engineering toolkits:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">Micro-Interactions</span>
                <Link001 href="https://skiper-ui.com" className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                  Skiper UI (@skiper40)
                </Link001>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">3D WebGL & MCP</span>
                <Link002 href="https://threeui.com" className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                  ThreeUI (DesignCode)
                </Link002>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">Web Gallery</span>
                <Link003 href="https://godly.website" className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                  Godly.website
                </Link003>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">Delightful UX</span>
                <Link004 href="https://www.designspells.com" className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                  Design Spells
                </Link004>
              </div>
              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">Fluid Shaders</span>
                <Link005 href="https://shadergradient.co" className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                  ShaderGradient Engine
                </Link005>
              </div>
            </div>
          </div>

          <div className="settings-footer">
            <MagnetButton type="submit" className="btn-action primary">
              Save Preferences
            </MagnetButton>
          </div>
        </form>
      </div>
    </div>
  );
}
