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
  editTask,
  onFocusTask
}) {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputError, setInputError] = useState(false);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1500);
      return;
    }

    addTask({
      title: newTitle.trim(),
      priority,
      category: category === 'All' ? 'General' : category,
      completed: false
    });

    setNewTitle('');
    setInputError(false);
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
      {/* Header & Stats Banner (Nothing Tech Style) */}
      <div className="view-header flex items-center justify-between pb-2 mb-2">
        <div>
          <h2 className="view-title font-bold text-lg sm:text-xl tracking-tight text-[var(--text-primary)]">
            Tasks
          </h2>
        </div>

        <div className="task-counter-badge text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
          <CheckSquare size={14} className="text-[#ff3b30]" />
          <span>{completedCount} of {tasks.length} Completed ({completionPercentage}%)</span>
        </div>
      </div>

      {/* Progress Bar (Unboxed 1px hairline trace) */}
      {tasks.length > 0 && (
        <div className="task-progress-container mb-3 w-full">
          <div className="task-progress-track w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="task-progress-fill h-full bg-[#ff3b30] rounded-full transition-all duration-300 shadow-[0_0_8px_#ff3b30]"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Creation Input Form (UNBOXED Command Prompt) */}
      <form onSubmit={handleAddTask} className="task-input-bar w-full flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] my-2">
        <div className="input-group-main flex-1 flex items-center gap-2">
          <span className="task-input-prompt font-mono text-sm font-bold text-[#ff3b30] select-none">&gt;</span>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (inputError) setInputError(false);
            }}
            placeholder={inputError ? "Please enter a task title first..." : "Add a new task... (e.g. Complete quarterly roadmap)"}
            aria-label="New task title"
            className={`task-main-input flex-1 bg-transparent border-none text-sm font-mono text-[var(--text-primary)] outline-none ${inputError ? 'placeholder-red-500' : ''}`}
            aria-invalid={inputError}
          />

          <div className="task-meta-selectors flex items-center gap-2 text-xs">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="task-select priority-select bg-transparent border-0 text-[var(--text-secondary)] outline-none cursor-pointer"
              aria-label="Priority"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="task-select category-select bg-transparent border-0 text-[var(--text-secondary)] outline-none cursor-pointer"
              aria-label="Category"
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Ideas">Ideas</option>
            </select>
          </div>
        </div>

        <MagnetButton type="submit" className="btn-action primary add-task-btn px-4 py-1.5 rounded-full text-xs font-semibold">
          <Plus size={14} />
          <span>Add Task</span>
        </MagnetButton>
      </form>

      {/* Search & Category Filter Controls */}
      <div className="task-controls-bar flex items-center justify-between gap-4 flex-wrap my-3">
        {/* Status Tabs (UNBOXED - Nothing Style) */}
        <div className="status-tabs flex items-center gap-4 text-xs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
            {filter === 'all' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3b30] ml-1.5 shadow-[0_0_6px_#ff3b30]" />}
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}`}
            onClick={() => setFilter('active')}
          >
            Active ({tasks.length - completedCount})
            {filter === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3b30] ml-1.5 shadow-[0_0_6px_#ff3b30]" />}
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
            {filter === 'completed' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3b30] ml-1.5 shadow-[0_0_6px_#ff3b30]" />}
          </button>
        </div>

        {/* Quick Search */}
        <div className="task-search-wrapper relative flex items-center">
          <Search size={14} className="task-search-icon absolute left-2.5 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="task-search-input pl-8 pr-3 py-1.5 text-xs font-mono bg-transparent border-b border-[var(--border-subtle)] focus:border-[#ff3b30] text-[var(--text-primary)] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Pills (Nothing Micro-Brackets) */}
      <div className="category-tabs flex items-center gap-3 text-xs font-mono my-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab py-1 transition-all ${
              categoryFilter === cat
                ? 'active text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'
            }`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state-card">
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
              onFocus={onFocusTask}
            />
          ))}
        </AnimatedList>
      )}
    </div>
  );
}
