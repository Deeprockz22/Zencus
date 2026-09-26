import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckSquare, FileText } from 'lucide-react';

const TABS = [
  { id: 'timer', label: 'Timer', index: '01', icon: Clock },
  { id: 'tasks', label: 'Tasks', index: '02', icon: CheckSquare },
  { id: 'notes', label: 'Notes', index: '03', icon: FileText }
];

export default function DockNav({ activeTab, setActiveTab, taskCount = 0, noteCount = 0 }) {
  return (
    <nav className="dock-nav-container" aria-label="Main Navigation">
      <div className="dock-nav" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          let badge = null;
          if (tab.id === 'tasks' && taskCount > 0) badge = taskCount;
          if (tab.id === 'notes' && noteCount > 0) badge = noteCount;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`dock-tab ${isActive ? 'active' : ''}`}
              role="tab"
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockIndicator"
                  className="dock-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <span className="dock-icon">
                <Icon size={16} />
              </span>

              <span className="dock-label text-xs font-medium tracking-tight">
                {tab.label}
              </span>

              {isActive && (
                <span className="dock-active-dot w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] ml-1 shrink-0" />
              )}

              {badge !== null && (
                <span className="dock-badge text-[10px] font-semibold ml-1 opacity-70">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
