import React, { useMemo } from 'react';
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
import SpotlightCard from '../react-bits/SpotlightCard';

export default function NoteCard({
  note,
  onOpen,
  onPin,
  onDelete,
  onRestore,
  onExport,
  onTagClick,
  isTrashView = false,
  viewMode = 'grid'
}) {
  const isLocked = Boolean(note.pin);

  // Extract drawing / image thumbnail if present
  const hasImage = note.content && note.content.includes('<img');

  const plainSnippet = useMemo(() => {
    if (!note.content) return 'No additional content...';
    return note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [note.content]);

  // Extract hashtags from content
  const tags = useMemo(() => {
    if (isLocked || !note.content) return [];
    const combined = `${note.title || ''} ${note.content || ''}`;
    const matches = combined.match(/#[a-zA-Z0-9_\-]+/g);
    return matches ? Array.from(new Set(matches)).slice(0, 3) : [];
  }, [note.title, note.content, isLocked]);

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
    <SpotlightCard
      className={`note-card ${note.pinned ? 'pinned' : ''} ${isLocked ? 'locked' : ''} ${noteColorClass} view-${viewMode}`}
      onClick={() => onOpen(note)}
      spotlightColor="rgba(255, 255, 255, 0.12)"
    >
      <div className="note-card-inner">
        {/* Header */}
        <div className="note-card-header">
          <div className="note-title-wrapper">
            {isLocked ? (
              <Lock size={14} className="note-lock-badge" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" className="note-editorial-ribbon-glyph mr-1.5 shrink-0">
                <g transform="translate(12, 12) scale(0.6)">
                  <path d="M0,0 L8,8 L0,16 L-8,8 Z" fill="#ff3b30" />
                  <path d="M0,0 L8,-8 L16,0 L8,8 Z" fill="#121212" />
                  <path d="M0,0 L-8,-8 L0,-16 L8,-8 Z" fill="#ff3b30" />
                  <path d="M0,0 L-8,8 L-16,0 L-8,-8 Z" fill="#121212" />
                </g>
              </svg>
            )}
            <h3 className="note-card-title font-bold tracking-tight">{note.title || 'Untitled Note'}</h3>
          </div>

          {!isTrashView && (
            <button
              className={`pin-btn ${note.pinned ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onPin(note.id);
              }}
              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
              aria-label={note.pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin size={14} className={note.pinned ? 'fill-current text-[#ff3b30]' : ''} />
            </button>
          )}
        </div>

        {/* Content Snippet or Lock Blur */}
        {isLocked ? (
          <div className="locked-note-placeholder">
            <Lock size={20} className="lock-blur-icon" />
            <span>Encrypted Vault Note</span>
          </div>
        ) : (
          <p className="note-card-snippet">{plainSnippet}</p>
        )}

        {/* Tag Pills */}
        {!isLocked && tags.length > 0 && (
          <div className="note-card-tags">
            {tags.map((t) => (
              <span
                key={t}
                className="note-tag-chip"
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
        <div className="note-card-footer">
          <div className="note-footer-meta">
            {note.folder && note.folder !== 'all' && (
              <span className="note-folder-tag">
                <Folder size={11} />
                <span>{note.folder}</span>
              </span>
            )}
            {hasImage && !isLocked && (
              <span className="note-has-image-indicator" title="Contains Drawing / Image">
                <ImageIcon size={11} />
              </span>
            )}
            {!isLocked && plainSnippet !== 'No additional content...' && (
              <span className="note-stats-pill" title={`${readingStats.words} words`}>
                <Clock size={10} />
                <span>{readingStats.readingTime}</span>
              </span>
            )}
            <span className="note-date">{formattedDate}</span>
          </div>

          <div className="note-footer-actions">
            {isTrashView ? (
              <>
                <button
                  className="note-icon-action restore"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(note.id);
                  }}
                  title="Restore Note"
                  aria-label="Restore Note"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  className="note-icon-action delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id, true); // permanent
                  }}
                  title="Delete Forever"
                  aria-label="Delete Forever"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="note-icon-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(note);
                  }}
                  title="Export as Markdown (.md)"
                  aria-label="Export Markdown"
                >
                  <Download size={14} />
                </button>
                <button
                  className="note-icon-action delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id, false); // soft delete to trash
                  }}
                  title="Move to Trash"
                  aria-label="Move to Trash"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
