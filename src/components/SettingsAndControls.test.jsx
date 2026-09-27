import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SettingsModal from './SettingsModal';
import CompanionPickerModal from './companion/CompanionPickerModal';

// Mock canvas-confetti to prevent jsdom context.closePath error
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('SettingsAndControls: Modal Keyboard & Controller Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SettingsModal Keyboard Navigation & Interactivity', () => {
    const defaultSettingsProps = {
      isOpen: true,
      onClose: vi.fn(),
      timerSettings: { workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLong: 4 },
      saveTimerSettings: vi.fn(),
      onClearAllData: vi.fn(),
      onExportAllData: vi.fn(),
      onImportAllData: vi.fn(),
      theme: 'dark',
      setTheme: vi.fn()
    };

    it('closes on Escape key press (User Complaint Fix)', () => {
      render(<SettingsModal {...defaultSettingsProps} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(defaultSettingsProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('renders all 5 Skiper UI animated links in Design Resources section', () => {
      render(<SettingsModal {...defaultSettingsProps} />);
      expect(screen.getByText('Design Resources & Toolkits')).toBeInTheDocument();
      expect(screen.getByText('Skiper UI (@skiper40)')).toBeInTheDocument();
      expect(screen.getByText('ThreeUI (DesignCode)')).toBeInTheDocument();
      expect(screen.getByText('Godly.website')).toBeInTheDocument();
      expect(screen.getByText('Design Spells')).toBeInTheDocument();
      expect(screen.getByText('ShaderGradient Engine')).toBeInTheDocument();
    });
  });

  describe('CompanionPickerModal Keyboard Navigation & Selection', () => {
    const defaultCompanionProps = {
      isOpen: true,
      onClose: vi.fn(),
      activeCompanion: 'dino',
      onSelectCompanion: vi.fn()
    };

    it('closes on Escape key press (User Complaint Fix)', () => {
      render(<CompanionPickerModal {...defaultCompanionProps} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(defaultCompanionProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('selects companion and closes modal when card is clicked', () => {
      render(<CompanionPickerModal {...defaultCompanionProps} />);
      // Click on Cat companion (Luna)
      const catCard = screen.getByText('Luna').closest('.companion-select-card');
      fireEvent.click(catCard);

      expect(defaultCompanionProps.onSelectCompanion).toHaveBeenCalledWith('cat');
      expect(defaultCompanionProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('exposes a dialog and supports keyboard companion selection', () => {
      render(<CompanionPickerModal {...defaultCompanionProps} />);

      expect(screen.getByRole('dialog', { name: /Focus Pet Wardrobe/i })).toHaveAttribute('aria-modal', 'true');
      const catCard = screen.getByRole('button', { name: /Select Luna/i });
      fireEvent.keyDown(catCard, { key: 'Enter' });

      expect(defaultCompanionProps.onSelectCompanion).toHaveBeenCalledWith('cat');
      expect(defaultCompanionProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('allows removing pet via Remove Pet button', () => {
      render(<CompanionPickerModal {...defaultCompanionProps} />);
      const removeBtn = screen.getByTitle('Remove Pet & Collapse Space');
      fireEvent.click(removeBtn);

      expect(defaultCompanionProps.onSelectCompanion).toHaveBeenCalledWith('none');
      expect(defaultCompanionProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

});
