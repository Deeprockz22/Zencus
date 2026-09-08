import React, { useState } from 'react';
import { X, Clock, Database, Info, Download, Upload, Trash2 } from 'lucide-react';
import MagnetButton from './react-bits/MagnetButton';
import AsciiImage from './ui/AsciiImage';

export default function SettingsModal({
  isOpen,
  onClose,
  timerSettings,
  saveTimerSettings,
  onClearAllData,
  onExportAllData,
  onImportAllData
}) {
  const [workMins, setWorkMins] = useState(timerSettings.workDuration || 25);
  const [breakMins, setBreakMins] = useState(timerSettings.breakDuration || 5);
  const [longBreakMins, setLongBreakMins] = useState(timerSettings.longBreakDuration || 15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(timerSettings.sessionsBeforeLong || 4);

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
                  <span className="about-status-pill">STATUS: ONLINE</span>
                </div>
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
