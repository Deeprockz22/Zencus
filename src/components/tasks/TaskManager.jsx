import React, { useState } from 'react';
import { Plus, CheckSquare, Sparkles, Search, CheckCircle2, Circle, ListFilter } from 'lucide-react';
import TaskItem from './TaskItem';
import AnimatedList from '../react-bits/AnimatedList';
import MagnetButton from '../react-bits/MagnetButton';
import DecryptedText from '../react-bits/DecryptedText';
import LottieAnimation from '../ui/LottieAnimation';

const CATEGORIES = ['All', 'Work', 'Study', 'Personal', 'Ideas'];

export default function TaskManager({
  tasks = [],
  addTask,
  toggleTask,
  deleteTask,
  editTask
}) {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      priority,
      category: category === 'All' ? 'General' : category,
      completed: false
    });

    setNewTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="tasks-view">
      {/* Header & Stats Banner */}
      <div className="view-header">
        <div>
          <h2 className="view-title">
            <DecryptedText text="Task Focus" speed={30} maxIterations={8} />
          </h2>
          <p className="view-subtitle">Organize your goals with frictionless priority</p>
        </div>

        <div className="task-counter-badge">
          <CheckSquare size={16} />
          <span>{completedCount} of {tasks.length} Completed ({completionPercentage}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="task-progress-container mb-4">
          <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Creation Input Form */}
      <form onSubmit={handleAddTask} className="task-input-bar">
        <div className="input-group-main">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task... (e.g. Complete quarterly roadmap)"
            className="task-main-input"
          />

          <div className="task-meta-selectors">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="task-select priority-select"
              aria-label="Priority"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="task-select category-select"
              aria-label="Category"
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Ideas">Ideas</option>
            </select>
          </div>
        </div>

        <MagnetButton type="submit" className="btn-action primary add-task-btn">
          <Plus size={18} />
          <span>Add Task</span>
        </MagnetButton>
      </form>

      {/* Search & Category Filter Controls */}
      <div className="task-controls-bar flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        {/* Status Tabs */}
        <div className="status-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({tasks.length - completedCount})
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Quick Search */}
        <div className="task-search-wrapper relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-tabs mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state-card flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
          <LottieAnimation
            type={searchQuery ? 'empty-search' : 'empty-tasks'}
            size={120}
            text={searchQuery ? 'No matching tasks' : filter === 'completed' ? 'No completed tasks' : 'Ready to focus?'}
            subtext={
              searchQuery
                ? `No tasks match "${searchQuery}". Try a different search term.`
                : filter === 'completed'
                ? 'Finish a task above to see your accomplishments here.'
                : 'Add a new task above and check it off as you go.'
            }
          />
        </div>
      ) : (
        <AnimatedList className="task-list-grid">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))}
        </AnimatedList>
      )}
    </div>
  );
}
