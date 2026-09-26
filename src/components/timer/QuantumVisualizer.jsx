import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import DecryptedText from '../react-bits/DecryptedText';
import { Play, Pause } from 'lucide-react';

export default function QuantumVisualizer({
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
  const mountRef = useRef(null);
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Resolve theme colors dynamically
  const getThemeColor = (varName, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || fallback;
  };

  const colors = {
    bg: 'var(--bg-primary)',
    primary: 'var(--accent-primary)',
    text: 'var(--text-primary)',
    border: 'var(--border-subtle)'
  };

  // WebGL Setup (Light Mode, Indigo Particles)
  useEffect(() => {
    if (!mountRef.current) return;

    let renderer;
    let animationFrameId;
    let handleMouseMove;
    let handleResize;
    let geometry;
    let material;

    try {
      const scene = new THREE.Scene();
      
      // Perspective camera for parallax depth
      const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      mountRef.current.appendChild(renderer.domElement);

    // DOT MATRIX PARTICLE FIELD (Sparse spacing for Quantum design)
    const particleCount = 1200; // Sparser than Neuform
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 40; // z (depth)
      opacities[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    // Custom Shader Material for "Breathing Pulse" & Soft Depth Fade
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(getThemeColor('--accent-primary', '#8B5CF6')) }
      },
      vertexShader: `
        uniform float time;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (120.0 / -mvPosition.z); // Perspective scale
          
          // Slow breathing pulse
          float pulse = sin(time * 0.4 + position.x * 0.05) * 0.5 + 0.5;
          vOpacity = aOpacity * pulse * (1.0 - smoothstep(-80.0, 40.0, mvPosition.z));
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
          // Circular dot
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft edge for light mode blending
          float alpha = smoothstep(0.5, 0.3, dist) * vOpacity;
          gl_FragColor = vec4(color, alpha * 0.7); // Subdued intensity for light mode
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending, // Normal blending works better for dark-on-light
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // MOUSE PARALLAX DRIFT
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.03;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.03;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // RESIZE
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Update Uniforms
      material.uniforms.time.value = elapsedTime * (isRunning ? 2.5 : 1.0);
      
      // Pointer Drift
      targetX = mouseX * 0.1;
      targetY = mouseY * 0.1;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Slow drift rotation
      particles.rotation.y = elapsedTime * 0.01 * (isRunning ? 2.0 : 1.0);
      
      try {
        renderer.render(scene, camera);
      } catch (_) {}
    };
    
    animate();
    } catch (e) {
      console.warn('WebGL setup failed in QuantumVisualizer:', e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer?.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (_) {}
      }
      try {
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      } catch (_) {}
    };
  }, [isRunning, colors.primary]);

  return (
    <div 
      className="quantum-visualizer-hero absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* ThreeJS Canvas Mount Point */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0 w-full h-full pointer-events-none" 
      />

      {/* ══════════ QUANTUM UI SHELL ══════════ */}
      <div className="timer-display-panel flex flex-col items-center justify-center z-10 w-full max-w-lg mx-auto px-4">
        
        {/* Gradient Border Shell Wrapper */}
        <div 
          className="p-[1px] rounded-[17px] shadow-2xl relative"
          style={{ 
            background: 'linear-gradient(135deg, var(--border-subtle), transparent, var(--border-focus, rgba(139, 92, 246, 0.3)))' 
          }}
        >
          {/* Inner Elevated Surface */}
          <div 
            className="bg-[var(--bg-secondary)]/90 backdrop-blur-md rounded-[16px] p-8 md:p-12 w-full flex flex-col items-center border border-[var(--border-subtle)]"
            style={{ 
              boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Minimal Badge */}
            <div className="mb-8 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--accent-primary)]">
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                <DecryptedText text={getModeTitle ? getModeTitle() : 'Quantum Routine'} speed={30} maxIterations={8} />
              </span>
            </div>

            {/* Time Display */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex items-center justify-center my-4">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  className="text-6xl sm:text-[80px] font-light tracking-[-0.05em] bg-transparent text-center outline-none w-48 border-b border-[var(--border-subtle)]"
                  style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }}
                />
              </form>
            ) : (
              <motion.div
                className="text-7xl sm:text-[100px] font-light tracking-[-0.05em] cursor-pointer leading-none my-2 text-[var(--text-primary)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={() => {
                  if (!isRunning && setIsEditing) {
                    setEditMinutes(Math.floor(timeLeft / 60));
                    setIsEditing(true);
                  }
                }}
                whileHover={{ scale: 1.01 }}
              >
                {formatTime ? formatTime(timeLeft) : '25:00'}
              </motion.div>
            )}

            {/* Controls */}
            <div className="mt-12 flex flex-col items-center gap-6 w-full">
              <button
                onClick={() => isRunning ? pauseTimer() : startTimer()}
                className="flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-95"
                style={{ 
                  backgroundColor: isRunning ? 'var(--bg-tertiary)' : 'var(--accent-primary)', 
                  color: isRunning ? 'var(--text-primary)' : 'var(--bg-primary)',
                  border: isRunning ? '1px solid var(--border-subtle)' : 'none',
                  boxShadow: isRunning ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
                }}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden mt-4">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.5 }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
