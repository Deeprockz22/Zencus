import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import './session-debrief.css';

/*
 * SessionDebrief — a 20-second reflection when a focus session ends.
 *
 * Borrowed from Session's intention/reflection loop, with a Zencus twist:
 * the answer doesn't vanish into a stats screen. "What did you get done?"
 * is saved to your notes as a #focuslog entry stamped with the session's
 * length and task, and "What's next?" can become a task in one tap — so a
 * finished session feeds straight into the next one (timer → notes → tasks).
 *
 * It never blocks: it sits above the dock, Skip or Escape closes it, and
 * nothing is saved unless you write something.
 */

export const FEELINGS = [
  { id: 'energised', glyph: '⚡', label: 'Energised' },
  { id: 'steady', glyph: '🙂', label: 'Steady' },
  { id: 'drained', glyph: '😮‍💨', label: 'Drained' },
  { id: 'scattered', glyph: '🌀', label: 'Scattered' },
];

export default function SessionDebrief({
  open,
  minutes,
  taskTitle,
  intention = '',
  parkedThoughts = [],
  distractionCount = 0,
  onSave,
  onSkip
}) {
  const [done, setDone] = useState('');
  const [next, setNext] = useState('');
  const [feel, setFeel] = useState(null);
  const [addTask, setAddTask] = useState(true);
  const doneRef = useRef(null);

  // fresh card for every session
  useEffect(() => {
    if (!open) return;
    setDone('');
    setNext('');
    setFeel(null);
    setAddTask(true);
    const t = setTimeout(() => doneRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onSkip?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onSkip]);

  if (!open) return null;

  const canSave = done.trim() || next.trim() || parkedThoughts.length > 0;
  const save = (e) => {
    e?.preventDefault();
    if (!canSave) return;
    const payload = {
      done: done.trim(),
      next: next.trim(),
      feel,
      addTask: addTask && !!next.trim()
    };
    if (parkedThoughts && parkedThoughts.length > 0) {
      payload.parkedThoughts = parkedThoughts;
    }
    if (distractionCount > 0) {
      payload.distractionCount = distractionCount;
    }
    onSave?.(payload);
  };

  return (
    <div className="debrief-layer" role="dialog" aria-modal="false" aria-labelledby="debrief-title">
      <form className="debrief-card" onSubmit={save}>
        <button type="button" className="debrief-close" onClick={onSkip} aria-label="Skip reflection">
          <X size={16} />
        </button>

        <div className="debrief-head">
          <span className="debrief-kicker">Session complete · {minutes} min{taskTitle ? ` · ${taskTitle}` : ''}</span>
          <h3 id="debrief-title" className="debrief-title">How did that go?</h3>
          {intention && (
            <div className="debrief-intention-callout">
              <span className="debrief-intention-label">Intention:</span> “{intention}”
            </div>
          )}
        </div>

        <label className="debrief-field">
          <span>What did you get done?</span>
          <input
            ref={doneRef}
            value={done}
            onChange={(e) => setDone(e.target.value)}
            placeholder="Finished the intro section…"
            maxLength={140}
          />
        </label>

        <label className="debrief-field">
          <span>What's next?</span>
          <input
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Outline section two"
            maxLength={120}
          />
        </label>

        {parkedThoughts && parkedThoughts.length > 0 && (
          <div className="debrief-parked-summary">
            <span className="debrief-parked-label">🍃 Parked Thoughts ({parkedThoughts.length}):</span>
            <div className="debrief-parked-tags">
              {parkedThoughts.map((pt, idx) => (
                <span key={idx} className="debrief-parked-tag">{pt}</span>
              ))}
            </div>
          </div>
        )}

        <div className="debrief-feel" role="radiogroup" aria-label="How do you feel?">
          {FEELINGS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={feel === f.id}
              className={`debrief-chip ${feel === f.id ? 'is-on' : ''}`}
              onClick={() => setFeel(feel === f.id ? null : f.id)}
            >
              <span aria-hidden="true">{f.glyph}</span> {f.label}
            </button>
          ))}
        </div>

        <div className="debrief-foot">
          <label className={`debrief-totask ${next.trim() ? '' : 'is-muted'}`}>
            <input type="checkbox" checked={addTask} onChange={(e) => setAddTask(e.target.checked)} disabled={!next.trim()} />
            <span>Add “next” as a task</span>
          </label>
          <div className="debrief-actions">
            <button type="button" className="debrief-skip" onClick={onSkip}>Skip</button>
            <button type="submit" className="debrief-save btn-action" disabled={!canSave}>Save to notes</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/** The note a debrief becomes (kept separate so it's easy to test). */
export function debriefToNote({ done, next, feel, intention, parkedThoughts, distractionCount }, { minutes, taskTitle }) {
  const feeling = FEELINGS.find((f) => f.id === feel);
  const lines = [];
  if (intention) lines.push(`Intention: ${intention}`);
  if (done) lines.push(`Done: ${done}`);
  if (next) lines.push(`Next: ${next}`);
  if (feeling) lines.push(`Felt: ${feeling.glyph} ${feeling.label.toLowerCase()}`);
  if (parkedThoughts && parkedThoughts.length > 0) {
    lines.push(`Parked thoughts: ${parkedThoughts.join(' · ')}`);
  }
  if (distractionCount > 0) {
    lines.push(`Distraction tally: ${distractionCount}`);
  }
  lines.push('', '#focuslog');
  return {
    title: `Focus · ${minutes} min${taskTitle ? ` · ${taskTitle}` : ''}`,
    content: lines.join('\n'),
    folder: 'quick',
    updatedAt: new Date().toISOString(),
  };
}
