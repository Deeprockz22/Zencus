// src/utils/focusSessionHistory.js
// Foundation for Stepping Stone Focus History (#18 & #23)
// Stores minimal, local-first session logs without invasive tracking or gamification traps.

const STORAGE_KEY = 'thelidhu_focus_history';
const MAX_ENTRIES = 365;

export function getFocusSessionHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load focus session history:', e);
    return [];
  }
}

export function recordFocusSession(sessionData) {
  if (typeof window === 'undefined') return null;
  try {
    const history = getFocusSessionHistory();
    const entry = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      durationMinutes: sessionData.durationMinutes || 25,
      mode: sessionData.mode || 'work',
      theme: sessionData.theme || 'komorebi-dawn',
      intention: sessionData.intention ? sessionData.intention.trim() : '',
      distractionCount: typeof sessionData.distractionCount === 'number' ? sessionData.distractionCount : 0,
      parkedCount: Array.isArray(sessionData.parkedThoughts) ? sessionData.parkedThoughts.length : 0,
      feel: sessionData.feel || null,
    };

    const updated = [entry, ...history].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (e) {
    console.error('Failed to record focus session:', e);
    return null;
  }
}

export function clearFocusSessionHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear focus history:', e);
  }
}

export function getSteppingStoneStats(history = null) {
  const list = history || getFocusSessionHistory();
  const totalMinutes = list.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
  const totalSessions = list.length;
  // A river stone is earned every 4 completed sessions (matching Steve's Komorebi garden specification)
  const stonesEarned = Math.min(7, Math.floor(totalSessions / 4));

  return {
    totalSessions,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    stonesEarned,
  };
}
