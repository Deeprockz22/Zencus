import React, { useMemo } from 'react';
import { isLockedNote } from '../../utils/noteCrypto';
import {
  Pin,
  Trash2,
  Download,
  Tag,
  Lock,
  RotateCcw,
  Folder,
  Image as ImageIcon,
  Clock,
  FileText
} from 'lucide-react';

export default function NoteCard({
  note,
  onOpen,
  onPin,
  onDelete,
  onRestore,
  onExport,
  onTagClick,
  tags: noteTags = [],
  isTrashView = false,
  viewMode = 'grid'
}) {
  const isLocked = isLockedNote(note);

  // Extract drawing / image thumbnail if present
  const hasImage = note.content && note.content.includes('<img');

  const plainSnippet = useMemo(() => {
    if (!note.content) return 'No additional content...';
    return note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [note.content]);

  // Hashtags (hidden for locked notes)
  const tags = isLocked ? [] : noteTags.slice(0, 3);

  // Compute word count & reading time
  const readingStats = useMemo(() => {
    const words = plainSnippet.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 180));
    return { words, readingTime: `${mins}m read` };
  }, [plainSnippet]);

  const formattedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const noteColorClass = note.color ? `note-color-${note.color}` : 'note-color-default';

  return (
    <div
      className={`note-card unboxed-note-card ${note.pinned ? 'pinned' : ''} ${isLocked ? 'locked' : ''} ${noteColorClass} view-${viewMode} py-4 border-b border-[var(--border-subtle)] transition-colors hover:bg-white/[0.02] cursor-pointer group`}
      onClick={() => onOpen(note)}
    >
      <div className="note-card-inner">
        {/* Header */}
        <div className="note-card-header flex items-center justify-between gap-2 mb-1.5">
          <div className="note-title-wrapper flex items-center gap-2 flex-1 min-w-0">
            {isLocked ? (
              <Lock size={14} className="note-lock-badge text-[#ff3b30] shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] shrink-0" />
            )}
            <h3 className="note-card-title font-semibold tracking-tight text-sm text-[var(--text-primary)] truncate">
              {note.title || 'Untitled Note'}
            </h3>
          </div>

          {!isTrashView && (
            <button
              className={`pin-btn p-1 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors rounded-full ${note.pinned ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onPin(note.id);
              }}
              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
              aria-label={note.pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin size={13} className={note.pinned ? 'fill-current text-[#ff3b30]' : ''} />
            </button>
          )}
        </div>

        {/* Content Snippet or Lock Blur */}
        {isLocked ? (
          <div className="locked-note-placeholder py-2 text-xs text-[var(--text-muted)] flex items-center gap-2">
            <Lock size={14} className="lock-blur-icon opacity-50" />
            <span>PIN protected</span>
          </div>
        ) : (
          <p className="note-card-snippet font-sans text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-2 opacity-80">
            {plainSnippet}
          </p>
        )}

        {/* Tag Pills (Nothing Micro-Brackets) */}
        {!isLocked && tags.length > 0 && (
          <div className="note-card-tags flex items-center gap-2 mb-2 flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="note-tag-chip text-[11px] text-[var(--text-secondary)] opacity-70 hover:opacity-100 hover:text-[#ff3b30] transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(t);
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="note-card-footer flex items-center justify-between text-[11px] font-medium text-[var(--text-tertiary)] pt-1">
          <div className="note-footer-meta flex items-center gap-3">
            {note.folder && note.folder !== 'all' && (
              <span className="note-folder-tag opacity-60 capitalize">
                {note.folder}
              </span>
            )}
            {hasImage && !isLocked && (
              <span className="note-has-image-indicator opacity-60" title="Contains Drawing / Image">
                <ImageIcon size={11} />
              </span>
            )}
            {!isLocked && readingStats.words >= 150 && (
              <span className="note-stats-pill opacity-50" title={`${readingStats.words} words`}>
                {readingStats.readingTime}
              </span>
            )}
            <span className="note-date opacity-40">{formattedDate}</span>
          </div>

          <div className="note-footer-actions flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {isTrashView ? (
              <>
                <button
                  className="note-icon-action restore p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(note.id);
                  }}
                  title="Restore Note"
                  aria-label="Restore Note"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  className="note-icon-action delete p-1 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id, true); // permanent (the hub asks to confirm)
                  }}
                  title="Delete Forever"
                  aria-label="Delete Forever"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="note-icon-action p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(note);
                  }}
                  title="Export as Markdown (.md)"
                  aria-label="Export Markdown"
                >
                  <Download size={13} />
                </button>
                <button
                  className="note-icon-action delete p-1 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id, false); // soft delete to trash
                  }}
                  title="Move to Trash"
                  aria-label="Move to Trash"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
