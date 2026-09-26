import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TaskManager from './TaskManager';
import TaskItem from './TaskItem';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TaskWorkflows: Multi-Agent Edge & Unit Tests for Task Operations', () => {
  const sampleTasks = [
    { id: '1', title: 'Ship v2.0 Release', priority: 'high', category: 'Work', completed: false },
    { id: '2', title: 'Review PR & Specs', priority: 'medium', category: 'Work', completed: true },
    { id: '3', title: 'Meditation 15m', priority: 'low', category: 'Personal', completed: false }
  ];

  const defaultProps = {
    tasks: sampleTasks,
    addTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    editTask: vi.fn(),
    onFocusTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list and stats counter correctly', () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText('Ship v2.0 Release')).toBeInTheDocument();
    expect(screen.getByText('Review PR & Specs')).toBeInTheDocument();
    expect(screen.getByText('Meditation 15m')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 Completed (33%)')).toBeInTheDocument();
  });

  it('allows adding a valid task with priority and category', () => {
    render(<TaskManager {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    const submitBtn = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(input, { target: { value: 'Write unit tests' } });
    fireEvent.click(submitBtn);

    expect(defaultProps.addTask).toHaveBeenCalledWith({
      title: 'Write unit tests',
      priority: 'medium',
      category: 'Work',
      completed: false
    });
  });

  it('provides visual error feedback on empty task submission (User Complaint Fix)', () => {
    render(<TaskManager {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    const submitBtn = screen.getByRole('button', { name: /Add Task/i });

    // Submit with empty / whitespace string
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitBtn);

    // addTask must NOT be called
    expect(defaultProps.addTask).not.toHaveBeenCalled();

    // Input must display error state
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByPlaceholderText('Please enter a task title first...')).toBeInTheDocument();
  });

  it('filters tasks by Active and Completed status tabs', async () => {
    render(<TaskManager {...defaultProps} />);
    const activeTab = screen.getByRole('button', { name: /Active \(2\)/i });
    const completedTab = screen.getByRole('button', { name: /Completed \(1\)/i });

    // Filter Active
    fireEvent.click(activeTab);
    expect(screen.getByText('Ship v2.0 Release')).toBeInTheDocument();
    expect(screen.getByText('Meditation 15m')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Review PR & Specs')).not.toBeInTheDocument();
    });

    // Filter Completed
    fireEvent.click(completedTab);
    expect(screen.getByText('Review PR & Specs')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Ship v2.0 Release')).not.toBeInTheDocument();
    });
  });

  it('filters tasks dynamically by search query', async () => {
    render(<TaskManager {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search tasks...');

    fireEvent.change(searchInput, { target: { value: 'Meditation' } });
    expect(screen.getByText('Meditation 15m')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Ship v2.0 Release')).not.toBeInTheDocument();
    });
  });

  it('supports inline editing and cancelling via Escape key (User Complaint Fix)', () => {
    const task = sampleTasks[0];
    render(
      <TaskItem
        task={task}
        onToggle={defaultProps.toggleTask}
        onDelete={defaultProps.deleteTask}
        onEdit={defaultProps.editTask}
        onFocus={defaultProps.onFocusTask}
      />
    );

    const taskLabel = screen.getByText('Ship v2.0 Release');
    // Double click to trigger edit
    fireEvent.doubleClick(taskLabel);

    const editInput = screen.getByDisplayValue('Ship v2.0 Release');
    expect(editInput).toBeInTheDocument();

    // Type new title
    fireEvent.change(editInput, { target: { value: 'Modified Title But Cancelled' } });

    // Hit Escape to cancel
    fireEvent.keyDown(editInput, { key: 'Escape' });

    // Must not call onEdit, must revert back to display text
    expect(defaultProps.editTask).not.toHaveBeenCalled();
    expect(screen.getByText('Ship v2.0 Release')).toBeInTheDocument();
  });
});
