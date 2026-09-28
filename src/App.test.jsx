import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Core App & Navigation
import App from './App';
import PomodoroTimer from './components/timer/PomodoroTimer';
import TaskManager from './components/tasks/TaskManager';
import NotesHub from './components/notes/NotesHub';
import FullscreenZenMode from './components/timer/FullscreenZenMode';
import SettingsModal from './components/SettingsModal';
import CompanionPickerModal from './components/companion/CompanionPickerModal';
import MiniTimer from './components/timer/MiniTimer';

// Visualizers still in the app
import MinimalVisualizer from './components/timer/MinimalVisualizer';

import { gsapMotion } from './utils/gsapMotion';
import { Link001, Link002, Link003, Link004, Link005 } from './components/ui/skiper-ui/skiper40';

// Global mocks for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  };
}

describe('Thelidhu Comprehensive Screen Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sharedVizProps = {
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    isRunning: false,
    mode: 'work',
    getModeTitle: () => 'Deep Focus Session',
    formatTime: (s) => '25:00',
    isEditing: false,
    editMinutes: 25,
    setEditMinutes: vi.fn(),
    handleEditSubmit: vi.fn(),
    setIsEditing: vi.fn(),
    startTimer: vi.fn(),
    pauseTimer: vi.fn()
  };

  // ═══════════════ 1. APP ROOT & NAVIGATION ═══════════════
  describe('Screen: Root App & DockNav Navigation', () => {
    it('renders App without crashing', () => {
      render(<App />);
      expect(document.querySelector('.app-layout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Focus/i })).toBeInTheDocument();
    });

    it('falls back safely when persisted collection data has the wrong shape', () => {
      localStorage.setItem('tasks', JSON.stringify('not-an-array'));
      localStorage.setItem('notes', JSON.stringify({ broken: true }));
      localStorage.setItem('quests', JSON.stringify(42));
      localStorage.setItem('timerSettings', JSON.stringify([]));

      expect(() => render(<App />)).not.toThrow();
      expect(screen.getByRole('button', { name: /Start Focus/i })).toBeInTheDocument();
    });

    it('switches between tabs via DockNav (Timer, Tasks, Notes)', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to Tasks Tab
      const tasksTabBtn = screen.getByRole('tab', { name: /Tasks/i });
      await user.click(tasksTabBtn);
      // Header copy was 'Task Focus' with a fake-console subtitle; Steve's
      // review (round 4) flagged it as the same decorative pattern removed
      // from the Timer screen, so the header is now the plain 'Tasks'.
      expect(screen.getByText('Tasks', { selector: 'h2' })).toBeInTheDocument();

      // Switch to Notes Tab
      const notesTabBtn = screen.getByRole('tab', { name: /Notes/i });
      await user.click(notesTabBtn);
      expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();

      // Switch back to Timer Tab
      const timerTabBtn = screen.getByRole('tab', { name: /Timer/i });
      await user.click(timerTabBtn);
      expect(screen.getByRole('button', { name: /Start Focus/i })).toBeInTheDocument();
    });
  });

  // ═══════════════ 2. SCREEN: POMODORO TIMER CONSOLE ═══════════════
  describe('Screen: Pomodoro Timer Console', () => {
    const timerProps = {
      ...sharedVizProps,
      setMode: vi.fn(),
      resetTimer: vi.fn(),
      skipTimer: vi.fn(),
      setCustomDuration: vi.fn(),
      sessionsCompleted: 5,
      totalFocusMinutes: 125,
      xp: 350,
      companionType: 'dino',
      onOpenPicker: vi.fn(),
      onSelectCompanion: vi.fn(),
      onOpenFullscreen: vi.fn(),
      visualizerType: 'turntable',
      setVisualizerType: vi.fn(),
      theme: 'dark'
    };

    it('renders streamlined visualizer scene switcher pills (Vinyl Studio & Minimal Dial)', () => {
      render(<PomodoroTimer {...timerProps} />);
      expect(screen.getByRole('button', { name: /Vinyl Studio/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Minimal Dial/i })).toBeInTheDocument();
    });

    it('gives the Surreal theme its own scenes (Dream Portal, Golconda, Prism Record, Melting Clock)', () => {
      render(<PomodoroTimer {...timerProps} theme="surreal" visualizerType="portal" />);
      for (const name of [/Dream Portal/i, /Golconda/i, /Prism Record/i, /Melting Clock/i]) {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      }
      expect(screen.queryByRole('button', { name: /Vinyl Studio/i })).toBeNull();
      expect(document.querySelector('.dream-portal')).toBeInTheDocument();
    });

    it('falls back from the Dream Portal to the vinyl outside the Surreal theme', () => {
      render(<PomodoroTimer {...timerProps} theme="dark" visualizerType="portal" />);
      expect(document.querySelector('.dream-portal')).toBeNull();
      expect(screen.queryByRole('button', { name: /Dream Portal/i })).toBeNull();
    });

    it('does not carry the Matrix Wall or the vinyl into Komorebi or Lantern', () => {
      const { unmount } = render(<PomodoroTimer {...timerProps} theme="komorebi" visualizerType="wall" />);
      expect(document.querySelector('.wall-vignette')).toBeNull();
      expect(document.querySelector('.minimal-canvas-stage')).toBeInTheDocument();
      unmount();
      render(<PomodoroTimer {...timerProps} theme="lantern" visualizerType="turntable" />);
      expect(screen.queryByRole('button', { name: /Vinyl Studio/i })).toBeNull();
      expect(document.querySelector('.glyph-spinning-platter')).toBeNull();
      expect(document.querySelector('.paper-lantern-stage')).toBeInTheDocument();
    });

    it('triggers setVisualizerType when clicking a scene pill', async () => {
      const user = userEvent.setup();
      const setVisualizerType = vi.fn();
      render(<PomodoroTimer {...timerProps} setVisualizerType={setVisualizerType} />);

      await user.click(screen.getByRole('button', { name: /Minimal Dial/i }));
      expect(setVisualizerType).toHaveBeenCalledWith('minimal');

      await user.click(screen.getByRole('button', { name: /Vinyl Studio/i }));
      expect(setVisualizerType).toHaveBeenCalledWith('turntable');
    });

    it('renders mode switchers (Focus, Short Break, Long Break)', async () => {
      const user = userEvent.setup();
      const setMode = vi.fn();
      render(<PomodoroTimer {...timerProps} setMode={setMode} />);

      await user.click(screen.getByRole('button', { name: /Short Break/i }));
      expect(setMode).toHaveBeenCalledWith('shortBreak');

      await user.click(screen.getByRole('button', { name: /Long Break/i }));
      expect(setMode).toHaveBeenCalledWith('longBreak');
    });

    it('switches duration presets and transport controls', async () => {
      const user = userEvent.setup();
      const setCustomDuration = vi.fn();
      render(<PomodoroTimer {...timerProps} setCustomDuration={setCustomDuration} />);

      await user.click(screen.getByText('45'));
      expect(setCustomDuration).toHaveBeenCalledWith(45 * 60);
    });

    it('renders focus soundscapes bar with quick atmosphere options', () => {
      render(<PomodoroTimer {...timerProps} />);
      expect(screen.getByText(/Focus Soundscapes/i)).toBeInTheDocument();
    });
  });

  // ═══════════════ 3. SCREENS: VISUALIZER ENGINES ═══════════════
  describe('Screens: Visualizer Engines Suite', () => {
    it('renders Minimalist Zen Breath Dial screen', () => {
      render(<MinimalVisualizer {...sharedVizProps} />);
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(document.querySelector('.minimal-visualizer-hero')).toBeInTheDocument();
    });
  });

  // ═══════════════ 4. SCREEN: TASK MANAGER ═══════════════
  describe('Screen: Task Manager Screen', () => {
    const tasks = [
      { id: '1', title: 'Complete WebGL Shader Revamp', priority: 'high', category: 'Work', completed: false },
      { id: '2', title: 'Test Audio Sound Packs', priority: 'medium', category: 'Personal', completed: true }
    ];

    it('renders task list, input form, and metrics', () => {
      render(
        <TaskManager
          tasks={tasks}
          addTask={vi.fn()}
          toggleTask={vi.fn()}
          deleteTask={vi.fn()}
          editTask={vi.fn()}
          onFocusTask={vi.fn()}
        />
      );

      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Complete WebGL Shader Revamp')).toBeInTheDocument();
      expect(screen.getByText('Test Audio Sound Packs')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Add a new task/i)).toBeInTheDocument();
    });

    it('allows typing and submitting a new task', async () => {
      const user = userEvent.setup();
      const addTask = vi.fn();
      render(
        <TaskManager
          tasks={tasks}
          addTask={addTask}
          toggleTask={vi.fn()}
          deleteTask={vi.fn()}
          editTask={vi.fn()}
          onFocusTask={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/Add a new task/i);
      await user.type(input, 'Build Aceternity 3D Cards{enter}');
      expect(addTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Build Aceternity 3D Cards',
        completed: false
      }));
    });
  });

  // ═══════════════ 5. SCREEN: NOTES HUB ═══════════════
  describe('Screen: Notes Hub Screen', () => {
    const notes = [
      { id: 'n1', title: 'Design Inspiration Notes', body: 'Godly, Aceternity, Neuform patterns', tags: ['design'], updatedAt: Date.now(), pinned: true }
    ];

    it('renders notes search bar, folder navigation and note cards', () => {
      render(
        <NotesHub
          notes={notes}
          saveNote={vi.fn()}
          deleteNote={vi.fn()}
          restoreNote={vi.fn()}
          togglePin={vi.fn()}
          customFolders={['Ideas', 'Work']}
          addCustomFolder={vi.fn()}
          deleteCustomFolder={vi.fn()}
        />
      );

      expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
      expect(screen.getByText('Design Inspiration Notes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /New Note/i })).toBeInTheDocument();
    });

    it('does not duplicate a new note when autosave is followed by Escape', async () => {
      vi.useFakeTimers();
      try {
        render(<App />);
        fireEvent.click(screen.getByRole('tab', { name: /Notes/i }));
        fireEvent.click(screen.getByRole('button', { name: /New Note/i }));

        fireEvent.change(screen.getByPlaceholderText(/Note Title/i), {
          target: { value: 'Autosave race regression' }
        });

        await act(async () => {
          await vi.advanceTimersByTimeAsync(1600);
        });
        fireEvent.keyDown(window, { key: 'Escape' });

        const savedNotes = JSON.parse(localStorage.getItem('notes'));
        expect(savedNotes).toHaveLength(1);
        expect(savedNotes[0]).toMatchObject({
          title: 'Autosave race regression',
          id: expect.any(String)
        });
        expect(screen.getAllByText('Autosave race regression')).toHaveLength(1);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ═══════════════ 6. DOCK NAVIGATION TAB INTEGRITY ═══════════════
  describe('Screen: Dock Navigation Tabs', () => {
    it('renders exactly 3 primary navigation tabs: Timer, Tasks, and Notes', () => {
      render(<App />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      expect(screen.getByRole('tab', { name: /Timer/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /Quests/i })).not.toBeInTheDocument();
    });
  });

  // ═══════════════ 7. SCREEN: FULLSCREEN ZEN MODE ═══════════════
  describe('Screen: Fullscreen Zen Mode', () => {
    it('renders full-bleed overlay, brand, and clean zen screen without mode switcher', () => {
      render(
        <FullscreenZenMode
          isOpen={true}
          onClose={vi.fn()}
          timeLeft={25 * 60}
          totalDuration={25 * 60}
          isRunning={false}
          startTimer={vi.fn()}
          pauseTimer={vi.fn()}
          resetTimer={vi.fn()}
          mode="work"
          theme="dark"
        />
      );

      expect(document.querySelector('.fullscreen-zen-overlay')).toBeInTheDocument();
      expect(screen.getByTitle('Exit Fullscreen (Esc)')).toBeInTheDocument();
      expect(document.querySelector('.zen-viz-switcher')).toBeNull();
      expect(document.querySelector('.glyph-spinning-platter')).toBeInTheDocument();
    });

    it('shows the Surreal art full-bleed when the Surreal theme is active', () => {
      render(
        <FullscreenZenMode
          isOpen={true}
          onClose={vi.fn()}
          timeLeft={25 * 60}
          totalDuration={25 * 60}
          isRunning={false}
          startTimer={vi.fn()}
          pauseTimer={vi.fn()}
          resetTimer={vi.fn()}
          mode="work"
          theme="surreal-night"
          visualizerType="turntable"
        />
      );
      expect(document.querySelector('.prism-disc')).toBeInTheDocument();
      expect(document.querySelector('.glyph-spinning-platter')).toBeNull();
    });

    it('keeps the vinyl to Crisp: Komorebi and Lantern show their own scenes full screen', () => {
      const zen = (theme, visualizerType) => render(
        <FullscreenZenMode
          isOpen={true}
          onClose={vi.fn()}
          timeLeft={25 * 60}
          totalDuration={25 * 60}
          isRunning={false}
          startTimer={vi.fn()}
          pauseTimer={vi.fn()}
          resetTimer={vi.fn()}
          mode="work"
          theme={theme}
          visualizerType={visualizerType}
        />
      );
      for (const theme of ['komorebi', 'komorebi-night']) {
        const { unmount } = zen(theme, 'turntable');
        expect(document.querySelector('.minimal-canvas-stage')).toBeInTheDocument();
        expect(document.querySelector('.glyph-spinning-platter')).toBeNull();
        unmount();
      }
      for (const scene of ['turntable', 'wall', 'lantern']) {
        const { unmount } = zen('lantern-night', scene);
        expect(document.querySelector('.zen-lantern-stage')).toBeInTheDocument();
        expect(document.querySelector('.glyph-spinning-platter')).toBeNull();
        unmount();
      }
      const { unmount } = zen('lantern', 'minimal');
      expect(document.querySelector('.minimal-canvas-stage')).toBeInTheDocument();
      unmount();
      zen('light', 'turntable');
      expect(document.querySelector('.glyph-spinning-platter')).toBeInTheDocument();
    });
  });

  // ═══════════════ 8. SCREEN: SETTINGS & AUDIO MODAL ═══════════════
  describe('Screen: Settings & Customization Modal', () => {
    it('offers Auto, Full and Light visual effects and reports what Auto chose', async () => {
      const user = userEvent.setup();
      const setFxMode = vi.fn();
      const props = {
        isOpen: true, onClose: vi.fn(), saveTimerSettings: vi.fn(), onClearAllData: vi.fn(),
        onExportAllData: vi.fn(), onImportAllData: vi.fn(), onSelectCompanion: vi.fn(), setTheme: vi.fn(),
        timerSettings: { workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 },
        theme: 'surreal', setFxMode,
      };
      const { rerender } = render(<SettingsModal {...props} fxMode="auto" fxAutoLite />);
      const group = screen.getByRole('radiogroup', { name: 'Visual effects' });
      expect(group).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /^Auto/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText(/Auto is using Light/)).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /^Light/ }));
      expect(setFxMode).toHaveBeenCalledWith('lite');

      rerender(<SettingsModal {...props} fxMode="full" />);
      expect(screen.getByRole('radio', { name: /^Full/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText(/For power-saving mode, choose Light or Auto/)).toBeInTheDocument();
    });

    it('renders Session Duration inputs, Theme options, and Sound settings', () => {
      render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
          timerSettings={{ workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 }}
          saveTimerSettings={vi.fn()}
          onClearAllData={vi.fn()}
          onExportAllData={vi.fn()}
          onImportAllData={vi.fn()}
          companionType="dino"
          onSelectCompanion={vi.fn()}
          theme="dark"
          setTheme={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByText('Work Duration (mins)')).toBeInTheDocument();
      expect(screen.getByText('UI Sound Effects (UI SFX)')).toBeInTheDocument();
    });
  });

  describe('Screen: Settings follows the theme', () => {
    const settingsProps = {
      isOpen: true,
      onClose: vi.fn(),
      timerSettings: { workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 },
      saveTimerSettings: vi.fn(),
      onClearAllData: vi.fn(),
      onExportAllData: vi.fn(),
      onImportAllData: vi.fn(),
      setTheme: vi.fn(),
    };

    it('dresses the one settings page in each theme family\'s own look and words', () => {
      const cases = [
        ['light', 'crisp', 'Everything in its place.'],
        ['dark', 'crisp', 'Everything in its place.'],
        ['sketch', 'sketch', 'Everything in its place.'],
        ['surreal', 'surreal', 'Tune the dream.'],
        ['lantern-night', 'lantern', 'Tend the garden.'],
        ['komorebi', 'komorebi', 'Arrange the room.']
      ];
      for (const [theme, family, subtitle] of cases) {
        const { unmount } = render(<SettingsModal {...settingsProps} theme={theme} />);
        expect(document.querySelector('.atl-card').dataset.family).toBe(family);
        expect(screen.getByText(subtitle)).toBeInTheDocument();
        unmount();
      }
    });

    it('offers every theme from the Crisp settings page', () => {
      render(<SettingsModal {...settingsProps} theme="light" />);
      fireEvent.click(screen.getByText('Surreal'));
      expect(settingsProps.setTheme).toHaveBeenCalledWith('surreal');
    });

    it('asks in-app before clearing all data', () => {
      const onClearAllData = vi.fn();
      const confirmSpy = vi.spyOn(window, 'confirm');
      render(<SettingsModal {...settingsProps} theme="light" onClearAllData={onClearAllData} />);
      fireEvent.click(screen.getByRole('button', { name: /Clear All Data/i }));
      expect(onClearAllData).not.toHaveBeenCalled();
      fireEvent.click(document.querySelector('.confirm-dialog-confirm'));
      expect(onClearAllData).toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('shows The Atelier in the Surreal theme', () => {
      render(<SettingsModal {...settingsProps} theme="surreal-night" />);
      expect(document.querySelector('.atl-card')).toBeInTheDocument();
      expect(screen.getByText('Tune the dream.')).toBeInTheDocument();
      expect(screen.getByText('Work Duration (mins)')).toBeInTheDocument();
    });
  });

  // ═══════════════ 9. SCREEN: COMPANION PET WARDROBE MODAL ═══════════════
  describe('Screen: Companion Pet Wardrobe Modal', () => {
    it('renders companion pet selection grid', () => {
      render(
        <CompanionPickerModal
          isOpen={true}
          onClose={vi.fn()}
          activeCompanion="dino"
          onSelectCompanion={vi.fn()}
        />
      );

      expect(screen.getByText('🐾 Focus Pet Wardrobe')).toBeInTheDocument();
      expect(screen.getByText('Choose your loyal productivity companion')).toBeInTheDocument();
    });
  });

  // ═══════════════ 10. SCREEN: FLOATING MINI TIMER ═══════════════
  describe('Screen: Floating Mini Timer', () => {
    it('renders compact floating timer indicator', () => {
      render(
        <MiniTimer
          timeLeft={15 * 60}
          isRunning={true}
          startTimer={vi.fn()}
          pauseTimer={vi.fn()}
          onClick={vi.fn()}
          mode="work"
        />
      );

      expect(screen.getByText('15:00')).toBeInTheDocument();
    });
  });

  // ═══════════════ 12. SCREEN: LENIS & GSAP INTEGRATION ═══════════════
  describe('Screen: Lenis & GSAP Motion Integration', () => {
    it('triggers gsapMotion kinetic pulse without errors', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      expect(() => gsapMotion.pulse(el)).not.toThrow();
      document.body.removeChild(el);
    });
  });

  // ═══════════════ 13. SCREEN: SKIPER UI ANIMATED LINKS (skiper40) ═══════════════
  describe('Screen: Skiper UI Animated Links (@skiper-ui/skiper40)', () => {
    it('renders all 5 cursor-inspired animated link variations', () => {
      render(
        <div>
          <Link001 href="https://skiper-ui.com">Skiper UI</Link001>
          <Link002 href="https://threeui.com">ThreeUI</Link002>
          <Link003 href="https://godly.website">Godly</Link003>
          <Link004 href="https://designspells.com">Design Spells</Link004>
          <Link005 href="https://shadergradient.co">ShaderGradient</Link005>
        </div>
      );

      expect(screen.getByText('Skiper UI')).toBeInTheDocument();
      expect(screen.getByText('ThreeUI')).toBeInTheDocument();
      expect(screen.getByText('Godly')).toBeInTheDocument();
      expect(screen.getByText('Design Spells')).toBeInTheDocument();
      expect(screen.getByText('ShaderGradient')).toBeInTheDocument();
    });

    it('renders Design Resources & Toolkits in SettingsModal with skiper links', () => {
      render(
        <SettingsModal
          isOpen={true}
          onClose={() => {}}
          timerSettings={{ workDuration: 25, breakDuration: 5 }}
          saveTimerSettings={() => {}}
        />
      );

      expect(screen.getByText('Design Resources & Toolkits')).toBeInTheDocument();
      expect(screen.getByText('Skiper UI (@skiper40)')).toBeInTheDocument();
      expect(screen.getByText('ThreeUI (DesignCode)')).toBeInTheDocument();
    });

    it('shows plain timer presets and no pseudo-technical labels (Steve R44-D1)', () => {
      render(<App />);
      const preset = screen.getByRole('button', { name: '25 minutes' });
      expect(preset.textContent.trim()).toBe('25');
      expect(screen.queryByText(/^Aim:?$/i)).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /What are you giving this session to/i })).toBeInTheDocument();
    });

    it('has no dashboard lock screen or fixed PIN', () => {
      render(<App />);
      expect(screen.queryByTitle(/Lock Dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/PIN 1234/i)).not.toBeInTheDocument();
    });
  });
});
