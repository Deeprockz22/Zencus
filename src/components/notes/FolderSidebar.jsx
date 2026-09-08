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

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <aside className="folder-sidebar" aria-label="Notes Vault Folders">
      <div className="folder-sidebar-header">
        <div className="sidebar-title-row">
          <span className="sidebar-title">Vault Folders</span>
          <span className="sidebar-badge">{Object.values(notesCountByFolder).reduce((a, b) => a + b, 0)}</span>
        </div>
        <button
          className={`folder-add-btn ${isCreating ? 'active' : ''}`}
          onClick={() => setIsCreating(!isCreating)}
          title={isCreating ? 'Cancel' : 'Create Custom Folder'}
        >
          {isCreating ? <X size={15} /> : <FolderPlus size={15} />}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="new-folder-form">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="new-folder-input"
            autoFocus
          />
          <button type="submit" className="new-folder-submit">
            Add
          </button>
        </form>
      )}

      <div className="folder-list">
        {DEFAULT_FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const count = notesCountByFolder[folder.id] || 0;
          const isActive = currentFolder === folder.id;

          return (
            <button
              key={folder.id}
              className={`folder-item ${isActive ? 'active' : ''} ${folder.isTrash ? 'trash-item' : ''}`}
              onClick={() => setCurrentFolder(folder.id)}
            >
              <div className="folder-item-left">
                <span className="folder-dot" style={{ backgroundColor: folder.color }} />
                <Icon size={15} className="folder-icon" />
                <span className="folder-name">{folder.name}</span>
              </div>
              <span className="folder-count">{count}</span>
            </button>
          );
        })}

        {customFolders.length > 0 && (
          <div className="folder-divider">
            <span>Custom</span>
          </div>
        )}

        {customFolders.map((custom) => {
          const count = notesCountByFolder[custom.id] || 0;
          const isActive = currentFolder === custom.id;

          return (
            <button
              key={custom.id}
              className={`folder-item custom-folder-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentFolder(custom.id)}
            >
              <div className="folder-item-left">
                <span className="folder-dot custom" />
                <Folder size={15} className="folder-icon" />
                <span className="folder-name">{custom.name}</span>
              </div>
              <div className="folder-item-right">
                <span className="folder-count">{count}</span>
                {onDeleteFolder && (
                  <span
                    className="folder-delete-icon"
                    title="Delete Folder"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${custom.name}"? Notes inside will stay in Quick Notes.`)) {
                        onDeleteFolder(custom.id);
                      }
                    }}
                  >
                    <X size={12} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
