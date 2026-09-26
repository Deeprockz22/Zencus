import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFocusSessionHistory,
  recordFocusSession,
  clearFocusSessionHistory,
  getSteppingStoneStats,
} from './focusSessionHistory';

describe('focusSessionHistory Foundation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records a session with intention, distraction count and theme', () => {
    const entry = recordFocusSession({
      durationMinutes: 25,
      mode: 'work',
      theme: 'komorebi-dawn',
      intention: 'Write clean foundation code',
      distractionCount: 2,
      parkedThoughts: ['Buy oat milk', 'Check email'],
      feel: 'energised',
    });

    expect(entry).not.toBeNull();
    expect(entry.intention).toBe('Write clean foundation code');
    expect(entry.distractionCount).toBe(2);
    expect(entry.parkedCount).toBe(2);

    const history = getFocusSessionHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(entry.id);
  });

  it('calculates stepping stone stats correctly (1 stone per 4 sessions up to 7 max)', () => {
    for (let i = 0; i < 9; i++) {
      recordFocusSession({ durationMinutes: 25 });
    }

    const stats = getSteppingStoneStats();
    expect(stats.totalSessions).toBe(9);
    expect(stats.totalMinutes).toBe(225);
    expect(stats.totalHours).toBe(3.8);
    expect(stats.stonesEarned).toBe(2); // 9 / 4 = 2 stones
  });

  it('clears history gracefully', () => {
    recordFocusSession({ durationMinutes: 25 });
    clearFocusSessionHistory();
    expect(getFocusSessionHistory()).toEqual([]);
  });
});
