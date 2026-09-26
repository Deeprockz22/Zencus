import React, { useState } from 'react';
import { Trash2, Edit2, Play } from 'lucide-react';
import AnimatedPathCheckbox from '../ui/AnimatedPathCheckbox';
import confetti from 'canvas-confetti';

export default function TaskItem({ task, onToggle, onDelete, onEdit, onFocus }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleToggle = (e) => {
    e?.stopPropagation?.();
    if (!task.completed) {
      // Trigger tiny celebratory confetti burst
      try {
        const rect = e?.currentTarget?.getBoundingClientRect?.();
        const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
        const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { x, y },
          colors: ['#22c55e', '#38bdf8', '#a855f7', '#ffd700']
        });
      } catch (err) {
        // Fallback gracefully
      }
    }
    onToggle(task.id);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim());
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`task-item-card ${task.completed ? 'completed' : ''} unboxed-task-row flex items-center justify-between py-3 border-b border-[var(--border-subtle)] transition-colors hover:bg-white/[0.02] group`}
    >
      <div className="task-item-content flex-1 flex items-center gap-3">
        <AnimatedPathCheckbox
          checked={task.completed}
          onChange={(newChecked) => handleToggle()}
          size="20px"
        />

        <div className="task-main flex-1 flex items-center gap-3 flex-wrap">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="task-edit-form flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                onBlur={handleSaveEdit}
                className="task-edit-input w-full bg-transparent border-b border-[#ff3b30] text-sm text-[var(--text-primary)] outline-none py-0.5"
              />
            </form>
          ) : (
            <span
              className={`task-text text-sm tracking-tight transition-all select-none ${
                task.completed ? 'line-through text-[var(--text-muted)] opacity-50' : 'text-[var(--text-primary)] font-medium'
              }`}
              onDoubleClick={() => setIsEditing(true)}
              title="Double click to edit"
            >
              {task.title}
            </span>
          )}

          <div className="task-badges flex items-center gap-1.5">
            {task.priority && (
              <span
                className={`priority-badge text-[11px] flex items-center gap-1 ${
                  task.priority === 'high' ? 'text-[#ff3b30] font-semibold' : 'text-[var(--text-secondary)]'
                }`}
              >
                {task.priority === 'high' && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
                )}
                <span>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
              </span>
            )}
            {task.category && (
              <>
                {task.priority && <span className="text-[var(--text-tertiary)] opacity-40 text-[11px]">·</span>}
                <span className="category-badge text-[11px] text-[var(--text-tertiary)]">
                  {task.category}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="task-actions flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {!task.completed && onFocus && (
            <button
              className="task-action-btn edit-btn p-1.5 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors rounded-full"
              onClick={() => onFocus(task.id)}
              title="Focus on this task"
              aria-label="Focus on this task"
            >
              <Play size={14} />
            </button>
          )}
          <button
            className="task-action-btn edit-btn p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="task-action-btn delete-btn p-1.5 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors rounded-full"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
