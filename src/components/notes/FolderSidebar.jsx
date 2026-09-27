import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Archive,
  Trash2,
  FileText,
  Briefcase,
  User,
  Lightbulb,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

const DEFAULT_FOLDERS = [
  { id: 'all', name: 'All Notes', icon: FileText, color: '#94a3b8' },
  { id: 'quick', name: 'Quick Notes', icon: Sparkles, color: '#f59e0b' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#3b82f6' },
  { id: 'personal', name: 'Personal', icon: User, color: '#10b981' },
  { id: 'ideas', name: 'Ideas & Drafts', icon: Lightbulb, color: '#8b5cf6' },
  { id: 'archive', name: 'Archive', icon: Archive, color: '#64748b' },
  { id: 'trash', name: 'Recently Deleted', icon: Trash2, color: '#ef4444', isTrash: true }
];

export default function FolderSidebar({
  currentFolder,
  setCurrentFolder,
  customFolders = [],
  onAddFolder,
  onDeleteFolder,
  notesCountByFolder = {}
}) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [folderError, setFolderError] = useState('');

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const error = onAddFolder(newFolderName.trim());
      if (error) {
        setFolderError(error);
        return;
      }
      setNewFolderName('');
      setFolderError('');
      setIsCreating(false);
    }
  };

  return (
    <aside className="folder-sidebar unboxed-sidebar py-1" aria-label="Notes Vault Folders">
      <div className="folder-sidebar-header pb-2 mb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="sidebar-title-row flex items-center gap-2">
          <span className="sidebar-title text-xs font-semibold text-[var(--text-primary)]">
            Folders
          </span>
          <span className="sidebar-badge text-[11px] text-[var(--text-tertiary)] opacity-60">
            {notesCountByFolder.all || 0}
          </span>
        </div>
        <button
          className={`folder-add-btn p-1 text-[var(--text-secondary)] hover:text-[#ff3b30] transition-colors rounded-full ${isCreating ? 'active text-[#ff3b30]' : ''}`}
          onClick={() => {
            setIsCreating(!isCreating);
            setFolderError('');
          }}
          title={isCreating ? 'Cancel' : 'Create Custom Folder'}
        >
          {isCreating ? <X size={14} /> : <FolderPlus size={14} />}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="new-folder-form my-2 flex items-center gap-2 border-b border-[#ff3b30] pb-1">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              setFolderError('');
            }}
            placeholder="Folder name..."
            aria-label="New folder name"
            aria-invalid={Boolean(folderError)}
            className="new-folder-input flex-1 bg-transparent border-none text-xs text-[var(--text-primary)] outline-none"
            autoFocus
          />
          <button type="submit" className="new-folder-submit text-[11px] font-semibold text-[#ff3b30]">
            Add
          </button>
        </form>
      )}
      {isCreating && folderError && (
        <p className="new-folder-error text-[11px] text-[#ff3b30] mb-2" role="alert">
          {folderError}
        </p>
      )}

      <div className="folder-list flex flex-col gap-1">
        {DEFAULT_FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const count = notesCountByFolder[folder.id] || 0;
          const isActive = currentFolder === folder.id;

          return (
            <button
              key={folder.id}
              className={`folder-item flex items-center justify-between py-1.5 px-2 rounded transition-all text-xs ${
                isActive
                  ? 'active text-[var(--text-primary)] font-semibold bg-white/5'
                  : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100 hover:bg-white/[0.02]'
              } ${folder.isTrash ? 'trash-item mt-3 pt-2 border-t border-[var(--border-subtle)]' : ''}`}
              onClick={() => setCurrentFolder(folder.id)}
            >
              <div className="folder-item-left flex items-center gap-2">
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                )}
                <Icon size={14} className="folder-icon opacity-70" />
                <span className="folder-name tracking-tight">{folder.name}</span>
              </div>
              <span className="folder-count text-[10px] opacity-50">
                {count}
              </span>
            </button>
          );
        })}

        {customFolders.length > 0 && (
          <div className="folder-divider my-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] opacity-40">
            <span>Custom</span>
          </div>
        )}

        {customFolders.map((custom, index) => {
          const folderId = typeof custom === 'object' ? custom.id : String(custom);
          const folderName = typeof custom === 'object' ? custom.name : String(custom);
          const count = notesCountByFolder[folderId] || 0;
          const isActive = currentFolder === folderId;

          return (
            <div key={folderId || index} className="custom-folder-row">
              <button
                className={`folder-item custom-folder-item flex items-center justify-between py-1.5 px-2 rounded transition-all text-xs ${
                  isActive
                    ? 'active text-[var(--text-primary)] font-semibold bg-white/5'
                    : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100 hover:bg-white/[0.02]'
                }`}
                onClick={() => setCurrentFolder(folderId)}
              >
                <div className="folder-item-left flex items-center gap-2">
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                  )}
                  <Folder size={14} className="folder-icon opacity-70" />
                  <span className="folder-name tracking-tight">{folderName}</span>
                </div>
                <span className="folder-count text-[10px] opacity-50">{count}</span>
              </button>
              {onDeleteFolder && typeof custom === 'object' && (
                <button
                  type="button"
                  className="folder-delete-icon p-1 rounded-full text-[var(--text-tertiary)] hover:text-[#ff3b30] transition-colors"
                  title="Delete Folder"
                  aria-label={`Delete folder ${folderName}`}
                  onClick={() => onDeleteFolder(folderId, folderName)} // the hub asks to confirm
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
