import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DockNav from './components/DockNav';
import PomodoroTimer from './components/timer/PomodoroTimer';
import FullscreenZenMode from './components/timer/FullscreenZenMode';
import MiniTimer from './components/timer/MiniTimer';
import TaskManager from './components/tasks/TaskManager';
import NotesHub from './components/notes/NotesHub';
import SettingsModal from './components/SettingsModal';
import CompanionPickerModal from './components/companion/CompanionPickerModal';
import ParticlesBackground from './components/react-bits/ParticlesBackground';
import ClickSpark from './components/react-bits/ClickSpark';
import { Storage, uid } from './utils/storage';
import { themedAudio } from './utils/retroAudio';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme state: Crisp Light & Dark Modes
  const [theme, setTheme] = useState(() => Storage.get('theme', 'light'));
  const [soundEnabled, setSoundEnabled] = useState(() => Storage.get('soundEnabled', true));

  // Companion Pet state
  const [companionType, setCompanionType] = useState(() =>
    Storage.get('active_companion', 'dino')
  );
  const [isCompanionPickerOpen, setIsCompanionPickerOpen] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'tasks' | 'notes'

  // Settings & Fullscreen Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gamification & XP
  const [xp, setXp] = useState(() => Storage.getNumber('focus_xp', 0));

  // Timer Settings & Stats
  const [timerSettings, setTimerSettings] = useState(() =>
    Storage.get('timerSettings', {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLong: 4
    })
  );

  const [sessionsCompleted, setSessionsCompleted] = useState(() =>
    Storage.getNumber('sessionsCompleted', 0)
  );
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() =>
    Storage.getNumber('totalFocusMinutes', 0)
  );

  // Timer Engine State
  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState(() => Storage.getArray('tasks'));

  // Notes & Folders State
  const [notes, setNotes] = useState(() => Storage.getArray('notes'));
  const [customFolders, setCustomFolders] = useState(() =>
    Storage.getArray('custom_folders')
  );

  // Apply Theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.set('theme', theme);
  }, [theme]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      Storage.set('soundEnabled', next);
      return next;
    });
  };

  const addXp = (amount) => {
    setXp((prev) => {
      const next = prev + amount;
      Storage.set('focus_xp', next);
      return next;
    });
  };

  // Sync Timer Duration on mode or settings change
  useEffect(() => {
    let duration = timerSettings.workDuration * 60;
    if (mode === 'shortBreak') duration = timerSettings.breakDuration * 60;
    if (mode === 'longBreak') duration = timerSettings.longBreakDuration * 60;
    if (mode === 'chill') duration = (timerSettings.chillDuration || 30) * 60;

    setTotalDuration(duration);
    setTimeLeft(duration);
    setIsRunning(false);
  }, [mode, timerSettings]);

  // Timer Countdown Loop
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, timerSettings, soundEnabled, sessionsCompleted, totalFocusMinutes, theme]);

  // Update document title with remaining time
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (isRunning) {
      document.title = `(${formatted}) ${mode === 'work' ? 'Focus' : 'Break'} • Zencus`;
    } else {
      document.title = 'Zencus • Where Zen Meets Focus';
    }
  }, [timeLeft, isRunning, mode]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (soundEnabled) {
      themedAudio.playThemeChime(theme);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      const addedMins = Math.floor(totalDuration / 60);
      const newFocusMins = totalFocusMinutes + addedMins;

      setSessionsCompleted(newSessions);
      setTotalFocusMinutes(newFocusMins);
      addXp(50); // Award 50 XP per work block

      Storage.set('sessionsCompleted', newSessions);
      Storage.set('totalFocusMinutes', newFocusMins);

      // Auto switch to short or long break
      if (newSessions % timerSettings.sessionsBeforeLong === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
      addXp(15);
    }
  };

  const startTimer = (overrideMode) => {
    const currentMode = overrideMode || mode;
    setIsRunning(true);
    if (currentMode === 'chill') {
      setIsFullscreen(true);
    }
  };
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };
  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('shortBreak');
    } else {
      setMode('work');
    }
  };

  const setCustomDuration = (seconds) => {
    setIsRunning(false);
    setTotalDuration(seconds);
    setTimeLeft(seconds);
  };

  // Task Operations
  const addTask = (newTask) => {
    const created = {
      id: uid(),
      createdAt: new Date().toISOString(),
      ...newTask
    };
    const updated = [created, ...tasks];
    setTasks(updated);
    Storage.set('tasks', updated);
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          addXp(15);
          if (soundEnabled) {
            if (theme === 'retro-pixel') themedAudio.play8BitCoin();
            else if (theme === 'cyberpunk') themedAudio.playCyberpunkSynth();
            else if (theme === 'scifi-hud') themedAudio.playSciFiSonar();
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    setTasks(updated);
    Storage.set('tasks', updated);
  };

  const deleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    Storage.set('tasks', updated);
  };

  const editTask = (taskId, newTitle) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t));
    setTasks(updated);
    Storage.set('tasks', updated);
  };

  // Note Operations
  const saveNote = (noteData) => {
    let updated;
    if (noteData.id) {
      updated = notes.map((n) => (n.id === noteData.id ? { ...n, ...noteData } : n));
    } else {
      const newNote = {
        id: uid(),
        createdAt: new Date().toISOString(),
        trash: false,
        folder: noteData.folder || 'quick',
        ...noteData
      };
      updated = [newNote, ...notes];
      addXp(20);
    }
    setNotes(updated);
    Storage.set('notes', updated);
  };

  const deleteNote = (noteId, permanent = false) => {
    let updated;
    if (permanent) {
      updated = notes.filter((n) => n.id !== noteId);
    } else {
      updated = notes.map((n) => (n.id === noteId ? { ...n, trash: true } : n));
    }
    setNotes(updated);
    Storage.set('notes', updated);
  };

  const restoreNote = (noteId) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, trash: false } : n));
    setNotes(updated);
    Storage.set('notes', updated);
  };

  const togglePin = (noteId) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n));
    setNotes(updated);
    Storage.set('notes', updated);
  };

  const addCustomFolder = (folderName) => {
    const newF = {
      id: folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: folderName
    };
    const updated = [...customFolders, newF];
    setCustomFolders(updated);
    Storage.set('custom_folders', updated);
  };

  const deleteCustomFolder = (folderId) => {
    const updated = customFolders.filter((f) => f.id !== folderId);
    setCustomFolders(updated);
    Storage.set('custom_folders', updated);
  };

  // Settings & Data Backup Operations
  const saveTimerSettings = (newSettings) => {
    setTimerSettings(newSettings);
    Storage.set('timerSettings', newSettings);
  };

  const handleClearAllData = () => {
    Storage.clear();
    setTasks([]);
    setNotes([]);
    setCustomFolders([]);
    setSessionsCompleted(0);
    setTotalFocusMinutes(0);
    setXp(0);
  };

  const handleExportAllData = () => {
    const backup = {
      version: '2.3.0',
      exportedAt: new Date().toISOString(),
      tasks,
      notes,
      customFolders,
      timerSettings,
      stats: { sessionsCompleted, totalFocusMinutes, xp }
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAllData = (backupData) => {
    if (backupData.tasks) {
      setTasks(backupData.tasks);
      Storage.set('tasks', backupData.tasks);
    }
    if (backupData.notes) {
      setNotes(backupData.notes);
      Storage.set('notes', backupData.notes);
    }
    if (backupData.customFolders) {
      setCustomFolders(backupData.customFolders);
      Storage.set('custom_folders', backupData.customFolders);
    }
    if (backupData.timerSettings) {
      setTimerSettings(backupData.timerSettings);
      Storage.set('timerSettings', backupData.timerSettings);
    }
    if (backupData.stats) {
      setSessionsCompleted(backupData.stats.sessionsCompleted || 0);
      setTotalFocusMinutes(backupData.stats.totalFocusMinutes || 0);
      setXp(backupData.stats.xp || 0);
      Storage.set('sessionsCompleted', backupData.stats.sessionsCompleted || 0);
      Storage.set('totalFocusMinutes', backupData.stats.totalFocusMinutes || 0);
      Storage.set('focus_xp', backupData.stats.xp || 0);
    }
  };

  return (
    <div className={`app-layout theme-${theme} mode-${mode}`} data-timer-mode={mode}>
      {/* Background Ambient Particles */}
      <ParticlesBackground
        particleCount={20}
        particleColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
        lineColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}
      />

      {/* Tactile Click Sparks */}
      <ClickSpark
        sparkColor={theme === 'dark' ? '#ffffff' : '#0f172a'}
        sparkCount={6}
        sparkSize={7}
      />

      {/* Persistent App Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        openSettings={() => setIsSettingsOpen(true)}
        openFullscreen={() => setIsFullscreen(true)}
        companionType={companionType}
        openCompanionPicker={() => setIsCompanionPickerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-content-container">
        {activeTab === 'timer' && (
          <PomodoroTimer
            timeLeft={timeLeft}
            totalDuration={totalDuration}
            isRunning={isRunning}
            mode={mode}
            setMode={setMode}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            resetTimer={resetTimer}
            skipTimer={skipTimer}
            setCustomDuration={setCustomDuration}
            sessionsCompleted={sessionsCompleted}
            totalFocusMinutes={totalFocusMinutes}
            xp={xp}
            theme={theme}
            companionType={companionType}
            onOpenPicker={() => setIsCompanionPickerOpen(true)}
            onSelectCompanion={(newPet) => {
              setCompanionType(newPet);
              Storage.set('active_companion', newPet);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            editTask={editTask}
          />
        )}

        {activeTab === 'notes' && (
          <NotesHub
            notes={notes}
            saveNote={saveNote}
            deleteNote={deleteNote}
            restoreNote={restoreNote}
            togglePin={togglePin}
            customFolders={customFolders}
            addCustomFolder={addCustomFolder}
            deleteCustomFolder={deleteCustomFolder}
            theme={theme}
            companionType={companionType}
            onOpenPicker={() => setIsCompanionPickerOpen(true)}
            onSelectCompanion={(newPet) => {
              setCompanionType(newPet);
              Storage.set('active_companion', newPet);
            }}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <DockNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskCount={tasks.filter((t) => !t.completed).length}
        noteCount={notes.filter((n) => !n.trash).length}
      />

      {/* Floating Mini Timer Indicator when outside timer tab */}
      {activeTab !== 'timer' && (isRunning || timeLeft < totalDuration) && (
        <MiniTimer
          timeLeft={timeLeft}
          isRunning={isRunning}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          onClick={() => setActiveTab('timer')}
          mode={mode}
        />
      )}

      {/* Fullscreen Zen Focus Mode */}
      <FullscreenZenMode
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        timeLeft={timeLeft}
        totalDuration={totalDuration}
        isRunning={isRunning}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        resetTimer={resetTimer}
        mode={mode}
        theme={theme}
        companionType={companionType}
        setCompanionType={setCompanionType}
      />

      {/* Global Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        timerSettings={timerSettings}
        saveTimerSettings={saveTimerSettings}
        onClearAllData={handleClearAllData}
        onExportAllData={handleExportAllData}
        onImportAllData={handleImportAllData}
        companionType={companionType}
        onSelectCompanion={(newPet) => {
          setCompanionType(newPet);
          Storage.set('active_companion', newPet);
        }}
      />

      {/* Focus Pet Wardrobe Modal */}
      <CompanionPickerModal
        isOpen={isCompanionPickerOpen}
        onClose={() => setIsCompanionPickerOpen(false)}
        activeCompanion={companionType}
        onSelectCompanion={(newPet) => {
          setCompanionType(newPet);
          Storage.set('active_companion', newPet);
        }}
      />
    </div>
  );
}
