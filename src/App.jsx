import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import Header from './components/Header';
import DockNav from './components/DockNav';
import PomodoroTimer from './components/timer/PomodoroTimer';
import FullscreenZenMode from './components/timer/FullscreenZenMode';
import MiniTimer from './components/timer/MiniTimer';
import SessionDebrief, { debriefToNote } from './components/timer/SessionDebrief';
import TaskManager from './components/tasks/TaskManager';
import NotesHub from './components/notes/NotesHub';
import SettingsModal from './components/SettingsModal';
import CompanionPickerModal from './components/companion/CompanionPickerModal';
import ClickSpark from './components/react-bits/ClickSpark';
import SurrealWorld from './components/surreal/SurrealWorld';
import LanternWorld from './components/lantern/LanternWorld';
import AsciiButterfly from './components/lantern/AsciiButterfly';
import { isSurrealTheme, isLanternTheme, isKomorebiTheme, baseTheme } from './themeFamilies';
import KomorebiWorld from './components/komorebi/KomorebiWorld';
import FloatingMiniTimer from './components/pip/MiniTimer';
import useDocumentPiP from './components/pip/useDocumentPiP';
import useWakeLock from './hooks/useWakeLock';
import { Storage, uid } from './utils/storage';
import { themedAudio } from './utils/retroAudio';
import { sfx } from './utils/sfx';
import { jazzRadio } from './utils/jazzRadioAudio';
import { ambientSoundscapes } from './utils/ambientAudio';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import ParkingLotModal from './components/timer/ParkingLotModal';
import { updateTabProgressRing, restoreTabFavicon } from './utils/tabProgress';
import { canUseDocumentPiP, openDocumentPiP, closeDocumentPiP, isPiPOpen } from './utils/pipManager';
import ShortcutSheetModal from './components/ui/ShortcutSheetModal';
import { recordFocusSession } from './utils/focusSessionHistory';
import { createCustomFolder } from './utils/noteFolders';
import { encryptLegacyNote } from './utils/noteCrypto';
import { hideSplash } from './utils/splash';
import useSoftLanding from './hooks/useSoftLanding';
import useFxMode from './hooks/useFxMode';

