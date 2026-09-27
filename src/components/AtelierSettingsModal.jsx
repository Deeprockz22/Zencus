import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Database, Info, Download, Upload, Trash2, Sparkles, Palette, Volume2, VolumeX, Music, Compass, Check, Minus, Plus } from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import { COMPANIONS } from '../utils/companionPresets';
import { sfx, SOUND_PACKS } from '../utils/sfx';
import { Link001, Link002, Link003, Link004, Link005 } from './ui/skiper-ui/skiper40';
import { Storage } from '../utils/storage';
import { SOUNDTRACK_OPTIONS } from '../utils/soundtracks';
import { themeFamily, pickFamily } from '../themeFamilies';
import './settings-atelier.css';

/*
 * Settings — "The Atelier" (the Surreal theme's settings page).
 * A studio rather than a form: a chapter rail on the left (each chapter owns
 * one colour of the Dream Spectrum), and one long, calm page on the right.
 * Durations are big steppers with a live, to-scale drawing of the cycle they
 * produce; themes are chosen by looking at them; switches are switches.
 */

const CORE_THEMES = [
  { id: 'light', name: 'Crisp Light', desc: 'Clean daylight paper and sharp type' },
  { id: 'dark', name: 'Crisp Dark', desc: 'Deep charcoal with high contrast' },
  { id: 'surreal', name: 'Surreal', desc: 'A painted dream: floating objects and living colour. The moon button switches day and night.' },
  { id: 'lantern', name: 'Lantern Garden', desc: 'A misty lavender forest by day, blossoms and paper lanterns by night. Butterflies visit.' },
  { id: 'komorebi', name: 'Komorebi', desc: 'Dappled sun through leaves, unbleached washi, river slate, and a snoozing calico.' }
];


