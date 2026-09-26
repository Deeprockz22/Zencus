import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
