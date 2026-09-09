import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull, Bot, Zap, Sparkles, Flame, Moon, Compass } from 'lucide-react';
import { COMPANION_PHRASES } from '../../utils/phrases';

export default function FocusCompanion({
  state = 'idle', // 'idle' | 'working' | 'breakTime'
  sessionsCompleted = 0,
  streak = 0,
  theme = 'dark',
  context = 'general', // 'general' | 'notes' | 'timer'
  companionType = 'dino', // 'dino' | 'cat' | 'owl' | 'dragon' | 'astronaut' | 'bot' | 'ghost' | 'none'
  onOpenPicker,
  onRemovePet
}) {
  if (!companionType || companionType === 'none') {
    return null;
  }

  const [currentPhrase, setCurrentPhrase] = useState('');
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    let list = COMPANION_PHRASES.idle;

    if (context === 'notes') {
      list = COMPANION_PHRASES.notesCognitiveOffload;
    } else {
      // Add pet specific phrases
      if (companionType === 'cat' && COMPANION_PHRASES.cat) {
        list = [...COMPANION_PHRASES.cat, ...list];
      } else if (companionType === 'owl' && COMPANION_PHRASES.owl) {
        list = [...COMPANION_PHRASES.owl, ...list];
      } else if (companionType === 'dragon' && COMPANION_PHRASES.dragon) {
        list = [...COMPANION_PHRASES.dragon, ...list];
      } else if (companionType === 'astronaut' && COMPANION_PHRASES.astronaut) {
        list = [...COMPANION_PHRASES.astronaut, ...list];
      }

      // Theme phrases
      if (theme === 'retro-pixel') {
        list = [...COMPANION_PHRASES.retro, ...list];
      } else if (theme === 'haunted') {
        list = [...COMPANION_PHRASES.haunted, ...list];
      } else if (theme === 'cyberpunk') {
        list = [...COMPANION_PHRASES.cyberpunk, ...list];
      } else if (theme === 'scifi-hud') {
        list = [...COMPANION_PHRASES.scifi, ...list];
      }

      if (state === 'working') list = [...COMPANION_PHRASES.working, ...list];
      if (state === 'breakTime') list = [...COMPANION_PHRASES.breakTime, ...list];
      if (streak >= 3) list = [...COMPANION_PHRASES.streakMilestone, ...list];
    }

    const random = list[Math.floor(Math.random() * list.length)];
    setCurrentPhrase(random);

    const interval = setInterval(() => {
      const nextPhrase = list[Math.floor(Math.random() * list.length)];
      setCurrentPhrase(nextPhrase);
    }, 14000);

    return () => clearInterval(interval);
  }, [state, streak, theme, context, companionType]);

  const handlePet = () => {
    setPetCount((prev) => prev + 1);
    let petPhrases = [
      "Purrr... extra +5 dopamine points! 🦖✨",
      "Yay! You gave your companion some love 💚",
      "Energy recharged! Let's get back to conquering tasks! ⚡",
      "Your companion believes in you 1000%! 🚀"
    ];

    if (companionType === 'cat') {
      petPhrases = [
        "Purrrr-fect! Luna rubs her head against your notes 🐾",
        "Meow! +10 cozy focus energy! 🧶",
        "Soft purr... Luna is keeping you company in the flow zone 🐱"
      ];
    } else if (companionType === 'owl') {
      petPhrases = [
        "Hoo-hoo! Archimedes adjusts his glasses with approval 🦉👓",
        "Wise choice! Working memory refreshed and ready for synthesis 📚",
        "Hoo! Excellent cognitive stamina today, scholar!"
      ];
    } else if (companionType === 'dragon') {
      petPhrases = [
        "Rawrrr! Pyro breathes a happy plume of golden sparks! 🐉✨",
        "Dragon fury activated! No task can withstand your fire 🔥",
        "Pyro happily guards your completed notes like treasure 🪙"
      ];
    } else if (companionType === 'astronaut') {
      petPhrases = [
        "Cosmo salutes from zero-gravity! Orbit trajectory: 100% 🚀",
        "Stardust particles absorbed! Ready for the next deep work orbit 🌌",
        "Houston, we have peak productivity! 🛰️"
      ];
    } else if (companionType === 'ghost' || theme === 'haunted') {
      petPhrases = [
        "The ghost whispers: 'Thy focus shall conquer all darkness...' 👻🩸",
        "Eerie purr... +5 cursed productivity points 💀",
        "A chilly breeze gives you goosebumps and superhuman typing speed!"
      ];
    }

    setCurrentPhrase(petPhrases[petCount % petPhrases.length]);
  };

  const renderMascotSprite = () => {
    // 1. Pixel Cat
    if (companionType === 'cat') {
      return (
        <div className={`pixel-cat-sprite ${state === 'working' ? 'focused' : 'idle'}`}>
          <div className="cat-ears">
            <div className="cat-ear left" />
            <div className="cat-ear right" />
          </div>
          <div className="cat-eyes">
            <div className="cat-eye left" />
            <div className="cat-eye right" />
          </div>
          <div className="cat-whiskers" />
          <div className="cat-tail" />
        </div>
      );
    }

    // 2. Wise Owl
    if (companionType === 'owl') {
      return (
        <div className={`wise-owl-sprite ${state === 'working' ? 'bobbing' : 'idle'}`}>
          <div className="owl-tufts" />
          <div className="owl-glasses">
            <div className="owl-lens left" />
            <div className="owl-lens right" />
          </div>
          <div className="owl-beak" />
          <div className="owl-wings" />
        </div>
      );
    }

    // 3. Baby Dragon
    if (companionType === 'dragon') {
      return (
        <div className={`baby-dragon-sprite ${state === 'working' ? 'flapping' : 'idle'}`}>
          <div className="dragon-horns" />
          <div className="dragon-eyes" />
          <div className="dragon-wings" />
          <div className="dragon-tail" />
        </div>
      );
    }

    // 4. Space Astronaut
    if (companionType === 'astronaut') {
      return (
        <div className={`space-astronaut-sprite ${state === 'working' ? 'orbiting' : 'floating'}`}>
          <div className="helmet-visor" />
          <div className="suit-pack" />
        </div>
      );
    }

    // 5. Cyber Mech Bot
    if (companionType === 'bot' || theme === 'cyberpunk') {
      return (
        <div className={`cyber-bot-sprite ${state === 'working' ? 'pulsing' : 'idle'}`}>
          <div className="bot-visor" />
          <div className="bot-antenna" />
          <div className="bot-core" />
        </div>
      );
    }

    // 6. Spooky Ghost
    if (companionType === 'ghost' || theme === 'haunted') {
      return (
        <div className={`spooky-ghost-sprite ${state === 'working' ? 'haunting' : 'idle'}`}>
          <div className="ghost-eyes">
            <div className="ghost-eye left" />
            <div className="ghost-eye right" />
          </div>
          <div className="ghost-tail" />
        </div>
      );
    }

    // 7. Default Dino (Neo)
    return (
      <div className={`pixel-dino-sprite ${theme === 'retro-pixel' ? 'retro-palette' : ''} ${state === 'working' ? 'jogging' : 'idle'}`}>
        <div className="dino-eye" />
        <div className="dino-snout" />
        <div className="dino-tail" />
        <div className="dino-spikes" />
        <div className="dino-legs">
          <div className="dino-leg left" />
          <div className="dino-leg right" />
        </div>
      </div>
    );
  };

  return (
    <div className="focus-companion-container">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhrase}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="companion-speech-bubble"
        >
          <p className="companion-text">{currentPhrase}</p>
          <span className="speech-arrow" />
        </motion.div>
      </AnimatePresence>

      {/* Themed Mascot */}
      <div className="companion-interactive-row">
        <motion.div
          className="companion-mascot"
          onClick={handlePet}
          whileHover={{ scale: 1.14 }}
          whileTap={{ scale: 0.88 }}
          title={`Click to pet your companion! (${companionType})`}
        >
          {renderMascotSprite()}

          {petCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -22 }}
              transition={{ duration: 1 }}
              key={petCount}
              className="pet-heart-float"
            >
              {companionType === 'dragon' ? (
                <Flame size={14} color="#f59e0b" fill="#f59e0b" />
              ) : companionType === 'ghost' ? (
                <Skull size={14} color="#ef4444" />
              ) : companionType === 'bot' ? (
                <Zap size={14} fill="#00f0ff" color="#00f0ff" />
              ) : companionType === 'astronaut' ? (
                <Sparkles size={14} color="#38bdf8" />
              ) : (
                <Heart size={14} fill="#ef4444" color="#ef4444" />
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="companion-actions-group">
          {onOpenPicker && (
            <button
              type="button"
              className="switch-pet-btn"
              onClick={onOpenPicker}
              title="Open Pet Wardrobe (Change Mascot)"
            >
              🐾 Switch Pet
            </button>
          )}

          {onRemovePet && (
            <button
              type="button"
              className="remove-pet-btn"
              onClick={onRemovePet}
              title="Remove companion pet and collapse workspace"
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
