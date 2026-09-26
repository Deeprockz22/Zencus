import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { Sparkles, Waves, Globe2, Wind } from 'lucide-react';

export default function ShaderGradientVisualizer({
  timeLeft = 1500,
  totalDuration = 1500,
  isRunning = false,
  mode = 'work',
  theme = 'dark'
}) {
  const [meshType, setMeshType] = useState('sphere'); // 'sphere' | 'waterPlane' | 'plane'
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const breathTimerRef = useRef(null);

  // Meditation breathing cycle (4s Inhale, 4s Exhale)
  useEffect(() => {
    if (!isRunning) {
      setBreathPhase('Rest');
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 8;
      if (step < 4) {
        setBreathPhase('Inhale');
      } else {
        setBreathPhase('Exhale');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Subtle pointer parallax
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const isLight = theme === 'light' || theme === 'sketch';

  // Dynamic palette based on mode
  const colors = useMemo(() => {
    if (mode === 'chill') {
      return {
        color1: '#4C1D95',
        color2: '#8B5CF6',
        color3: '#F43F5E',
        bgColor1: '#1E1B4B',
        bgColor2: '#0F172A',
        speed: 0.35,
        strength: 2.5
      };
    }
    if (mode === 'shortBreak' || mode === 'longBreak') {
      return {
        color1: '#065F46',
        color2: '#10B981',
        color3: '#38BDF8',
        bgColor1: '#022C22',
        bgColor2: '#064E3B',
        speed: 0.25,
        strength: 2.0
      };
    }
    // Work / Focus
    return {
      color1: '#3B82F6',
      color2: '#6366F1',
      color3: '#EC4899',
      bgColor1: '#090D16',
      bgColor2: '#0F172A',
      speed: isRunning ? 0.3 : 0.12,
      strength: isRunning ? 2.8 : 1.6
    };
  }, [mode, isRunning]);

  return (
    <div
      className="shader-viz-stage relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden"
      onPointerMove={handlePointerMove}
    >
      {/* 3D WebGL ShaderGradient Canvas */}
      <div className="absolute inset-0 z-0">
        <ShaderGradientCanvas
          style={{ width: '100%', height: '100%' }}
          pixelDensity={window.devicePixelRatio > 1 ? 1.5 : 1}
          fov={meshType === 'sphere' ? 40 : 45}
          lazyLoad={false}
        >
          <ShaderGradient
            control="props"
            color1={colors.color1}
            color2={colors.color2}
            color3={colors.color3}
            type={meshType}
            animate={isRunning ? 'on' : 'off'}
            uSpeed={colors.speed}
            uStrength={colors.strength}
            uDensity={meshType === 'sphere' ? 1.4 : 1.1}
            uFrequency={5.5}
            grain="on"
            lightType="3d"
            brightness={isLight ? 1.2 : 1.05}
            reflection={0.2}
            cAzimuthAngle={180 + mousePos.x * 25}
            cPolarAngle={90 + mousePos.y * 20}
            cDistance={meshType === 'sphere' ? 3.4 : 3.8}
            cameraZoom={1}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Floating Controls & Breathing Harmonic Pill */}
      <div className="relative z-10 flex flex-col items-center gap-4 pointer-events-auto">
        {/* Breathing Guide Pill */}
        <div className="shader-breath-pill backdrop-blur-md px-4 py-2 rounded-full border border-white/10 bg-black/20 flex items-center gap-2 shadow-2xl transition-all duration-700">
          <Wind size={15} className={`text-white/80 transition-transform duration-700 ${breathPhase === 'Inhale' ? 'scale-125 rotate-12' : 'scale-90 -rotate-12'}`} />
          <span className="text-xs uppercase tracking-widest font-mono text-white/90">
            {isRunning ? `${breathPhase} Rhythm` : 'Paused • Focus Aura'}
          </span>
        </div>

        {/* 3D Geometry Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full backdrop-blur-md bg-black/30 border border-white/10">
          <button
            type="button"
            onClick={() => setMeshType('sphere')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              meshType === 'sphere'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Harmonic 3D Sphere"
          >
            <Globe2 size={13} />
            <span>Sphere</span>
          </button>
          <button
            type="button"
            onClick={() => setMeshType('waterPlane')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              meshType === 'waterPlane'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Fluid Ocean Wave"
          >
            <Waves size={13} />
            <span>Ocean</span>
          </button>
          <button
            type="button"
            onClick={() => setMeshType('plane')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              meshType === 'plane'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Chromatic Plane"
          >
            <Sparkles size={13} />
            <span>Plane</span>
          </button>
        </div>
      </div>
    </div>
  );
}
