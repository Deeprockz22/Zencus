import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';
import { motion } from 'framer-motion';

const LockScreen = ({ onUnlock, correctPin = "1234", surreal = false }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handlePress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  // Keyboard support for desktop users (0-9 and Backspace/Escape to clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, correctPin]);

  return (
    <div className="lock-screen flex flex-col items-center justify-center min-h-screen w-full p-8 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 select-none">
      {/* Nothing Glyph Lock Status Icon (Unboxed) */}
      <div className="mb-6 flex items-center justify-center">
        {error ? (
          <div className="w-12 h-12 rounded-full border border-[#ff3b30] flex items-center justify-center text-[#ff3b30] shadow-[0_0_12px_#ff3b30] animate-bounce">
            <Lock size={22} />
          </div>
        ) : surreal ? (
          <svg className="lock-keyhole" viewBox="0 0 64 96" aria-hidden="true">
            <defs>
              <linearGradient id="lockKeyholeSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b1330" />
                <stop offset="100%" stopColor="#3a4c8f" />
              </linearGradient>
            </defs>
            <path d="M32 2a24 24 0 0 0-11 45.3L12 94h40l-9-46.7A24 24 0 0 0 32 2Z" fill="url(#lockKeyholeSky)" />
            <circle cx="24" cy="20" r="1.4" fill="#fff" />
            <circle cx="40" cy="30" r="1" fill="#fff" />
            <circle cx="30" cy="70" r="1.2" fill="#fff" />
            <path d="M38 12a8 8 0 1 0 6 13 6.5 6.5 0 1 1-6-13Z" fill="#fff4c9" />
          </svg>
        ) : (
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[var(--text-primary)]">
            <Unlock size={22} className="opacity-80" />
          </div>
        )}
      </div>
      
      <div className="text-center mb-6">
        <h2 className="lock-title text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Enter PIN
        </h2>
        {/* Was "SECURITY ACCESS // NDOT ENCRYPTED" — this is a 4-digit local
            PIN gate, not encryption, so the old copy overstated the actual
            protection (Steve round 4, R4-D3). */}
        <p className="lock-sub text-xs text-[var(--text-secondary)] opacity-60 mt-1">
          Unlock to access your timer and notes
        </p>
      </div>

      {/* PIN LED Dots Indicator */}
      <div className="lock-dots flex gap-4 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              i < pin.length 
                ? (error 
                    ? 'bg-[#ff3b30] shadow-[0_0_10px_#ff3b30] scale-110' 
                    : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110') 
                : 'border border-white/25 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Nothing Minimal Circular Keypad */}
      <motion.div 
        animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-4 max-w-[240px] w-full justify-items-center"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            type="button"
            onClick={() => handlePress(num.toString())}
            className="lock-key w-16 h-16 rounded-full border border-white/10 hover:border-white/40 hover:bg-white/5 active:bg-white/15 active:scale-95 transition-all text-xl font-mono text-[var(--text-primary)] flex items-center justify-center cursor-pointer outline-none"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          type="button"
          onClick={() => handlePress("0")}
          className="lock-key w-16 h-16 rounded-full border border-white/10 hover:border-white/40 hover:bg-white/5 active:bg-white/15 active:scale-95 transition-all text-xl font-mono text-[var(--text-primary)] flex items-center justify-center cursor-pointer outline-none"
        >
          0
        </button>
        <button 
          type="button"
          onClick={handleClear}
          className="lock-key w-16 h-16 rounded-full border border-white/10 hover:border-[#ff3b30] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 active:scale-95 transition-all text-[var(--text-secondary)] flex items-center justify-center cursor-pointer outline-none"
          title="Clear PIN"
          aria-label="Clear PIN"
        >
          <Delete size={18} />
        </button>
      </motion.div>
    </div>
  );
};

export default LockScreen;
