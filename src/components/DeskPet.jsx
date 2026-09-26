import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeskPet = ({ xp, level, isFocusing }) => {
  const [particles, setParticles] = useState([]);
  const [prevLevel, setPrevLevel] = useState(level);

  // Trigger particles on level up
  useEffect(() => {
    if (level > prevLevel) {
      const newParticles = Array.from({ length: 15 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        scale: Math.random() * 1.5 + 0.5,
      }));
      setParticles(newParticles);
      setPrevLevel(level);

      // Clean up particles
      setTimeout(() => setParticles([]), 2000);
    }
  }, [level, prevLevel]);

  const progress = (xp % 100);

  return (
    <div className="pet-container border-b border-border relative">
      <div className="flex justify-between w-full max-w-md px-4 items-center">
        <div className="font-display font-bold text-xl">Lvl {level}</div>
        <div className="font-bold text-gray-500">{xp} XP</div>
      </div>
      
      {/* XP Bar */}
      <div className="w-full max-w-md h-4 bg-[var(--bg-secondary)] border border-border rounded-full mt-2 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <motion.div 
          className="h-full bg-black"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0.2 }}
        />
      </div>

      <div className="relative mt-8 mb-4">
        {/* The Pet Blob */}
        <motion.div 
          className="w-32 h-32 bg-black flex items-center justify-center relative z-10 rounded-3xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.18)]"
          animate={{
            borderRadius: isFocusing 
              ? ["50% 50% 50% 50%", "45% 55% 45% 55%", "50% 50% 50% 50%"]
              : ["40% 60% 70% 30%", "70% 30% 50% 50%", "40% 60% 70% 30%"],
            scale: isFocusing ? [1, 1.05, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: isFocusing ? 2 : 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {/* Pet Face */}
          <div className="flex gap-4 mb-4">
            <motion.div 
              className="w-4 h-4 bg-[var(--bg-primary)] rounded-full"
              animate={isFocusing ? { scaleY: [1, 0.2, 1], transition: { repeat: Infinity, duration: 3, times: [0, 0.1, 0.2] } } : {}}
            />
            <motion.div 
              className="w-4 h-4 bg-[var(--bg-primary)] rounded-full"
              animate={isFocusing ? { scaleY: [1, 0.2, 1], transition: { repeat: Infinity, duration: 3, times: [0, 0.1, 0.2] } } : {}}
            />
          </div>
        </motion.div>

        {/* Level Up Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full pointer-events-none"
              style={{ marginTop: '-6px', marginLeft: '-6px' }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="font-bold text-center mt-2">
        {isFocusing ? "Deep work..." : "Ready for action"}
      </div>
    </div>
  );
};

export default DeskPet;
