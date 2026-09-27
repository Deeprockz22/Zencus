import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createLock, sealText, unlockNote } from '../../utils/noteCrypto';
import React from 'react';
import NotesHub from './NotesHub';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('NotesWorkflows: Multi-Agent Edge & Unit Tests for Notes Vault', () => {
  const sampleNotes = [
    {
      id: 'n1',
      title: 'Quantum Computing Notes',
      content: 'Exploring qubit coherence and #quantum entanglement algorithms.',
      folder: 'quick',
      color: 'cyan',
      pinned: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'n2',
      title: 'Architecture Blueprint',
      content: 'System architecture using #design tokens and WebGL shaders.',
      folder: 'work',
      color: 'violet',
      pinned: false,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'n3',
      title: 'Archived Brainstorming',
      content: 'Old discarded notes #legacy',
      folder: 'trash',
      trash: true,
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultProps = {
    notes: sampleNotes,
    saveNote: vi.fn(),
    deleteNote: vi.fn(),
    restoreNote: vi.fn(),
    togglePin: vi.fn(),
    customFolders: [],
    addCustomFolder: vi.fn(),
    deleteCustomFolder: vi.fn(),
    theme: 'dark',
    companionType: 'none',
    onOpenPicker: vi.fn(),
    onSelectCompanion: vi.fn(),
    onConvertToTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all active non-trash notes in the vault', () => {
    render(<NotesHub {...defaultProps} />);
    expect(screen.getByText('Quantum Computing Notes')).toBeInTheDocument();
    expect(screen.getByText('Architecture Blueprint')).toBeInTheDocument();
    // Trash notes should not render in default 'all' view
    expect(screen.queryByText('Archived Brainstorming')).not.toBeInTheDocument();
  });

  it('aggregates and displays smart #hashtags', () => {
    render(<NotesHub {...defaultProps} />);
    expect(screen.getAllByText('#quantum').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('#design').length).toBeGreaterThanOrEqual(1);
  });

  it('filters notes dynamically by search query across title and content', () => {
    render(<NotesHub {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Search notes, body text, or #tag.../i);

    fireEvent.change(searchInput, { target: { value: 'entanglement' } });
    expect(screen.getByText('Quantum Computing Notes')).toBeInTheDocument();
    expect(screen.queryByText('Architecture Blueprint')).not.toBeInTheDocument();
  });

  it('opens note editor when clicking New Note button', () => {
    render(<NotesHub {...defaultProps} />);
    const newNoteBtn = screen.getByRole('button', { name: /New Note/i });
    fireEvent.click(newNoteBtn);

    // Editor modal should appear
    expect(screen.getByPlaceholderText(/Note Title.../i)).toBeInTheDocument();
  });

  it('filters notes when switching to Recently Deleted (Trash) folder', () => {
    render(<NotesHub {...defaultProps} />);
    const trashFolderBtn = screen.getByText('Recently Deleted');
    fireEvent.click(trashFolderBtn);

    expect(screen.getByText('Archived Brainstorming')).toBeInTheDocument();
    expect(screen.queryByText('Quantum Computing Notes')).not.toBeInTheDocument();
  });

  describe('regressions from the Notes page test run (NOTES_TEST_CASES.md)', () => {
    const locked = { id: 'l1', title: 'Locked plan', content: '<p>TOP SECRET</p>', folder: 'quick', pin: '1234', updatedAt: new Date().toISOString() };

    it('F3: the Folders total counts each note once', () => {
      const { container } = render(<NotesHub {...defaultProps} />);
      expect(container.querySelector('.sidebar-badge').textContent).toBe('2');
    });

    it('E6: colour codes and entities in markup are not tags', () => {
      const notes = [{ id: 'c1', title: 'Styled', content: '<p><span style="color: #ff3b30">red</span> it&#39;s #real</p>', folder: 'quick', updatedAt: new Date().toISOString() }];
      render(<NotesHub {...defaultProps} notes={notes} />);
      expect(screen.queryByText('#ff3b30')).not.toBeInTheDocument();
      expect(screen.queryByText('#39')).not.toBeInTheDocument();
      expect(screen.getAllByText('#real').length).toBeGreaterThanOrEqual(1);
    });

    it('D3: exporting a locked note asks for its PIN instead of downloading', () => {
      const createUrl = vi.fn(() => 'blob:x');
      global.URL.createObjectURL = createUrl;
      render(<NotesHub {...defaultProps} notes={[locked]} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }));
      expect(createUrl).not.toHaveBeenCalled();
      expect(document.querySelector('.pin-modal-card')).toBeInTheDocument();
    });

    it('D6: Delete Forever asks in-app first; Cancel keeps the note, confirming deletes it', () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Recently Deleted'));
      fireEvent.click(screen.getByRole('button', { name: 'Delete Forever' }));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(defaultProps.deleteNote).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Forever' }));
      fireEvent.click(document.querySelector('.confirm-dialog-confirm'));
      expect(defaultProps.deleteNote).toHaveBeenCalledWith('n3', true);
      expect(confirmSpy).not.toHaveBeenCalled(); // no browser popup
      confirmSpy.mockRestore();
    });

    it('Empty Trash asks, then empties', () => {
      const emptyTrash = vi.fn();
      render(<NotesHub {...defaultProps} emptyTrash={emptyTrash} />);
      fireEvent.click(screen.getByText('Recently Deleted'));
      fireEvent.click(screen.getByRole('button', { name: /Empty Trash/i }));
      expect(emptyTrash).not.toHaveBeenCalled();
      fireEvent.click(document.querySelector('.confirm-dialog-confirm'));
      expect(emptyTrash).toHaveBeenCalled();
    });

    it('deleting a custom folder asks in-app first', () => {
      render(<NotesHub {...defaultProps} customFolders={[{ id: 'thesis', name: 'Thesis' }]} />);
      fireEvent.click(screen.getByTitle('Delete Folder'));
      expect(defaultProps.deleteCustomFolder).not.toHaveBeenCalled();
      fireEvent.click(document.querySelector('.confirm-dialog-confirm'));
      expect(defaultProps.deleteCustomFolder).toHaveBeenCalledWith('thesis');
    });

    it('deleting a note that is already in the trash, from the editor, means delete forever', () => {
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Recently Deleted'));
      fireEvent.click(screen.getByText('Archived Brainstorming'));
      fireEvent.click(screen.getByTitle('Delete this note'));
      fireEvent.click(document.querySelector('.confirm-dialog-confirm'));
      expect(defaultProps.deleteNote).toHaveBeenCalledWith('n3', true);
    });

    // All four digits in one synchronous burst: faster than any person can type
    const typePin = (digits) => {
      act(() => {
        for (const d of digits) window.dispatchEvent(new KeyboardEvent('keydown', { key: d, bubbles: true, cancelable: true }));
      });
    };

    it('setting a PIN asks for it twice; a mismatch starts over', () => {
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Architecture Blueprint'));
      fireEvent.click(screen.getByTitle('Lock note with 4-digit PIN'));
      typePin('1234');
      expect(screen.getByText('Confirm your PIN')).toBeInTheDocument();
      typePin('9999');
      expect(screen.getByText(/didn't match/i)).toBeInTheDocument();
      expect(screen.getByTitle('Lock note with 4-digit PIN')).toBeInTheDocument(); // still unlocked
    });

    it('a locked note is saved as ciphertext only', async () => {
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Architecture Blueprint'));
      fireEvent.click(screen.getByTitle('Lock note with 4-digit PIN'));
      typePin('1234');
      typePin('1234');
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(defaultProps.saveNote).toHaveBeenCalled(), { timeout: 10000 });
      const saved = defaultProps.saveNote.mock.calls.at(-1)[0];
      expect(saved.content).toBe('');
      expect(saved.pin).toBeNull();
      expect(JSON.stringify(saved)).not.toContain('WebGL');
      expect((await unlockNote(saved, '1234')).text).toContain('WebGL shaders');
    }, 30000);

    it('an encrypted note opens with the right PIN and refuses a wrong one', async () => {
      const cipher = await sealText(await createLock('2468'), '<p>decrypted body</p>');
      const note = { id: 'e1', title: 'Encrypted', content: '', cipher, folder: 'quick', updatedAt: new Date().toISOString() };
      render(<NotesHub {...defaultProps} notes={[note]} />);
      fireEvent.click(screen.getByText('Encrypted'));
      typePin('1111');
      await waitFor(() => expect(screen.getByText(/Incorrect PIN/)).toBeInTheDocument(), { timeout: 10000 });
      typePin('2468');
      await waitFor(() => expect(document.querySelector('.rich-note-editor[contenteditable]').innerHTML).toContain('decrypted body'), { timeout: 10000 });
    }, 30000);

    it('C2: the editor folder menu lists custom folders', () => {
      render(<NotesHub {...defaultProps} customFolders={[{ id: 'thesis', name: 'Thesis' }]} />);
      fireEvent.click(screen.getByRole('button', { name: /New Note/i }));
      expect(screen.getByRole('option', { name: 'Thesis' })).toBeInTheDocument();
    });

    it('A9: opening and closing a note without changes does not re-save it', () => {
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Architecture Blueprint'));
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(defaultProps.saveNote).not.toHaveBeenCalled();
    });

    it('renaming or re-filing an existing note is saved', () => {
      render(<NotesHub {...defaultProps} />);
      fireEvent.click(screen.getByText('Architecture Blueprint'));
      fireEvent.change(screen.getByLabelText('Note title'), { target: { value: 'Renamed' } });
      fireEvent.change(document.querySelector('.note-folder-select'), { target: { value: 'ideas' } });
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(defaultProps.saveNote).toHaveBeenCalledWith(expect.objectContaining({ id: 'n2', title: 'Renamed', folder: 'ideas' }));
    });

    it('B11: ticking a checklist box is saved with the note', () => {
      const notes = [{ id: 'k1', title: 'Todo', content: '<div class="checklist-row"><input type="checkbox"> <span>milk</span></div>', folder: 'quick', updatedAt: new Date().toISOString() }];
      render(<NotesHub {...defaultProps} notes={notes} />);
      fireEvent.click(screen.getByText('Todo'));
      fireEvent.click(document.querySelector('.rich-note-editor[contenteditable] input[type=checkbox]'));
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(defaultProps.saveNote).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('checked') }));
    });

    it('locked notes reveal neither their tags nor their text through tags or search', () => {
      const secret = { ...locked, content: '<p>salary #private</p>' };
      render(<NotesHub {...defaultProps} notes={[secret]} />);
      expect(screen.queryByText('#private')).not.toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText(/Search notes/i), { target: { value: 'salary' } });
      expect(screen.queryByText('Locked plan')).not.toBeInTheDocument();
    });

    it('C7: PIN digits typed on the keyboard are not also typed into the page', () => {
      render(<NotesHub {...defaultProps} notes={[locked]} />);
      fireEvent.click(screen.getByText('Locked plan'));
      const event = new KeyboardEvent('keydown', { key: '1', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });
});
