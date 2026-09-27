import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Trash2,
  Download,
  Save,
  PenTool,
  Table,
  Lock,
  Unlock,
  Image as ImageIcon,
  Folder,
  BarChart2,
  Palette,
  Eye,
  Edit3,
  Sparkles,
  Check,
  Target
} from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';
import SketchCanvasModal from '../canvas/SketchCanvasModal';
import NoteLockModal from '../security/NoteLockModal';
import { Sanitizer } from '../../utils/sanitize';

const COLOR_OPTIONS = [
  { id: 'default', label: 'Obsidian', color: 'rgba(255,255,255,0.1)' },
  { id: 'amber', label: 'Amber Gold', color: '#f59e0b' },
  { id: 'emerald', label: 'Emerald Forest', color: '#10b981' },
  { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
  { id: 'violet', label: 'Midnight Violet', color: '#8b5cf6' },
  { id: 'rose', label: 'Sunset Rose', color: '#f43f5e' }
];

export default function NoteEditorModal({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onExport,
  onConvertToTask,
  customFolders = []
}) {
  const [currentNoteId, setCurrentNoteId] = useState(note?.id || null);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('quick');
  const [noteColor, setNoteColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [pin, setPin] = useState(null);
  const [previewMode, setPreviewMode] = useState(false); // Split/Live preview
  const [previewHtml, setPreviewHtml] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved to Local Vault');

  // Modals for Sketch and Lock
  const [isSketchOpen, setIsSketchOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockMode, setLockMode] = useState('set'); // 'set' | 'remove'

  // Intelligence stats
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 1 });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentNoteIdRef = useRef(note?.id || null);
  // True once the person changes something; opening and closing a note never rewrites it
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (note) {
      const nextNoteId = note.id || null;
      currentNoteIdRef.current = nextNoteId;
      setCurrentNoteId(nextNoteId);
      setTitle(note.title || '');
      setFolder(note.folder || 'quick');
      setNoteColor(note.color || 'default');
      setIsPinned(note.pinned || false);
      setPin(note.pin || null);
      const cleanContent = note.content || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = cleanContent;
      }
      setPreviewHtml(Sanitizer.clean(cleanContent));
    } else {
      currentNoteIdRef.current = null;
      setCurrentNoteId(null);
      setTitle('');
      setFolder('quick');
      setNoteColor('default');
      setIsPinned(false);
      setPin(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setPreviewHtml('');
    }
    setPreviewMode(false);
    isDirtyRef.current = false;
    setAutoSaveStatus('Saved to Local Vault');
    computeStats();
  }, [note, isOpen]);

  const computeStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 180));
    setStats({ words, chars, readingTime });
  };

  const markDirty = () => {
    isDirtyRef.current = true;
    setAutoSaveStatus('Editing...');
  };

  const updateStats = () => {
    computeStats();
    markDirty();
  };

  const handleSave = (shouldClose = false) => {
    const currentHtml = editorRef.current ? Sanitizer.clean(editorRef.current.innerHTML) : '';
    const noteTitle = title.trim();
    const existingNoteId = currentNoteIdRef.current || note?.id || null;

    // Save only real changes: new notes need a title or content, existing ones an edit
    const shouldSave = existingNoteId ? isDirtyRef.current : Boolean(noteTitle || currentHtml.trim());
    if (shouldSave) {
      const saved = onSave({
        id: existingNoteId,
        title: noteTitle || 'Untitled Note',
        content: currentHtml,
        folder,
        color: noteColor,
        pinned: isPinned,
        pin,
        updatedAt: new Date().toISOString()
      });
      if (saved?.id) {
        currentNoteIdRef.current = saved.id;
        setCurrentNoteId(saved.id);
      }
      isDirtyRef.current = false;
      setAutoSaveStatus('Saved to Local Vault');
    }
    if (shouldClose) {
      onClose();
    }
  };

  // Keyboard Shortcuts: Cmd+S / Ctrl+S to save in place, Escape to save & close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave(false);
      } else if (e.key === 'Escape' && !isSketchOpen && !isLockModalOpen) {
        e.preventDefault();
        handleSave(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentNoteId, note, title, folder, noteColor, isPinned, pin, isSketchOpen, isLockModalOpen]);

  // Debounced auto-save (1.5s after user stops typing)
  useEffect(() => {
    if (!isOpen || autoSaveStatus !== 'Editing...') return;

    const timer = setTimeout(() => {
      handleSave(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isOpen, autoSaveStatus, title, folder, noteColor, isPinned, pin, currentNoteId]);

  const togglePreviewMode = () => {
    if (!previewMode) {
      const currentHtml = editorRef.current ? Sanitizer.clean(editorRef.current.innerHTML) : '';
      setPreviewHtml(currentHtml);
      setPreviewMode(true);
    } else {
      setPreviewMode(false);
      setTimeout(() => {
        editorRef.current?.focus();
      }, 50);
    }
  };

  // Toolbar actions always land in the note body: if the caret is elsewhere
  // (e.g. still in the title), put it at the end of the body first.
  const ensureEditorSelection = () => {
    const el = editorRef.current;
    if (!el) return null;
    const selection = window.getSelection();
    const inEditor = selection.rangeCount > 0 && el.contains(selection.getRangeAt(0).commonAncestorContainer);
    if (!inEditor) {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.activeElement !== el) {
      el.focus();
    }
    return selection;
  };

  const executeCommand = (command, value = null) => {
    ensureEditorSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      updateStats();
    }
  };

  // A checkbox's ticked state is a property, not markup; mirror it into the
  // `checked` attribute so it's kept when the note is saved.
  const handleEditorClick = (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      if (target.checked) target.setAttribute('checked', '');
      else target.removeAttribute('checked');
      markDirty();
    }
  };

  const insertChecklist = () => {
    const selection = ensureEditorSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const checkHtml = '<div class="checklist-row"><input type="checkbox" /> <span>&nbsp;</span></div>';
    const fragment = range.createContextualFragment(checkHtml);
    range.insertNode(fragment);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table class="note-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ambient Mode</td>
            <td>Completed</td>
            <td>High</td>
          </tr>
          <tr>
            <td>Notes Hub</td>
            <td>Revamped</td>
            <td>Essential</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const handleEmbedDrawing = (dataUrl) => {
    const imgHtml = `<p><img src="${dataUrl}" class="embedded-drawing" alt="Sketch Drawing" /><br/></p>`;
    executeCommand('insertHTML', imgHtml);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const imgHtml = `<p><img src="${dataUrl}" class="embedded-image" alt="${file.name}" /><br/></p>`;
      executeCommand('insertHTML', imgHtml);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={() => handleSave(true)}>
        <div className={`modal-card note-modal-card note-color-${noteColor}`} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="note-title-container">
              <span className={`note-color-badge ${noteColor}`} />
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Note Title (e.g. #Project Planning)..."
                aria-label="Note title"
                className="note-title-modal-input"
                autoFocus
              />
            </div>

            <div className="modal-header-actions">
              {/* Folder Selector */}
              <div className="folder-select-wrapper">
                <Folder size={14} className="folder-icon-select" />
                <select
                  value={folder}
                  onChange={(e) => {
                    setFolder(e.target.value);
                    markDirty();
                  }}
                  className="note-folder-select"
                >
                  <option value="quick">Quick Notes</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="ideas">Ideas</option>
                  <option value="archive">Archive</option>
                  {customFolders
                    .filter((f) => typeof f === 'object' && f.id)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Color Theme Selector */}
              <div className="note-color-picker-dropdown">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-dot-btn ${noteColor === c.id ? 'active' : ''}`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    onClick={() => {
                      setNoteColor(c.id);
                      markDirty();
                    }}
                  >
                    {noteColor === c.id && (
                      <Check
                        size={10}
                        color={c.id === 'default' ? 'var(--text-primary)' : '#000'}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Preview Toggle */}
              <button
                type="button"
                className={`icon-btn ${previewMode ? 'active' : ''}`}
                onClick={togglePreviewMode}
                title={previewMode ? 'Switch to Edit Mode' : 'Switch to Reader Preview'}
              >
                {previewMode ? <Edit3 size={15} /> : <Eye size={15} />}
              </button>

              {/* Lock Button */}
              <button
                type="button"
                className={`icon-btn ${pin ? 'locked-active' : ''}`}
                onClick={() => {
                  setLockMode(pin ? 'remove' : 'set');
                  setIsLockModalOpen(true);
                }}
                title={pin ? 'Protected with PIN (Click to remove)' : 'Lock note with 4-digit PIN'}
              >
                {pin ? <Lock size={15} color="#eab308" /> : <Unlock size={15} />}
              </button>

              <button
                type="button"
                className="icon-btn close-modal-btn"
                onClick={() => handleSave(true)}
                title="Save & Close (Esc)"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Formatting & Media Toolbar */}
          {!previewMode && (
            <div className="editor-toolbar">
              {/* Heading formats */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('formatBlock', '<h1>')}
                title="Heading 1"
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('formatBlock', '<h2>')}
                title="Heading 2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('formatBlock', '<h3>')}
                title="Heading 3"
              >
                <Heading3 size={15} />
              </button>

              <span className="toolbar-separator" />

              {/* Inline styles */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('bold')}
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('italic')}
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('underline')}
                title="Underline (Ctrl+U)"
              >
                <Underline size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('strikeThrough')}
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>

              <span className="toolbar-separator" />

              {/* Lists */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('insertUnorderedList')}
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('insertOrderedList')}
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={insertChecklist}
                title="Interactive Checklist"
              >
                <CheckSquare size={15} />
              </button>

              <span className="toolbar-separator" />

              {/* Table */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={insertTable}
                title="Insert Markdown Table"
              >
                <Table size={15} />
              </button>

              {/* Freehand Sketchpad Drawing */}
              <button
                type="button"
                className="toolbar-btn media-tool-btn"
                onClick={() => setIsSketchOpen(true)}
                title="Draw Sketch & Embed"
              >
                <PenTool size={14} />
                <span className="tool-label">Sketch</span>
              </button>

              {/* Image */}
              <button
                type="button"
                className="toolbar-btn media-tool-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Image"
              >
                <ImageIcon size={14} />
                <span className="tool-label">Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </button>

              <span className="toolbar-separator" />

              {/* Quotes & Code */}
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('formatBlock', '<blockquote>')}
                title="Quote"
              >
                <Quote size={15} />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => executeCommand('formatBlock', '<pre>')}
                title="Code Block"
              >
                <Code size={15} />
              </button>
            </div>
          )}

          {/* Rich Content Area and Preview (Both stay mounted to preserve editor contents & state) */}
          <div
            className="rich-note-editor reader-preview"
            style={{ display: previewMode ? 'block' : 'none' }}
            dangerouslySetInnerHTML={{
              __html: previewHtml || '<p style="color: var(--text-tertiary); font-style: italic;">No content to preview yet...</p>'
            }}
          />

          <div
            ref={editorRef}
            className="rich-note-editor"
            style={{ display: previewMode ? 'none' : 'block' }}
            contentEditable="true"
            data-placeholder="Start typing your thoughts, markdown notes (#tags), sketch ideas, or organize tasks..."
            onInput={updateStats}
            onClick={handleEditorClick}
            suppressContentEditableWarning
          />

          {/* Modal Footer with Live Metrics */}
          <div className="modal-footer">
            <div className="footer-left">
              <div className="note-live-stats">
                <BarChart2 size={13} />
                <span>{stats.words} words</span>
                <span className="stat-dot">•</span>
                <span>{stats.chars} chars</span>
                <span className="stat-dot">•</span>
                <span>{stats.readingTime} min read</span>
                <span className="stat-dot">•</span>
                <span className="autosave-pill">{autoSaveStatus}</span>
              </div>
            </div>

            <div className="footer-right">
              {(currentNoteId || note?.id) && (
                <button
                  type="button"
                  className="footer-btn delete"
                  onClick={() => {
                    onDelete(currentNoteId || note.id);
                    onClose();
                  }}
                  title="Delete this note"
                >
                  <Trash2 size={15} />
                </button>
              )}

              {onConvertToTask && (
                <button
                  type="button"
                  className="footer-btn text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  style={{ marginRight: '8px' }}
                  onClick={() => {
                    handleSave(false);
                    onConvertToTask(title || 'Untitled Task from Notes');
                    onClose();
                  }}
                  title="Turn this note into an actionable Task"
                >
                  <Target size={15} style={{ marginRight: 4 }} />
                  <span>Turn into Task</span>
                </button>
              )}

              <MagnetButton
                className="btn-action primary modal-save-btn"
                onClick={() => handleSave(true)}
              >
                <Save size={15} />
                <span>Done</span>
              </MagnetButton>
            </div>
          </div>
        </div>
      </div>

      {/* Sketchpad Whiteboard Modal */}
      <SketchCanvasModal
        isOpen={isSketchOpen}
        onClose={() => setIsSketchOpen(false)}
        onEmbedDrawing={handleEmbedDrawing}
      />

      {/* PIN Security Modal */}
      <NoteLockModal
        isOpen={isLockModalOpen}
        mode={lockMode}
        correctPin={pin}
        onClose={() => setIsLockModalOpen(false)}
        onSuccess={(newPin) => {
          if (lockMode === 'set') {
            setPin(newPin);
          } else if (lockMode === 'remove') {
            setPin(null);
          }
          markDirty();
        }}
      />
    </>
  );
}
