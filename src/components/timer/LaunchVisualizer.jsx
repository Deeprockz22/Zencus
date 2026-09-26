import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import DecryptedText from '../react-bits/DecryptedText';
import { Play, Pause } from 'lucide-react';

export default function LaunchVisualizer({
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

  // Launch Colors (Brutalist Orange)
  const colors = {
    bg: '#F97316',
    primary: '#F97316',
    textPrimary: '#000000',
    textSecondary: '#FFFFFF',
    border: '#6C6655'
  };

  // WebGL Setup (Orange Background, Black Particles)
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
      
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 60;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      mountRef.current.appendChild(renderer.domElement);

    // DOT MATRIX PARTICLE FIELD (Sparse spacing for Launch design)
    const particleCount = 800; // Even sparser to let the orange dominate
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300; // x spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150; // y spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20; // z (depth)
      opacities[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    // Custom Shader Material for "Breathing Pulse" & Soft Depth Fade
    // Black particles on an orange background
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(colors.textPrimary) } // Black dots
      },
      vertexShader: `
        uniform float time;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (150.0 / -mvPosition.z); 
          
          // Slow breathing pulse
          float pulse = sin(time * 0.3 + position.x * 0.05) * 0.5 + 0.5;
          vOpacity = aOpacity * pulse * (1.0 - smoothstep(-60.0, 30.0, mvPosition.z));
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Crisp edges for brutalist style
          float alpha = smoothstep(0.5, 0.45, dist) * vOpacity;
          gl_FragColor = vec4(color, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
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
      mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      material.uniforms.time.value = elapsedTime * (isRunning ? 2.5 : 1.0);
      
      targetX = mouseX * 0.1;
      targetY = mouseY * 0.1;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      particles.rotation.y = elapsedTime * 0.01 * (isRunning ? 1.5 : 0.8);
      
      try {
        renderer.render(scene, camera);
      } catch (_) {}
    };
    
      animate();
    } catch (e) {
      console.warn('WebGL setup failed in LaunchVisualizer:', e);
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
  }, [isRunning, colors.textPrimary]);

  return (
    <div 
      className="launch-visualizer-hero absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden font-sans"
      style={{ backgroundColor: colors.bg, color: colors.textPrimary }}
    >
      {/* ThreeJS Canvas Mount Point */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-60" 
      />

      {/* ══════════ LAUNCH UI SHELL ══════════ */}
      {/* Full Bleed Flex Layout */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 md:p-12">
        
        {/* Top Meta Area */}
        <div className="flex justify-between items-start w-full uppercase tracking-[0.1em] text-xs font-bold">
          <div>STATUS: {isRunning ? 'ACTIVE' : 'STANDBY'}</div>
          <div className="text-right">
            <DecryptedText text={getModeTitle ? getModeTitle().toUpperCase() : 'LAUNCH SEQUENCE'} speed={40} maxIterations={10} />
          </div>
        </div>

        {/* Center Massive Typography */}
        <div className="flex-1 flex items-center justify-center w-full">
          {/* Gradient Border Shell Wrapper */}
          <div 
            className="p-[1px] shadow-2xl relative w-full max-w-5xl"
            style={{ 
              background: `linear-gradient(rgba(108, 102, 85, 0.05), rgba(108, 102, 85, 0.3), rgba(108, 102, 85, 0.05))` 
            }}
          >
            {/* Inner Outlined Surface */}
            <div 
              className="bg-[#F97316]/90 backdrop-blur-md p-8 md:p-16 w-full flex flex-col items-center justify-center border"
              style={{ 
                borderColor: colors.border,
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)'
              }}
            >
              {/* Massive Time Display */}
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex items-center justify-center w-full">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    className="text-[120px] sm:text-[200px] md:text-[266px] font-[800] tracking-[-0.01em] bg-transparent text-center outline-none w-full border-b-[8px]"
                    style={{ 
                      color: colors.textPrimary,
                      lineHeight: 0.85,
                      borderColor: colors.textPrimary
                    }}
                  />
                </form>
              ) : (
                <motion.div
                  className="text-[120px] sm:text-[200px] md:text-[266px] font-[800] tracking-[-0.01em] cursor-pointer"
                  style={{ 
                    color: colors.textPrimary,
                    lineHeight: 0.85
                  }}
                  onClick={() => {
                    if (!isRunning && setIsEditing) {
                      setEditMinutes(Math.floor(timeLeft / 60));
                      setIsEditing(true);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {formatTime ? formatTime(timeLeft) : '25:00'}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto gap-4">
          <div className="flex w-full items-center justify-between uppercase tracking-[0.1em] text-xs font-bold border-t pt-4" style={{ borderColor: colors.border }}>
            <span>T-MINUS</span>
            <span>{Math.round(progress)}% ENGINES</span>
          </div>

          <div className="w-full flex items-center gap-4">
            <button
              onClick={() => isRunning ? pauseTimer() : startTimer()}
              className="flex-shrink-0 flex items-center justify-center w-16 h-16 transition-transform active:scale-90 border-2"
              style={{ 
                backgroundColor: colors.textPrimary, 
                color: colors.bg,
                borderColor: colors.textPrimary
              }}
            >
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            {/* Brutalist Progress Bar */}
            <div className="flex-1 h-16 border-2 flex items-stretch p-1" style={{ borderColor: colors.textPrimary }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: colors.textPrimary }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.5 }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
