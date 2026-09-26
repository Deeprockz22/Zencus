import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Activity, User, Target, BarChart2 } from 'lucide-react';

export default function NexusVisualizer({
  timeLeft,
  totalDuration,
  isRunning,
  mode,
  getModeTitle,
  formatTime,
  isEditing,
  editMinutes,
  setEditMinutes,
  handleEditSubmit,
  setIsEditing,
  startTimer,
  pauseTimer
}) {
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  
  // Style Tokens: unified with design system
  const colors = {
    bg: 'var(--bg-primary)',
    surface: 'var(--accent-primary)',
    tertiary: 'var(--bg-tertiary)',
    neutral: 'var(--bg-secondary)',
    text: 'var(--text-primary)'
  };

  const handleDisplayClick = () => {
    if (isEditing) return;
    if (isRunning && pauseTimer) {
      pauseTimer();
    } else if (!isRunning && startTimer) {
      startTimer();
    }
  };

  return (
    <div 
      className="nexus-visualizer-hero absolute inset-0 w-full h-full flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="max-w-4xl w-full p-4 md:p-8 flex flex-col gap-[7px] md:gap-[18px]">
        
        {/* HEADER / META BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h3 
              className="uppercase font-bold tracking-[0.96px] text-[12px] mb-1 opacity-70" 
              style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}
            >
              Focus Session
            </h3>
            <h1 
              className="text-4xl md:text-[52px] leading-tight" 
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Quiet Output
            </h1>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="px-4 py-2 rounded-full border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: colors.neutral }}>
              <span className="text-[12px] uppercase font-bold tracking-[0.96px]" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
                Status: {isRunning ? 'Active' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px] md:gap-[18px]">
          
          {/* PRIMARY TIMER PANEL */}
          <div 
            className="md:col-span-2 rounded-[14px] p-[22px] border relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            style={{ 
              backgroundColor: colors.surface, 
              borderColor: 'transparent',
              boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.16)'
            }}
            onClick={handleDisplayClick}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="uppercase font-bold tracking-[0.96px] text-[12px]" style={{ color: '#FFFFFF', fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
                {getModeTitle ? getModeTitle() : 'Focus Block'}
              </span>
              <div className="p-2 rounded-full border border-dashed border-white/40 text-white">
                {isRunning ? <Activity size={18} className="animate-pulse" /> : <Pause size={18} />}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center my-8">
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    className="text-7xl md:text-8xl lg:text-[120px] font-normal bg-transparent text-center outline-none w-48 border-b-2"
                    style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.6)' }}
                  />
                </form>
              ) : (
                <div
                  className="text-7xl md:text-8xl lg:text-[120px] font-normal tracking-tight leading-none text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isRunning && setIsEditing) {
                      setEditMinutes(Math.floor(timeLeft / 60));
                      setIsEditing(true);
                    }
                  }}
                >
                  {formatTime ? formatTime(timeLeft) : '25:00'}
                </div>
              )}
            </div>

            {/* PROGRESS METER */}
            <div className="w-full h-2 rounded-full overflow-hidden border mt-12 relative" style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.35)' }}>
              <motion.div
                className="h-full absolute left-0 top-0 bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.5 }}
              />
            </div>
            
            {/* INSTRUCTIONS */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-4 py-2 bg-black/80 text-white rounded-full text-[12px] font-bold tracking-widest uppercase shadow-lg backdrop-blur-sm">
                Click to {isRunning ? 'Pause' : 'Start'}
              </span>
            </div>
          </div>

          {/* SECONDARY STATS COLUMN */}
          <div className="flex flex-col gap-[13px] md:gap-[18px]">
            
            {/* STAT CARD 1 */}
            <div 
              className="rounded-[12px] p-[18px] border flex flex-col justify-between"
              style={{ backgroundColor: colors.neutral, borderColor: 'var(--border-subtle)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="uppercase font-bold tracking-[0.96px] text-[12px]" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
                  Target Output
                </span>
                <Target size={16} />
              </div>
              <div className="text-3xl" style={{ fontFamily: 'Georgia, serif' }}>
                {Math.ceil(totalDuration / 60)} <span className="text-lg opacity-50 font-sans">min</span>
              </div>
            </div>

            {/* STAT CARD 2 */}
            <div 
              className="rounded-[12px] p-[18px] border flex flex-col justify-between flex-1"
              style={{ backgroundColor: colors.tertiary, borderColor: 'var(--border-subtle)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="uppercase font-bold tracking-[0.96px] text-[12px]" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
                  Session Progress
                </span>
                <BarChart2 size={16} />
              </div>
              <div className="text-[52px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                {Math.floor(progress)}<span className="text-xl font-sans">%</span>
              </div>
              <p className="mt-4 text-[13px] opacity-80" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
                Steady, uninterrupted progress toward your goals.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
