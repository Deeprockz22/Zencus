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
  Check
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
  folders = ['quick', 'work', 'personal', 'ideas', 'archive']
}) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('quick');
  const [noteColor, setNoteColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [pin, setPin] = useState(null);
  const [previewMode, setPreviewMode] = useState(false); // Split/Live preview
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved to Local Vault');

  // Modals for Sketch and Lock
  const [isSketchOpen, setIsSketchOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockMode, setLockMode] = useState('set'); // 'set' | 'remove'

  // Intelligence stats
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 1 });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setFolder(note.folder || 'quick');
      setNoteColor(note.color || 'default');
      setIsPinned(note.pinned || false);
      setPin(note.pin || null);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || '';
      }
    } else {
      setTitle('');
      setFolder('quick');
      setNoteColor('default');
      setIsPinned(false);
      setPin(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
    setPreviewMode(false);
    setAutoSaveStatus('Saved to Local Vault');
    updateStats();
  }, [note, isOpen]);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 180));
    setStats({ words, chars, readingTime });
    setAutoSaveStatus('Editing...');
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
    }
  };

  const insertChecklist = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
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

  const handleClose = () => {
    const currentHtml = editorRef.current ? Sanitizer.clean(editorRef.current.innerHTML) : '';
    if (title.trim() || currentHtml.trim()) {
      onSave({
        id: note?.id,
        title: title.trim() || 'Untitled Note',
        content: currentHtml,
        folder,
        color: noteColor,
        pinned: isPinned,
        pin,
        updatedAt: new Date().toISOString()
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose}>
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
                  setAutoSaveStatus('Editing...');
                }}
                placeholder="Note Title (e.g. #Project Planning)..."
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
                    setAutoSaveStatus('Editing...');
                  }}
                  className="note-folder-select"
                >
                  <option value="quick">Quick Notes</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="ideas">Ideas</option>
                  <option value="archive">Archive</option>
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
                    onClick={() => setNoteColor(c.id)}
                  >
                    {noteColor === c.id && <Check size={10} color="#000" />}
                  </button>
                ))}
              </div>

              {/* Preview Toggle */}
              <button
                type="button"
                className={`icon-btn ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(!previewMode)}
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
                className="icon-btn close-modal-btn"
                onClick={handleClose}
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

              {/* Lists & Checklists */}
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
                title="Checklist Item"
              >
                <CheckSquare size={15} />
              </button>

              <span className="toolbar-separator" />

              {/* Sketch Drawing Canvas */}
              <button
                type="button"
                className="toolbar-btn media-tool-btn"
                onClick={() => setIsSketchOpen(true)}
                title="Draw / Sketch on Canvas"
              >
                <PenTool size={14} />
                <span className="tool-label">Sketch</span>
              </button>

              {/* Table */}
              <button
                type="button"
                className="toolbar-btn media-tool-btn"
                onClick={insertTable}
                title="Insert Table"
              >
                <Table size={14} />
                <span className="tool-label">Table</span>
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

          {/* Rich Content Area or Preview */}
          {previewMode ? (
            <div
              className="rich-note-editor reader-preview"
              dangerouslySetInnerHTML={{
                __html: editorRef.current ? editorRef.current.innerHTML : ''
              }}
            />
          ) : (
            <div
              ref={editorRef}
              className="rich-note-editor"
              contentEditable="true"
              data-placeholder="Start typing your thoughts, markdown notes (#tags), sketch ideas, or organize tasks..."
              onInput={updateStats}
              onKeyUp={updateStats}
              suppressContentEditableWarning
            />
          )}

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
              {note?.id && (
                <button
                  type="button"
                  className="footer-btn delete"
                  onClick={() => {
                    onDelete(note.id);
                    onClose();
                  }}
                  title="Delete this note"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <MagnetButton
                className="btn-action primary modal-save-btn"
                onClick={handleClose}
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
        }}
      />
    </>
  );
}
