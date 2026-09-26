import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import { BrutalButton } from './ui/brutal-button';

const FocusTimer = ({ onCompleteFocus, onCancelFocus, isFocusing, setIsFocusing }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default

  useEffect(() => {
    let interval;
    if (isFocusing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isFocusing && timeLeft === 0) {
      setIsFocusing(false);
      onCompleteFocus(50); // Give 50 XP for completing a pomodoro
    }
    return () => clearInterval(interval);
  }, [isFocusing, timeLeft, onCompleteFocus, setIsFocusing]);

  const toggleTimer = () => {
    if (isFocusing) {
      setIsFocusing(false);
      onCancelFocus();
    } else {
      setIsFocusing(true);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="focus-timer glass-panel">
      <h3 className="section-title">Focus Mode</h3>
      
      <div className="timer-container">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle 
            className="timer-track" 
            cx="50" cy="50" r="45" 
          />
          <motion.circle 
            className="timer-progress" 
            cx="50" cy="50" r="45"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        
        <div className="timer-text">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      <BrutalButton 
        color={isFocusing ? 'var(--bg-primary)' : 'var(--text-primary)'}
        textColor={isFocusing ? 'var(--text-primary)' : 'var(--bg-primary)'}
        onClick={toggleTimer}
      >
        {isFocusing ? <Square size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
        {isFocusing ? 'Stop Focus' : 'Start Focus'}
      </BrutalButton>
    </div>
  );
};

export default FocusTimer;