const CHAPTERS = [
  { id: 'rhythm', label: 'Rhythm', hue: 'dreamberry', Icon: Clock },
  { id: 'world', label: 'World', hue: 'ultraviolet', Icon: Palette },
  { id: 'sound', label: 'Sound', hue: 'lagoon', Icon: Music },
  { id: 'companion', label: 'Companion', hue: 'mint', Icon: Sparkles },
  { id: 'keep', label: 'Keep', hue: 'solar', Icon: Database },
  { id: 'about', label: 'About', hue: 'ember', Icon: Info },
];

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`atl-switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="atl-switch-knob" />
    </button>
  );
}

function Stepper({ label, value, onChange, min, max, unit = 'min', hue }) {
  // functional update, so quick repeated clicks accumulate instead of reusing a stale value
  const step = (delta) =>
    onChange((prev) => String(Math.min(max, Math.max(min, (parseInt(prev, 10) || 0) + delta))));
  const id = `atl-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className={`atl-stepper atl-hue-${hue}`}>
      <label htmlFor={id} className="atl-stepper-label">{label}</label>
      <div className="atl-stepper-row">
        <button type="button" className="atl-step-btn" onClick={() => step(-1)} aria-label={`Decrease ${label}`}>
          <Minus size={14} />
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="setting-input atl-stepper-input"
        />
        <button type="button" className="atl-step-btn" onClick={() => step(1)} aria-label={`Increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
      <span className="atl-stepper-unit">{unit}</span>
    </div>
  );
}

export default function AtelierSettingsModal({
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
  setTheme
}) {
  const [focusSoundtrack, setFocusSoundtrack] = useState(() => Storage.get('focus_soundtrack', 'vinyl-lofi'));
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => Storage.get('focus_autoplay_audio', false));
  const [workMins, setWorkMins] = useState(timerSettings.workDuration || 25);
  const [breakMins, setBreakMins] = useState(timerSettings.breakDuration || 5);
  const [longBreakMins, setLongBreakMins] = useState(timerSettings.longBreakDuration || 15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(timerSettings.sessionsBeforeLong || 4);
  const [activeChapter, setActiveChapter] = useState('rhythm');
  const scrollRef = useRef(null);
  const railRef = useRef(null);

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

  // The chapter rail follows the reader: the active chapter is the last one
  // whose heading has passed a line near the top of the page.
  useEffect(() => {
    if (!isOpen) return undefined;
    const root = scrollRef.current;
    if (!root) return undefined;
    // seven sections: cheap enough to measure on every scroll event directly
    const update = () => {
      const sections = [...root.querySelectorAll('[data-chapter]')];
      if (!sections.length) return;
      const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
      if (atEnd) {
        setActiveChapter(sections[sections.length - 1].dataset.chapter);
        return;
      }
      const line = root.getBoundingClientRect().top + 90;
      let current = sections[0].dataset.chapter;
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= line) current = el.dataset.chapter;
      });
      setActiveChapter(current);
    };
    root.addEventListener('scroll', update, { passive: true });
    return () => root.removeEventListener('scroll', update);
  }, [isOpen]);

  // On phones the rail is a horizontal strip: keep the active chip in view.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const item = rail.querySelector('.atl-rail-item.is-active');
    if (item) rail.scrollTo?.({ left: item.offsetLeft - 14, behavior: 'smooth' });
  }, [activeChapter]);

  if (!isOpen) return null;

  const goTo = (id) => {
    const el = scrollRef.current?.querySelector(`[data-chapter="${id}"]`);
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    setActiveChapter(id);
  };

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

  // A to-scale drawing of one full cycle.
  const w = Math.max(1, parseInt(workMins, 10) || 0);
  const b = Math.max(1, parseInt(breakMins, 10) || 0);
  const lb = Math.max(1, parseInt(longBreakMins, 10) || 0);
  const rounds = Math.min(12, Math.max(1, parseInt(sessionsBeforeLong, 10) || 1));
  const cycle = [];
  for (let i = 0; i < rounds; i++) {
    cycle.push({ kind: 'focus', mins: w });
    cycle.push(i < rounds - 1 ? { kind: 'short', mins: b } : { kind: 'long', mins: lb });
  }
  const cycleTotal = cycle.reduce((sum, s) => sum + s.mins, 0);
  const focusTotal = w * rounds;
  const fmtHours = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`.trim() : `${m}m`);

  const companion = COMPANIONS.find((c) => c.id === companionType);

  return (
    <div className="modal-backdrop atl-backdrop" onClick={onClose}>
      <div className="modal-card settings-modal atl-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="atl-title">
        <div className="modal-header atl-header">
          <div>
            <h2 className="modal-title" id="atl-title">Preferences & Settings</h2>
            <p className="atl-subtitle">Tune the dream.</p>
          </div>
          <button className="icon-btn close-modal-btn atl-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="atl-layout">
          <nav className="atl-rail" aria-label="Settings chapters" ref={railRef}>
            {CHAPTERS.map(({ id, label, hue, Icon }) => (
              <button
                key={id}
                type="button"
                className={`atl-rail-item atl-hue-${hue} ${activeChapter === id ? 'is-active' : ''}`}
                onClick={() => goTo(id)}
                aria-current={activeChapter === id ? 'true' : undefined}
              >
                <span className="atl-rail-orb"><Icon size={14} /></span>
                <span className="atl-rail-label">{label}</span>
              </button>
            ))}
          </nav>

          <form onSubmit={handleSaveSettings} className="settings-body atl-body" ref={scrollRef}>
            {/* ───────── Rhythm ───────── */}
            <section className="settings-section atl-section atl-hue-dreamberry" data-chapter="rhythm">
              <div className="settings-section-title atl-section-title">
                <Clock size={16} />
                <span>Timer Configuration</span>
              </div>
              <p className="atl-lede">How long you dive, how long you surface.</p>

              <div className="atl-steppers">
                <Stepper label="Work Duration (mins)" value={workMins} onChange={setWorkMins} min={1} max={120} hue="dreamberry" />
                <Stepper label="Short Break (mins)" value={breakMins} onChange={setBreakMins} min={1} max={45} hue="mint" />
                <Stepper label="Long Break (mins)" value={longBreakMins} onChange={setLongBreakMins} min={1} max={90} hue="ultraviolet" />
                <Stepper label="Sessions before long break" value={sessionsBeforeLong} onChange={setSessionsBeforeLong} min={1} max={12} unit="rounds" hue="solar" />
              </div>

              <div className="atl-cycle" aria-label={`One cycle: ${fmtHours(cycleTotal)}, ${fmtHours(focusTotal)} of focus`}>
                <div className="atl-cycle-bar">
                  {cycle.map((s, i) => (
                    <span
                      key={i}
                      className={`atl-cycle-seg is-${s.kind}`}
                      style={{ flexGrow: s.mins }}
                      title={`${s.kind === 'focus' ? 'Focus' : s.kind === 'short' ? 'Short break' : 'Long break'} · ${s.mins}m`}
                    />
                  ))}
                </div>
                <div className="atl-cycle-legend">
                  <span><i className="is-focus" />Focus</span>
                  <span><i className="is-short" />Short break</span>
                  <span><i className="is-long" />Long break</span>
                  <span className="atl-cycle-total">One cycle · {fmtHours(cycleTotal)} · {fmtHours(focusTotal)} deep</span>
                </div>
              </div>
            </section>

            {/* ───────── World ───────── */}
            <section className="settings-section atl-section atl-hue-ultraviolet" data-chapter="world">
              <div className="settings-section-title atl-section-title">
                <Palette size={16} />
                <span>Theme Appearance</span>
              </div>
              <p className="atl-lede">Choose the painting you work inside.</p>

              <div className="atl-worlds">
                {CORE_THEMES.map((t) => {
                  const family = themeFamily(theme);
                  const active =
                    t.id === 'surreal' || t.id === 'lantern' || t.id === 'komorebi'
                      ? family === t.id
                      : theme === t.id;
                  // choosing an art family keeps you on the side of the day you were on
                  const pick = () => setTheme && setTheme(pickFamily(t.id, theme));
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={pick}
                      className={`atl-world atl-world-${t.id} ${active ? 'is-active' : ''}`}
                      aria-pressed={active}
                    >
                      {t.id === 'komorebi' ? (
                        <span className="atl-world-scene atl-scene-komorebi" aria-hidden="true">
                          <span className="atl-komorebi-moss" />
                          <span className="atl-komorebi-sunbeam" />
                          <span className="atl-komorebi-stone" />
                          <span className="atl-komorebi-amber-dot" />
                        </span>
                      ) : t.id === 'lantern' ? (
                        <span className="atl-world-scene atl-scene-lantern" aria-hidden="true">
                          <span className="atl-lantern-night" />
                          <span className="atl-lantern-moon" />
                          <span className="atl-lantern-blossom atl-lantern-blossom-l" />
                          <span className="atl-lantern-blossom atl-lantern-blossom-r" />
                          <span className="atl-lantern-lamp atl-lantern-lamp-1" />
                          <span className="atl-lantern-lamp atl-lantern-lamp-2" />
                          <span className="atl-lantern-path" />
                        </span>
                      ) : t.id === 'surreal' ? (
                        <span className="atl-world-scene atl-scene-surreal" aria-hidden="true">
                          <span className="atl-scene-night" />
                          <span className="atl-scene-sun" />
                          <span className="atl-scene-floor" />
                          <span className="atl-scene-cloud" />
                          <span className="atl-scene-eye" />
                        </span>
                      ) : (
                        <span className={`atl-world-scene atl-scene-crisp atl-scene-${t.id}`} aria-hidden="true">
                          <span className="atl-crisp-label"><i />Focus session</span>
                          <span className="atl-crisp-time">25:00</span>
                          <span className="atl-crisp-bar"><i /></span>
                        </span>
                      )}
                      <span className="atl-world-name">{t.name}</span>
                      <span className="atl-world-desc">{t.desc}</span>
                      {active && <span className="atl-world-check"><Check size={13} /></span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ───────── Sound ───────── */}
            <section className="settings-section atl-section atl-hue-lagoon" data-chapter="sound">
              <div className="settings-section-title atl-section-title">
                <Music size={16} />
                <span>Focus Soundtracks & Audio</span>
              </div>
              <p className="atl-lede">Procedural tracks run offline, with no buffering and no network.</p>

              <div className="atl-row">
                <div className="atl-row-text">
                  <span className="atl-row-title">Auto-Play on Focus Start</span>
                  <span className="atl-row-desc">Start this soundtrack with the timer, and pause it when the timer pauses.</span>
                </div>
                <Switch
                  checked={autoPlayAudio}
                  label="Auto-Play on Focus Start"
                  onChange={(next) => {
                    setAutoPlayAudio(next);
                    Storage.set('focus_autoplay_audio', next);
                    sfx.play('select');
                  }}
                />
              </div>

              <div className="atl-records">
                {SOUNDTRACK_OPTIONS.map((st, i) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setFocusSoundtrack(st.id);
                      Storage.set('focus_soundtrack', st.id);
                      sfx.play('select');
                    }}
                    className={`atl-record atl-record-${i} ${focusSoundtrack === st.id ? 'is-active' : ''}`}
                    aria-pressed={focusSoundtrack === st.id}
                  >
                    <span className="atl-record-disc" aria-hidden="true"><span>{st.icon}</span></span>
                    <span className="atl-record-text">
                      <span className="atl-record-name">{st.name}</span>
                      <span className="atl-record-desc">{st.desc}</span>
                    </span>
                    {focusSoundtrack === st.id && <Check size={14} className="atl-record-check" />}
                  </button>
                ))}
              </div>

              <div className="atl-subhead">
                <span className="settings-section-title atl-section-title atl-inline-title">
                  <span>UI Sound Effects (UI SFX)</span>
                </span>
                <button
                  type="button"
                  className={`atl-pill ${sfxEnabled ? 'is-on' : ''}`}
                  onClick={handleToggleSfx}
                  aria-pressed={sfxEnabled}
                >
                  {sfxEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>{sfxEnabled ? 'SFX Active' : 'Muted'}</span>
                </button>
              </div>
              <p className="atl-lede">Tactile, synthesized feedback for every touch, generated live with <strong>uisfx</strong>.</p>

              {sfxEnabled && (
                <div className="atl-sfx">
                  <div className="atl-row">
                    <div className="atl-row-text">
                      <span className="atl-row-title">SFX Volume</span>
                    </div>
                    <div className="atl-volume">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sfxVolume}
                        onChange={handleVolumeChange}
                        onMouseUp={handleVolumeCommit}
                        onTouchEnd={handleVolumeCommit}
                        className="sfx-volume-slider atl-range"
                        style={{ '--atl-fill': `${Math.round(sfxVolume * 100)}%` }}
                        aria-label="SFX Volume"
                      />
                      <span className="atl-volume-value">{Math.round(sfxVolume * 100)}%</span>
                    </div>
                  </div>

                  <div className="atl-row">
                    <div className="atl-row-text">
                      <span className="atl-row-title">Adaptive Zen Mode Feel</span>
                      <span className="atl-row-desc">Match the sound's feel to the art on screen (Portal, Record, Clock or Golconda).</span>
                    </div>
                    <Switch checked={sfxAdaptive} label="Adaptive Zen Mode Feel" onChange={handleToggleAdaptive} />
                  </div>

                  <div className="atl-packs-head">
                    <span className="atl-row-title">Sonic Personality ({SOUND_PACKS.length} Feels)</span>
                    <span className="atl-row-desc">Tap to audition</span>
                  </div>
                  <div className="atl-packs">
                    {SOUND_PACKS.map((p) => {
                      const isActive = sfxPack === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPack(p.id)}
                          className={`atl-pack ${isActive ? 'is-active' : ''}`}
                          style={{ '--atl-pack': p.color }}
                          aria-pressed={isActive}
                        >
                          <span className="atl-pack-name">{p.name}</span>
                          <span className="atl-pack-desc">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* ───────── Companion ───────── */}
            <section className="settings-section atl-section atl-hue-mint" data-chapter="companion">
              <div className="settings-section-title atl-section-title">
                <Sparkles size={16} />
                <span>Focus Companion Pet</span>
              </div>

              <div className="atl-companion">
                <span className="atl-companion-bubble" aria-hidden="true">
                  {companionType === 'none' ? '☁️' : companion?.icon || '🦖'}
                </span>
                <div className="atl-row-text">
                  <span className="atl-row-title">
                    {companionType === 'none' ? 'Companion Mascot Disabled' : companion?.name || 'Neo'}
                    {companionType !== 'none' && <span className="atl-badge">Active</span>}
                  </span>
                  <span className="atl-row-desc">
                    {companionType === 'none'
                      ? 'Pets are hidden and the space they used is removed, so nothing distracts you.'
                      : 'An interactive pet that cheers you on in the timer and notes.'}
                  </span>
                </div>
                {onSelectCompanion && (
                  <button
                    type="button"
                    className={`atl-ghost-btn ${companionType === 'none' ? '' : 'is-danger'}`}
                    onClick={() => onSelectCompanion(companionType === 'none' ? 'dino' : 'none')}
                  >
                    {companionType === 'none' ? 'Enable Pet' : 'Remove Pet'}
                  </button>
                )}
              </div>
            </section>

            {/* ───────── Keep ───────── */}
            <section className="settings-section atl-section atl-hue-solar" data-chapter="keep">
              <div className="settings-section-title atl-section-title">
                <Database size={16} />
                <span>Data & Backup</span>
              </div>
              <p className="atl-lede">Everything stays on this device. Take a copy with you.</p>

              <div className="atl-keep">
                <button type="button" className="atl-keep-tile" onClick={onExportAllData}>
                  <Download size={18} />
                  <span className="atl-row-title">Export Backup (JSON)</span>
                  <span className="atl-row-desc">Tasks, notes, stats</span>
                </button>

                <label className="atl-keep-tile file-upload-label">
                  <Upload size={18} />
                  <span className="atl-row-title">Import Backup</span>
                  <span className="atl-row-desc">From a .json file</span>
                  <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
                </label>

                <button
                  type="button"
                  className="atl-keep-tile is-danger"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all tasks, notes, and stats? This cannot be undone.')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                >
                  <Trash2 size={18} />
                  <span className="atl-row-title">Clear All Data</span>
                  <span className="atl-row-desc">Cannot be undone</span>
                </button>
              </div>
            </section>

            {/* ───────── About ───────── */}
            <section className="settings-section atl-section atl-hue-ember about-card-section" data-chapter="about">
              <div className="settings-section-title atl-section-title">
                <Info size={16} />
                <span>About Zencus</span>
              </div>

              <div className="about-ascii-profile-card atl-about">
                <span className="atl-monogram" aria-hidden="true">
                  <span>JM</span>
                </span>
                <div className="about-ascii-details">
                  <div className="about-badge-role">Creator & Design Engineer</div>
                  <h4 className="about-creator-name">Jakka Sai Srinivasa Manideep</h4>
                  <p className="about-text">
                    Building a focus room that feels like a painting: surreal, colourful and calm, with sound and motion made by hand.
                  </p>
                  <div className="about-meta-row">
                    <span className="about-version">Zencus v2.1.0 • PWA</span>
                    <span className="about-status-pill flex items-center gap-1.5">
                      <span className="atl-live-dot" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="atl-subhead">
                <span className="settings-section-title atl-section-title atl-inline-title">
                  <Compass size={16} />
                  <span>Design Resources & Toolkits</span>
                </span>
              </div>
              <p className="atl-lede">Made with inspiration and components from these design systems and creative toolkits:</p>
              <div className="atl-links">
                <div className="atl-link"><span className="atl-link-kind">Micro-Interactions</span>
                  <Link001 href="https://skiper-ui.com" className="atl-link-a">Skiper UI (@skiper40)</Link001></div>
                <div className="atl-link"><span className="atl-link-kind">3D WebGL & MCP</span>
                  <Link002 href="https://threeui.com" className="atl-link-a">ThreeUI (DesignCode)</Link002></div>
                <div className="atl-link"><span className="atl-link-kind">Web Gallery</span>
                  <Link003 href="https://godly.website" className="atl-link-a">Godly.website</Link003></div>
                <div className="atl-link"><span className="atl-link-kind">Delightful UX</span>
                  <Link004 href="https://www.designspells.com" className="atl-link-a">Design Spells</Link004></div>
                <div className="atl-link"><span className="atl-link-kind">Fluid Shaders</span>
                  <Link005 href="https://shadergradient.co" className="atl-link-a">ShaderGradient Engine</Link005></div>
              </div>
            </section>

            <div className="settings-footer atl-footer">
              <button type="button" className="atl-ghost-btn" onClick={onClose}>Cancel</button>
              <MagnetButton type="submit" className="btn-action primary atl-save">
                Save Preferences
              </MagnetButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