export default function App() {
  // Visual effects: Full, or Light for power-saving mode and slow devices (Auto picks)
  const fx = useFxMode();

  // Ultra-Smooth Inertial Scroll (Lenis by darkroomengineering)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lenis;
    let rafId;
    let wake;
    const WAKE_EVENTS = ['wheel', 'touchstart', 'touchmove', 'keydown', 'scroll', 'pointerdown'];

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        // Without these, Lenis swallowed every wheel event: modals like Settings
        // couldn't be scrolled with a mouse/trackpad and the page behind them
        // scrolled instead. Scrollable areas now scroll natively, and nothing
        // inside a dialog/overlay ever drives the page underneath.
        allowNestedScroll: true,
        prevent: (node) =>
          !!node.closest?.('.modal-backdrop, [role="dialog"], .fullscreen-zen-overlay, .green-dot-matrix-wall, [data-lenis-prevent]')
      });

      // Lenis only needs frames while something is scrolling. An always-on loop
      // woke the page 60 times a second forever, which costs battery (and frames
      // in power-saving mode). It sleeps after ~half a second of stillness and
      // wakes on anything that can scroll. Lenis measures time between frames,
      // so the idle gap is taken out of its clock (else it would jump to the end).
      let running = false;
      let still = 0;
      let last = 0;
      let gap = 0;
      const raf = (time) => {
        lenis.raf(time - gap);
        last = time;
        still = lenis.isScrolling ? 0 : still + 1;
        if (still > 30) {
          running = false;
          rafId = 0;
          return;
        }
        rafId = requestAnimationFrame(raf);
      };
      wake = () => {
        if (running) return;
        running = true;
        still = 0;
        rafId = requestAnimationFrame((time) => {
          if (last) gap += Math.max(0, time - last - 1000 / 60);
          raf(time);
        });
      };
      WAKE_EVENTS.forEach((type) => window.addEventListener(type, wake, { passive: true }));
      wake();
    } catch (err) {
      console.warn('Lenis smooth scrolling note:', err);
    }

    return () => {
      if (wake) WAKE_EVENTS.forEach((type) => window.removeEventListener(type, wake));
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        try {
          lenis.destroy();
        } catch (_) {}
      }
    };
  }, []);

  // Theme state: Crisp Light & Dark Modes
  const [theme, setTheme] = useState(() => Storage.get('theme', 'light'));
  const [soundEnabled, setSoundEnabled] = useState(() => Storage.get('soundEnabled', true));

  // Companion Pet state
  const [companionType, setCompanionType] = useState(() =>
    Storage.get('active_companion', 'dino')
  );
  const [isCompanionPickerOpen, setIsCompanionPickerOpen] = useState(false);

  // Navigation
  const miniPip = useDocumentPiP(); // floating mini timer (#33)
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'tasks' | 'notes'

  // The app is on screen: let the logo splash from index.html fade away
  useEffect(() => {
    hideSplash();
  }, []);

  // Settings & Fullscreen Modals & Privacy Lock
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visualizerType, setVisualizerType] = useState('portal');
  // the short reflection that follows a finished focus session
  const [debrief, setDebrief] = useState(null);

  // Foundations: Stray Thought Parking Lot (#5), Distraction Tally (#4), Garden Permanence (#23)
  const [isParkingLotOpen, setIsParkingLotOpen] = useState(false);
  const [parkedThoughts, setParkedThoughts] = useState(() => Storage.get('thelidhu_session_parked_thoughts', []));
  const [distractionCount, setDistractionCount] = useState(() => Storage.get('thelidhu_session_distractions', 0));
  const [gardenProgress, setGardenProgress] = useState(() =>
    Storage.get('thelidhu_garden_progress', { stones: 0, lanterns: 0, koi: 0 })
  );
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [intention, setIntention] = useState(() => Storage.get('thelidhu_session_intention', ''));
  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);

  // Fullscreen mode handler: immediate state update + native browser fullscreen request
  const setFullscreenAnimated = (next) => {
    setIsFullscreen(next);
    if (soundEnabled) {
      if (next) sfx.zenEnter();
      else sfx.zenExit();
    }

    try {
      if (next) {
        const docEl = document.documentElement;
        const req = docEl.requestFullscreen ||
                    docEl.webkitRequestFullscreen ||
                    docEl.mozRequestFullScreen ||
                    docEl.msRequestFullscreen;
        if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
          req.call(docEl).catch(() => {});
        }
      } else {
        const exit = document.exitFullscreen ||
                     document.webkitExitFullscreen ||
                     document.mozCancelFullScreen ||
                     document.msExitFullscreen;
        if (exit && (document.fullscreenElement || document.webkitFullscreenElement)) {
          exit.call(document).catch(() => {});
        }
      }
    } catch {
      // Gracefully ignore native fullscreen permission restrictions
    }
  };

  // Synchronize state if user exits via browser Escape or native controls
  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      const isNative = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isNative && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleNativeFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleNativeFullscreenChange);
    };
  }, [isFullscreen]);

  // Gamification & XP
  const [xp, setXp] = useState(() => Storage.getNumber('focus_xp', 0));

  // Timer Settings & Stats
  const [timerSettings, setTimerSettings] = useState(() => {
    const defaults = {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLong: 4
    };
    return { ...defaults, ...Storage.getObject('timerSettings', defaults) };
  });

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

  // Keep the display awake for the length of a running session
  useWakeLock(isRunning);

  // Sketch is a light-only skin, so leaving it restores whatever theme the user
  // was on rather than guessing light.
  //
  // The extras are dropped from the tree by `theme === 'sketch'`, so switching
  // straight away would delete them before they could animate. Entering runs the
  // fall-away first and flips the theme once it lands; leaving flips immediately
  // so the extras are mounted to drop back in.
  // Last element lets go at 720ms and takes 1150ms to clear the screen
  const SKETCH_FALL_MS = 1900;
  const [sketchAnim, setSketchAnim] = useState(null); // 'out' | 'in' | null
  const sketchAnimTimer = useRef(null);

  useEffect(() => {
    if (sketchAnim) document.documentElement.dataset.sketchAnim = sketchAnim;
    else delete document.documentElement.dataset.sketchAnim;
  }, [sketchAnim]);

  useEffect(() => () => clearTimeout(sketchAnimTimer.current), []);

  const toggleSketchMode = () => {
    if (sketchAnimTimer.current) return; // mid-transition

    const leaving = theme === 'sketch';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      if (leaving) setTheme(Storage.get('theme_before_sketch', 'light'));
      else {
        Storage.set('theme_before_sketch', theme);
        setTheme('sketch');
      }
      return;
    }

    if (leaving) {
      setTheme(Storage.get('theme_before_sketch', 'light'));
      setSketchAnim('in');
    } else {
      Storage.set('theme_before_sketch', theme);
      setSketchAnim('out');
    }

    sketchAnimTimer.current = setTimeout(() => {
      if (!leaving) setTheme('sketch');
      setSketchAnim(null);
      sketchAnimTimer.current = null;
    }, SKETCH_FALL_MS);
  };

  // Task & Notes State
  const [tasks, setTasks] = useState(() => Storage.getArray('tasks'));
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);
  const [notes, setNotes] = useState(() => Storage.getArray('notes'));
  const [customFolders, setCustomFolders] = useState(() =>
    Storage.getArray('custom_folders')
  );

  // Apply Theme to document root
  useEffect(() => {
    // Surreal & Lantern ride on the light/dark base; their skins are added by their worlds
    document.documentElement.setAttribute('data-theme', baseTheme(theme));
    Storage.set('theme', theme);
  }, [theme]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      Storage.set('soundEnabled', next);
      sfx.setEnabled(next);
      sfx.toggle(next);
      return next;
    });
  };

  const changeVisualizerType = (newType) => {
    setVisualizerType(newType);
    if (soundEnabled) sfx.onVisualizerChange(newType);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (soundEnabled) sfx.tabChange();
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

  // Update document title and dynamic favicon progress ring with remaining time (#34)
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (isRunning) {
      document.title = `(${formatted}) ${mode === 'work' ? 'Focus' : 'Break'} • Zencus`;
      const elapsedRatio = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
      updateTabProgressRing(elapsedRatio, mode, theme, true);
    } else {
      document.title = 'Zencus • Where Zen Meets Focus';
      restoreTabFavicon();
    }
  }, [timeLeft, isRunning, mode, totalDuration, theme]);

  const handleParkThought = (thought) => {
    setParkedThoughts((prev) => {
      const next = [...prev, thought];
      Storage.set('thelidhu_session_parked_thoughts', next);
      return next;
    });
    setDistractionCount((prev) => {
      const next = prev + 1;
      Storage.set('thelidhu_session_distractions', next);
      return next;
    });
    if (soundEnabled) sfx.play('select');
  };

  const handleTallyDistraction = () => {
    setDistractionCount((prev) => {
      const next = prev + 1;
      Storage.set('thelidhu_session_distractions', next);
      return next;
    });
    if (soundEnabled) sfx.play('pop');
  };

  const togglePiP = async () => {
    if (isPiPOpen()) {
      closeDocumentPiP();
      setIsPiPActive(false);
      return;
    }
    if (!canUseDocumentPiP()) return;
    try {
      const { container } = await openDocumentPiP({
        width: 280,
        height: 160,
        theme,
        onClose: () => setIsPiPActive(false)
      });
      setIsPiPActive(true);

      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;font-family:monospace;user-select:none;">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;">
            ${mode === 'work' ? 'Focus' : 'Break'}
          </div>
          <div style="font-size:36px;font-weight:800;letter-spacing:-0.03em;">
            ${formatted}
          </div>
          <button id="pip-action-btn" style="background:var(--accent,#4ade80);border:none;border-radius:999px;padding:5px 18px;font-weight:700;font-size:11px;cursor:pointer;color:#0b1510;margin-top:2px;">
            ${isRunning ? 'Pause' : 'Start'}
          </button>
        </div>
      `;
      const btn = container.querySelector('#pip-action-btn');
      if (btn) {
        btn.onclick = () => {
          isRunning ? pauseTimer() : startTimer();
        };
      }
    } catch (err) {
      console.warn('PiP launch error:', err);
    }
  };

  // Keyboard shortcuts: Press 'F' for Zen, 'P' for Thought Tray, 'D' for Tally
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      // Never fire while typing, or from inside an open dialog (e.g. the note editor).
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable || e.target?.closest?.('.modal-card')) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFullscreenAnimated(!isFullscreen);
      } else if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsParkingLotOpen((prev) => !prev);
      } else if ((e.key === 'd' || e.key === 'D') && isRunning && mode === 'work' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleTallyDistraction();
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsShortcutSheetOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFullscreen, isRunning, mode]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (soundEnabled) {
      sfx.sessionComplete();
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

      // offer a 20-second debrief: what got done (→ notes), what's next (→ tasks), plus parked thoughts (#5)
      const finishedTask = tasks.find((t) => t.id === activeTimerTaskId);
      setDebrief({
        minutes: addedMins,
        taskTitle: finishedTask?.title || '',
        category: finishedTask?.category || 'Work',
        intention,
        parkedThoughts: [...parkedThoughts],
        distractionCount
      });

      // Record in local-first focus history (#18)
      recordFocusSession({
        durationMinutes: addedMins,
        mode: 'work',
        theme,
        intention,
        distractionCount,
        parkedThoughts: [...parkedThoughts],
      });

      // Advance garden permanence (#23: 1 stone per 4 sessions, max 7)
      const nextGarden = {
        ...gardenProgress,
        stones: Math.min(7, Math.floor(newSessions / 4))
      };
      setGardenProgress(nextGarden);
      Storage.set('thelidhu_garden_progress', nextGarden);

      // Clear current session parking lot, tally, and intention
      setParkedThoughts([]);
      setDistractionCount(0);
      setIntention('');
      Storage.set('thelidhu_session_parked_thoughts', []);
      Storage.set('thelidhu_session_distractions', 0);
      Storage.set('thelidhu_session_intention', '');

      if (activeTimerTaskId) {
        setTasks(prev => {
          const updated = prev.map(t => t.id === activeTimerTaskId ? { ...t, completed: true } : t);
          Storage.set('tasks', updated);
          return updated;
        });
        setActiveTimerTaskId(null);
      }

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
    if (soundEnabled) sfx.timerStart();

    // Auto-play focus soundtrack if enabled by user in settings
    if (Storage.get('focus_autoplay_audio', false)) {
      const soundtrack = Storage.get('focus_soundtrack', 'vinyl-lofi');
      if (soundtrack === 'window-rain') ambientSoundscapes.playWindowRain();
      else if (soundtrack === 'zen-rain') ambientSoundscapes.playZenRain();
      else if (soundtrack === 'alphabeats') ambientSoundscapes.playAlphaBeats();
      else if (soundtrack !== 'silent') jazzRadio.play(soundtrack);
    }
  };
  const pauseTimer = () => {
    setIsRunning(false);
    if (soundEnabled) sfx.timerPause();

    // Pause focus soundtrack if auto-play is active
    if (Storage.get('focus_autoplay_audio', false)) {
      jazzRadio.pause();
      ambientSoundscapes.stop();
    }
  };
  const resetTimer = () => {
    setIsRunning(false);
    if (soundEnabled) sfx.timerReset();
    setTimeLeft(totalDuration);
  };
  const skipTimer = () => {
    setIsRunning(false);
    if (soundEnabled) sfx.play('skip-next');
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
    if (soundEnabled) sfx.taskAdd();
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          addXp(15);
          if (soundEnabled) {
            sfx.taskCheck();
            if (theme === 'retro-pixel') themedAudio.play8BitCoin();
            else if (theme === 'cyberpunk') themedAudio.playCyberpunkSynth();
            else if (theme === 'scifi-hud') themedAudio.playSciFiSonar();
          }
        } else {
          // They unchecked the task by mistake! Deduct the XP.
          addXp(-15);
          if (soundEnabled) sfx.taskUncheck();
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
    if (soundEnabled) sfx.taskDelete();
  };

  const editTask = (taskId, newTitle) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t));
    setTasks(updated);
    Storage.set('tasks', updated);
  };

  // Note Operations
  const saveNote = (noteData) => {
    const isNewNote = !noteData.id;
    const savedNote = isNewNote
      ? {
          ...noteData,
          id: uid(),
          createdAt: new Date().toISOString(),
          trash: false,
          folder: noteData.folder || 'quick'
        }
      : { ...noteData };

    setNotes((prevNotes) => {
      const updated = isNewNote
        ? [savedNote, ...prevNotes]
        : prevNotes.map((n) => (n.id === savedNote.id ? { ...n, ...savedNote } : n));
      Storage.set('notes', updated);
      return updated;
    });

    if (isNewNote) {
      addXp(20);
    }

    return savedNote;
  };

  // Note updates always build on the latest list, so back-to-back changes
  // (and saves that finish late, like encrypted ones) never overwrite each other.
  const updateNotes = (change) => {
    setNotes((prevNotes) => {
      const updated = change(prevNotes);
      Storage.set('notes', updated);
      return updated;
    });
  };

  const deleteNote = (noteId, permanent = false) => {
    updateNotes((prev) =>
      permanent ? prev.filter((n) => n.id !== noteId) : prev.map((n) => (n.id === noteId ? { ...n, trash: true } : n))
    );
  };

  const restoreNote = (noteId) => {
    updateNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, trash: false } : n)));
  };

  const emptyTrash = () => {
    updateNotes((prev) => prev.filter((n) => !n.trash));
  };

  const togglePin = (noteId) => {
    updateNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)));
  };

  // Notes locked in the old format kept their PIN and text in plain sight: encrypt them.
  useEffect(() => {
    const legacy = notes.filter((n) => n.pin && !n.cipher);
    if (legacy.length === 0) return;
    let cancelled = false;
    Promise.all(legacy.map(encryptLegacyNote)).then((upgraded) => {
      if (cancelled) return;
      const byId = new Map(upgraded.map((n, i) => [n.id, { upgraded: n, source: legacy[i] }]));
      updateNotes((prev) =>
        prev.map((n) => {
          const entry = byId.get(n.id);
          // Only replace a note that hasn't changed since it was encrypted
          return entry && n.pin && !n.cipher && n.updatedAt === entry.source.updatedAt && n.content === entry.source.content
            ? { ...n, ...entry.upgraded, pin: undefined }
            : n;
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [notes]);

  // Returns an error message when the name can't be used, otherwise null.
  const addCustomFolder = (folderName) => {
    const { folder, error } = createCustomFolder(folderName, customFolders);
    if (error) return error;
    const updated = [...customFolders, folder];
    setCustomFolders(updated);
    Storage.set('custom_folders', updated);
    return null;
  };

  // Notes in a deleted folder move to Quick Notes, as the confirm dialog promises.
  const deleteCustomFolder = (folderId) => {
    const updated = customFolders.filter((f) => f.id !== folderId);
    setCustomFolders(updated);
    Storage.set('custom_folders', updated);
    setNotes((prevNotes) => {
      const moved = prevNotes.map((n) => (n.folder === folderId ? { ...n, folder: 'quick' } : n));
      Storage.set('notes', moved);
      return moved;
    });
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
    if (!backupData || typeof backupData !== 'object' || Array.isArray(backupData)) return;

    if (Array.isArray(backupData.tasks)) {
      setTasks(backupData.tasks);
      Storage.set('tasks', backupData.tasks);
    }
    if (Array.isArray(backupData.notes)) {
      setNotes(backupData.notes);
      Storage.set('notes', backupData.notes);
    }
    if (Array.isArray(backupData.customFolders)) {
      setCustomFolders(backupData.customFolders);
      Storage.set('custom_folders', backupData.customFolders);
    }
    if (backupData.timerSettings && typeof backupData.timerSettings === 'object' && !Array.isArray(backupData.timerSettings)) {
      setTimerSettings(backupData.timerSettings);
      Storage.set('timerSettings', backupData.timerSettings);
    }
    if (backupData.stats && typeof backupData.stats === 'object' && !Array.isArray(backupData.stats)) {
      setSessionsCompleted(backupData.stats.sessionsCompleted || 0);
      setTotalFocusMinutes(backupData.stats.totalFocusMinutes || 0);
      setXp(backupData.stats.xp || 0);
      Storage.set('sessionsCompleted', backupData.stats.sessionsCompleted || 0);
      Storage.set('totalFocusMinutes', backupData.stats.totalFocusMinutes || 0);
      Storage.set('focus_xp', backupData.stats.xp || 0);
    }
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      const tabs = ['timer', 'tasks', 'notes'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (isLeftSwipe) {
        // Swipe left -> Next tab
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      } else if (isRightSwipe) {
        // Swipe right -> Prev tab
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex]);
      }
    }
  };

  return (
    <div className={`app-layout theme-${theme} mode-${mode}`} data-timer-mode={mode}>

      {/* The painted worlds of the art themes */}
      {isSurrealTheme(theme) && <SurrealWorld theme={theme} />}
      {/* The anime night garden, and the ASCII butterfly that visits it */}
      {isLanternTheme(theme) && <LanternWorld theme={theme} />}
      {isLanternTheme(theme) && !fx.lite && <AsciiButterfly />}
      {/* The sunlit engawa: light follows the session, the calico follows the light */}
      {isKomorebiTheme(theme) && (
        <KomorebiWorld theme={theme} progress={totalDuration ? 1 - timeLeft / totalDuration : 0} mode={mode}
          isRunning={isRunning} sessionsCompleted={sessionsCompleted} soundEnabled={soundEnabled}
          gardenProgress={gardenProgress} />
      )}

      {/* Tactile Click Sparks */}
      {theme !== 'sketch' && (
        <ClickSpark
          sparkColor={baseTheme(theme) === 'dark' ? '#ffffff' : '#0f172a'}
          sparkCount={6}
          sparkSize={7}
        />
      )}

      {/* Floating mini timer: renders into the PiP window, sharing this state */}
      <FloatingMiniTimer pipWindow={miniPip.pipWindow} timeLeft={timeLeft} totalDuration={totalDuration} mode={mode}
        isRunning={isRunning} onToggle={() => (isRunning ? pauseTimer() : startTimer())} onSkip={skipTimer} />

      {/* Persistent App Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        toggleSketchMode={toggleSketchMode}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        openSettings={() => {
          setIsSettingsOpen(true);
          if (soundEnabled) sfx.modalOpen();
        }}
        openFullscreen={() => setFullscreenAnimated(true)}
        openMiniTimer={miniPip.supported ? miniPip.toggle : undefined}
        miniTimerOpen={!!miniPip.pipWindow}
        companionType={companionType}
        openCompanionPicker={() => setIsCompanionPickerOpen(true)}
      />

      {/* Main Content Area */}
      <main 
        className="app-content-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
            onOpenFullscreen={() => setFullscreenAnimated(true)}
            isFullscreen={isFullscreen}
            visualizerType={visualizerType}
            setVisualizerType={changeVisualizerType}
            activeTimerTask={tasks.find(t => t.id === activeTimerTaskId)}
            onClearActiveTask={() => setActiveTimerTaskId(null)}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            openSettings={() => {
              setIsSettingsOpen(true);
              if (soundEnabled) sfx.modalOpen();
            }}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            onOpenParkingLot={() => setIsParkingLotOpen(true)}
            onTogglePiP={canUseDocumentPiP() ? togglePiP : null}
            intention={intention}
            setIntention={setIntention}
            onOpenShortcuts={() => setIsShortcutSheetOpen(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            editTask={editTask}
            onFocusTask={(taskId) => {
              setActiveTimerTaskId(taskId);
              setActiveTab('timer');
              if (mode !== 'work') setMode('work');
            }}
          />
        )}

        {activeTab === 'notes' && (
          <NotesHub
            notes={notes}
            saveNote={saveNote}
            deleteNote={deleteNote}
            restoreNote={restoreNote}
            emptyTrash={emptyTrash}
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
            onConvertToTask={(noteTitle) => {
              addTask({ title: noteTitle, priority: 'high', category: 'Ideas', completed: false });
              setActiveTab('tasks');
            }}
          />
        )}
      </main>

      {/* Session debrief: done → a #focuslog note, next → a task */}
      <SessionDebrief
        open={!!debrief}
        minutes={debrief?.minutes}
        taskTitle={debrief?.taskTitle}
        intention={debrief?.intention}
        parkedThoughts={debrief?.parkedThoughts || []}
        distractionCount={debrief?.distractionCount || 0}
        onSkip={() => setDebrief(null)}
        onSave={(answers) => {
          saveNote(debriefToNote(answers, debrief));
          if (answers.addTask) {
            addTask({ title: answers.next, priority: 'medium', category: debrief.category, completed: false });
          }
          setDebrief(null);
        }}
      />

      {/* Stray Thought Parking Lot & Distraction Tally Modal (#5 & #4) */}
      <ParkingLotModal
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
        onParkThought={handleParkThought}
        onTallyDistraction={handleTallyDistraction}
        distractionCount={distractionCount}
        parkedThoughts={parkedThoughts}
      />

      {/* Keyboard Shortcut Discovery Sheet (#17) */}
      <ShortcutSheetModal
        open={isShortcutSheetOpen}
        onClose={() => setIsShortcutSheetOpen(false)}
      />

      {/* Bottom Floating Navigation Dock */}
      <DockNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
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
          onClick={() => handleTabChange('timer')}
          mode={mode}
        />
      )}

      {/* Fullscreen Zen Focus Mode */}
      <FullscreenZenMode
        isOpen={isFullscreen}
        onClose={() => setFullscreenAnimated(false)}
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
        visualizerType={visualizerType}
        setVisualizerType={changeVisualizerType}
      />

      {/* Global Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          if (soundEnabled) sfx.modalClose();
        }}
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
        theme={theme}
        setTheme={setTheme}
        fxMode={fx.mode}
        setFxMode={fx.setMode}
        fxAutoLite={fx.autoLite}
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
