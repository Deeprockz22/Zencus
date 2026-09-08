import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileText,
  Pin,
  Tag,
  Sparkles,
  Folder,
  Trash2,
  Lock,
  Layers,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  X
} from 'lucide-react';
import NoteCard from './NoteCard';
import NoteEditorModal from './NoteEditorModal';
import FolderSidebar from './FolderSidebar';
import NoteLockModal from '../security/NoteLockModal';
import FocusCompanion from '../companion/FocusCompanion';
import MagnetButton from '../react-bits/MagnetButton';
import DecryptedText from '../react-bits/DecryptedText';
import LottieAnimation from '../ui/LottieAnimation';

export default function NotesHub({
  notes = [],
  saveNote,
  deleteNote,
  restoreNote,
  togglePin,
  customFolders = [],
  addCustomFolder,
  deleteCustomFolder,
  theme = 'dark',
  companionType = 'dino',
  onOpenPicker
}) {
  const [currentFolder, setCurrentFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Bento) | 'list'
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'title' | 'words'

  // Active note in editor
  const [activeNote, setActiveNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Unlock prompt modal for password protected notes
  const [unlockingNote, setUnlockingNote] = useState(null);

  // Extract all smart #hashtags across all non-deleted notes
  const availableTags = useMemo(() => {
    const tags = new Set();
    notes.forEach((n) => {
      if (n.trash) return;
      const combined = `${n.title || ''} ${n.content || ''}`;
      const matches = combined.match(/#[a-zA-Z0-9_\-]+/g);
      if (matches) {
        matches.forEach((t) => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [notes]);

  // Compute note counts per folder
  const notesCountByFolder = useMemo(() => {
    const counts = { all: 0, quick: 0, work: 0, personal: 0, ideas: 0, archive: 0, trash: 0 };
    customFolders.forEach((f) => (counts[f.id] = 0));

    notes.forEach((n) => {
      if (n.trash) {
        counts.trash = (counts.trash || 0) + 1;
      } else {
        counts.all = (counts.all || 0) + 1;
        const folderKey = n.folder || 'quick';
        counts[folderKey] = (counts[folderKey] || 0) + 1;
      }
    });

    return counts;
  }, [notes, customFolders]);

  const handleCreateNew = () => {
    setActiveNote({
      folder: currentFolder === 'trash' || currentFolder === 'all' ? 'quick' : currentFolder
    });
    setIsEditorOpen(true);
  };

  const handleOpenNote = (note) => {
    if (note.pin) {
      setUnlockingNote(note);
    } else {
      setActiveNote(note);
      setIsEditorOpen(true);
    }
  };

  const handleUnlockSuccess = () => {
    if (unlockingNote) {
      setActiveNote(unlockingNote);
      setIsEditorOpen(true);
      setUnlockingNote(null);
    }
  };

  const handleExportNote = (note) => {
    const title = note.title || 'Untitled';
    const content = note.content
      ? note.content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
          .replace(/<br\s*[\/]?>/gi, '\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<[^>]+>/g, '')
      : '';

    const markdownText = `# ${title}\n\n*Folder: ${note.folder || 'General'}*\n\n${content}`;
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter notes based on folder, search query, and hashtag
  const filteredNotes = useMemo(() => {
    let list = notes.filter((n) => {
      const isTrash = Boolean(n.trash);

      if (currentFolder === 'trash') {
        if (!isTrash) return false;
      } else {
        if (isTrash) return false;
        if (currentFolder !== 'all' && (n.folder || 'quick') !== currentFolder) return false;
      }

      if (selectedTag) {
        const combined = `${n.title || ''} ${n.content || ''}`;
        if (!combined.includes(selectedTag)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (n.title || '').toLowerCase().includes(q);
        const textContent = (n.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        const matchContent = textContent.includes(q);
        return matchTitle || matchContent;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [notes, currentFolder, selectedTag, searchQuery, sortBy]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned && !n.trash), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned || n.trash), [filteredNotes]);

  return (
    <div className="notes-hub-layout">
      {/* Folder Navigation Sidebar */}
      <FolderSidebar
        currentFolder={currentFolder}
        setCurrentFolder={(folder) => {
          setCurrentFolder(folder);
          setSelectedTag(null);
        }}
        customFolders={customFolders}
        onAddFolder={addCustomFolder}
        onDeleteFolder={deleteCustomFolder}
        notesCountByFolder={notesCountByFolder}
      />

      {/* Main Notes Content Area */}
      <div className="notes-main-area">
        {/* Cognitive Offloading Companion Banner */}
        <div className="notes-companion-banner">
          <FocusCompanion
            context="notes"
            theme={theme}
            state="idle"
            companionType={companionType}
            onOpenPicker={onOpenPicker}
          />
        </div>

        {/* View Header */}
        <div className="view-header">
          <div>
            <h2 className="view-title">
              <DecryptedText
                text={currentFolder === 'trash' ? 'Recently Deleted' : 'Brain Dump Vault'}
                speed={30}
                maxIterations={8}
              />
            </h2>
            <p className="view-subtitle">
              {currentFolder === 'trash'
                ? 'Items in trash can be restored or permanently removed'
                : 'Offload your ideas, sketches, and notes into your private vault.'}
            </p>
          </div>

          <div className="view-header-right-actions">
            {/* View Mode Switcher */}
            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Bento Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Compact List View"
              >
                <ListIcon size={15} />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="sort-select-wrapper">
              <ArrowUpDown size={13} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="notes-sort-select"
              >
                <option value="updated">Recent</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {currentFolder !== 'trash' && (
              <MagnetButton className="btn-action primary new-note-btn" onClick={handleCreateNew}>
                <Plus size={16} />
                <span>New Note</span>
              </MagnetButton>
            )}
          </div>
        </div>

        {/* Search & Smart Tags Bar */}
        <div className="notes-controls-row">
          <div className="search-bar-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, body text, or #tag..."
              className="notes-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {availableTags.length > 0 && currentFolder !== 'trash' && (
            <div className="smart-tags-row">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`smart-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  <Tag size={11} />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Search Filter Indicator */}
        {searchQuery.trim() && (
          <div className="active-search-indicator">
            <span>
              Showing <strong>{filteredNotes.length}</strong> matching note{filteredNotes.length === 1 ? '' : 's'} for "<em>{searchQuery}</em>"
            </span>
            <button
              className="search-indicator-clear"
              onClick={() => setSearchQuery('')}
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <div className="notes-group-section">
            <div className="group-label">
              <Pin size={13} className="fill-current text-amber-400" />
              <span>PINNED VAULT ITEMS</span>
            </div>
            <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : 'bento-grid'}`}>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={handleOpenNote}
                  onPin={togglePin}
                  onDelete={deleteNote}
                  onRestore={restoreNote}
                  onExport={handleExportNote}
                  onTagClick={(t) => setSelectedTag(t)}
                  isTrashView={false}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes Section */}
        {otherNotes.length > 0 && (
          <div className="notes-group-section">
            {pinnedNotes.length > 0 && (
              <div className="group-label">
                <span>NOTES</span>
              </div>
            )}
            <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : 'bento-grid'}`}>
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={handleOpenNote}
                  onPin={togglePin}
                  onDelete={deleteNote}
                  onRestore={restoreNote}
                  onExport={handleExportNote}
                  onTagClick={(t) => setSelectedTag(t)}
                  isTrashView={currentFolder === 'trash'}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Lottie Animated Empty States */}
        {filteredNotes.length === 0 && (
          <div className="empty-state-card revamped-empty-card">
            {searchQuery.trim() ? (
              <LottieAnimation
                type="empty-search"
                size={140}
                text="No Matching Notes"
                subtext={`No results found for "${searchQuery}". Try searching with another keyword or hashtag.`}
              />
            ) : currentFolder === 'trash' ? (
              <LottieAnimation
                type="trash-empty"
                size={140}
                text="Trash is Empty"
                subtext="Your recycle bin is clean. Deleted notes will stay here until emptied."
              />
            ) : (
              <LottieAnimation
                type="empty-notes"
                size={150}
                text="Your Vault is Clear"
                subtext="Offload your thoughts! Create your first note with rich markdown, tags, and sketches."
              />
            )}
          </div>
        )}
      </div>

      {/* Rich Editor Modal */}
      <NoteEditorModal
        note={activeNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setActiveNote(null);
        }}
        onSave={saveNote}
        onDelete={deleteNote}
        onExport={handleExportNote}
      />

      {/* Unlock Password Modal */}
      <NoteLockModal
        isOpen={Boolean(unlockingNote)}
        mode="unlock"
        correctPin={unlockingNote?.pin || ''}
        onClose={() => setUnlockingNote(null)}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
}
