import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Volume2, Radio, Disc, Activity } from 'lucide-react';
import DecryptedText from '../react-bits/DecryptedText';
import { sfx } from '../../utils/sfx';

export default function BakF2Visualizer({
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
  const canvasRef = useRef(null);
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // BAK F2 Design System Tokens
  const colors = {
    primary: '#9DB0AF',
    secondary: '#5CC8CD',
    tertiary: '#9EA7BA',
    neutral: '#E7EFEE',
    surface: '#080c0d',
    border: 'rgba(157, 176, 175, 0.4)',
    borderSolid: '#9DB0AF'
  };

  // Simulated VU Meter dB levels
  const [vuLevels, setVuLevels] = useState({ left: 45, right: 48, peakL: 60, peakR: 62 });

  useEffect(() => {
    let animId;
    const updateVU = () => {
      if (isRunning) {
        // High dynamic range simulation for 32-bit float
        const baseL = 40 + Math.random() * 35 + Math.sin(Date.now() * 0.008) * 15;
        const baseR = 40 + Math.random() * 35 + Math.cos(Date.now() * 0.007) * 15;
        setVuLevels(prev => ({
          left: baseL,
          right: baseR,
          peakL: Math.max(baseL, prev.peakL - 0.4),
          peakR: Math.max(baseR, prev.peakR - 0.4)
        }));
      } else {
        setVuLevels(prev => ({
          left: Math.max(6, prev.left * 0.9),
          right: Math.max(6, prev.right * 0.9),
          peakL: Math.max(6, prev.peakL * 0.95),
          peakR: Math.max(6, prev.peakR * 0.95)
        }));
      }
      animId = requestAnimationFrame(updateVU);
    };
    animId = requestAnimationFrame(updateVU);
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  // Real-time Audio Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let phase = 0;

    const renderWave = () => {
      frameId = requestAnimationFrame(renderWave);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw horizontal baseline
      ctx.strokeStyle = 'rgba(157, 176, 175, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Oscilloscope Signal Trace
      ctx.strokeStyle = isRunning ? colors.secondary : 'rgba(157, 176, 175, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const points = 120;
      phase += isRunning ? 0.08 : 0.01;

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = i / points;
        const envelope = Math.sin(normX * Math.PI); // Window tapering at edges

        let y;
        if (isRunning) {
          y = height / 2 +
            Math.sin(normX * 18 + phase) * 14 * envelope +
            Math.sin(normX * 36 - phase * 1.5) * 6 * envelope;
        } else {
          y = height / 2 + Math.sin(normX * 8 + phase) * 2 * envelope;
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    renderWave();
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, colors.secondary]);

  // WebGL: Dot-Matrix Particle Field from BAK F2 Design
  useEffect(() => {
    if (!mountRef.current) return;

    let renderer;
    let geometry;
    let material;
    let animId;
    let handleMouseMove;
    let handleResize;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      mountRef.current.appendChild(renderer.domElement);

    const particleCount = 1800;
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 45;
      opacities[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(colors.primary) }
      },
      vertexShader: `
        uniform float time;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (180.0 / -mvPosition.z);
          float pulse = sin(time * 0.4 + position.x * 0.04) * 0.5 + 0.5;
          vOpacity = aOpacity * pulse * (1.0 - smoothstep(-90.0, 45.0, mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.38, dist) * vOpacity;
          gl_FragColor = vec4(color, alpha * 0.55);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    };
    window.addEventListener('mousemove', handleMouseMove);

    handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.time.value = elapsedTime * (isRunning ? 2.0 : 0.8);

        camera.position.x += (mouseX * 0.08 - camera.position.x) * 0.03;
        camera.position.y += (-mouseY * 0.08 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        particles.rotation.y = elapsedTime * 0.015 * (isRunning ? 1.6 : 0.8);
        try {
          renderer.render(scene, camera);
        } catch (_) {}
      };
      animate();
    } catch (err) {
      console.warn('WebGL setup failed in BakF2Visualizer:', err);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer?.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
    };
  }, [isRunning, colors.primary]);

  // Format SMPTE Timecode: HH:MM:SS:FF
  const smpteTimecode = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const frames = isRunning ? Math.floor((Date.now() % 1000) / 41.6) : 0; // ~24fps
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }, [timeLeft, isRunning]);

  return (
    <div className="bak-f2-field-recorder relative inset-0 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none font-mono text-[#E7EFEE]">
      {/* ══════════ WEBGL BACKGROUND ══════════ */}
      <div
        className="absolute inset-0 -z-20 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(1250px 900px at 63% 42%, #111c1d 0%, #0b1112 52%, #080c0d 100%)'
        }}
      />
      <div
        ref={mountRef}
        className="absolute inset-0 -z-10 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ══════════ TOP TELEMETRY STRIP (4px Grid Cadence) ══════════ */}
      <div className="w-full max-w-5xl flex items-center justify-between border border-[#9DB0AF]/40 rounded-[3px] p-2 bg-[#080c0d]/80 backdrop-blur-md text-[11px] tracking-[0.16em] z-10">
        {/* Left: Device Name & Architecture */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#9DB0AF] flex items-center gap-1.5">
            <Radio size={14} className="text-[#5CC8CD]" />
            BAK F2
          </span>
          <span className="text-[#9DB0AF]/60">|</span>
          <span className="text-[#E7EFEE]/80 hidden sm:inline">32-BIT FLOAT FIELD RECORDER</span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#5CC8CD]/10 text-[#5CC8CD] border border-[#5CC8CD]/30 text-[9px]">
            192.0 kHz
          </span>
        </div>

        {/* Center: Rec / Pause Tally LED */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#5CC8CD] animate-pulse shadow-[0_0_8px_#5CC8CD]' : 'bg-[#9DB0AF]/40'}`} />
          <span className={isRunning ? 'text-[#5CC8CD] font-bold' : 'text-[#9DB0AF]/70'}>
            {isRunning ? '● REC LOCK' : '○ STANDBY'}
          </span>
        </div>

        {/* Right: Media & Battery Telemetry */}
        <div className="flex items-center gap-3">
          <span className="text-[#9DB0AF]/80 hidden md:inline">SD: 48h 12m</span>
          <span className="text-[#9DB0AF]/60 hidden md:inline">|</span>
          <span className="text-[#5CC8CD]">BAT 98%</span>
        </div>
      </div>

      {/* ══════════ CENTER CHASSIS: DUAL VU METERS & LARGE TIMECODE ══════════ */}
      <div className="my-auto w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-6 z-10 py-4">
        
        {/* LEFT: Dual Channel 32-bit Float Stereo VU Meters */}
        <div className="w-full lg:w-48 flex flex-col gap-2 p-3 border border-[#9DB0AF]/40 rounded-[3px] bg-[#080c0d]/70 backdrop-blur-md">
          <div className="flex justify-between items-center text-[10px] tracking-[0.16em] text-[#9DB0AF]">
            <span>CH 1 / L</span>
            <span className="text-[#5CC8CD] font-semibold">{isRunning ? `-${(50 - vuLevels.left * 0.5).toFixed(1)} dB` : '-∞ dB'}</span>
          </div>
          {/* Channel 1 Ladder */}
          <div className="w-full h-3 bg-[#111c1d] rounded-[2px] overflow-hidden relative border border-[#9DB0AF]/20">
            <div
              className="h-full bg-gradient-to-r from-[#9DB0AF] via-[#5CC8CD] to-[#E7EFEE] transition-all duration-75"
              style={{ width: `${vuLevels.left}%` }}
            />
            {/* Peak hold indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#5CC8CD]"
              style={{ left: `${vuLevels.peakL}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] tracking-[0.16em] text-[#9DB0AF] mt-1">
            <span>CH 2 / R</span>
            <span className="text-[#5CC8CD] font-semibold">{isRunning ? `-${(50 - vuLevels.right * 0.5).toFixed(1)} dB` : '-∞ dB'}</span>
          </div>
          {/* Channel 2 Ladder */}
          <div className="w-full h-3 bg-[#111c1d] rounded-[2px] overflow-hidden relative border border-[#9DB0AF]/20">
            <div
              className="h-full bg-gradient-to-r from-[#9DB0AF] via-[#5CC8CD] to-[#E7EFEE] transition-all duration-75"
              style={{ width: `${vuLevels.right}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#5CC8CD]"
              style={{ left: `${vuLevels.peakR}%` }}
            />
          </div>

          {/* dB Scale Markings */}
          <div className="flex justify-between text-[8px] text-[#9DB0AF]/60 px-0.5 pt-0.5">
            <span>-48</span>
            <span>-24</span>
            <span>-12</span>
            <span>-6</span>
            <span>0</span>
            <span className="text-[#5CC8CD]">+6</span>
          </div>
        </div>

        {/* CENTER: Massive System Font Digits & Interactive Transport */}
        <div className="flex flex-col items-center justify-center text-center flex-1 px-2">
          {/* Badge */}
          <div className="mb-2 px-3 py-1 rounded-[3px] border border-[#9DB0AF]/40 bg-[#080c0d]/90 text-[#9DB0AF] text-[10px] tracking-[0.16em] uppercase">
            <DecryptedText text={getModeTitle ? getModeTitle() : 'BAK F2 Field Session'} speed={25} maxIterations={8} />
          </div>

          {/* Big Bold Time Digits (176px responsive display) */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="my-2 flex items-center justify-center">
              <input
                type="number"
                min="1"
                max="180"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
                autoFocus
                onBlur={() => setIsEditing(false)}
                className="text-6xl sm:text-8xl font-black bg-transparent border-b-2 border-[#5CC8CD] text-[#E7EFEE] px-2 py-1 text-center w-36 outline-none"
              />
            </form>
          ) : (
            <motion.div
              className="text-6xl sm:text-8xl md:text-[140px] font-bold tracking-tight text-[#E7EFEE] cursor-pointer drop-shadow-[0_0_25px_rgba(231,239,238,0.15)] leading-none my-1"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.025em'
              }}
              onClick={() => {
                if (!isRunning && setIsEditing) {
                  setEditMinutes(Math.floor(timeLeft / 60));
                  setIsEditing(true);
                }
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              title="Click to edit session length"
            >
              {formatTime ? formatTime(timeLeft) : '25:00'}
            </motion.div>
          )}

          {/* SMPTE Timecode Readout */}
          <div className="text-xs sm:text-sm tracking-[0.2em] text-[#5CC8CD] font-mono mt-1 opacity-90">
            SMPTE {smpteTimecode}
          </div>

          {/* Progress Bar with 3px Corner Radii */}
          <div className="w-64 sm:w-80 h-1.5 bg-[#111c1d] rounded-[3px] overflow-hidden mt-6 border border-[#9DB0AF]/30">
            <motion.div
              className="h-full bg-[#5CC8CD] rounded-[3px]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.5 }}
            />
          </div>
        </div>

        {/* RIGHT: Live Audio Signal Oscilloscope & Preamps */}
        <div className="w-full lg:w-48 flex flex-col gap-2 p-3 border border-[#9DB0AF]/40 rounded-[3px] bg-[#080c0d]/70 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-[#9DB0AF]">
            <span className="flex items-center gap-1">
              <Activity size={12} className="text-[#5CC8CD]" />
              TRACE
            </span>
            <span className="text-[#5CC8CD]">{isRunning ? '192 kHz' : 'IDLE'}</span>
          </div>

          {/* Mini Oscilloscope Screen */}
          <div className="w-full h-16 bg-[#060a0b] rounded-[3px] border border-[#9DB0AF]/30 overflow-hidden relative">
            <canvas ref={canvasRef} width={180} height={64} className="w-full h-full block" />
            <div className="absolute top-1 right-1 text-[8px] text-[#9DB0AF]/40">RMS</div>
          </div>

          {/* Preamps Hardware Gain Controls */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[9px] tracking-[0.14em] text-[#9DB0AF]">
            <div className="flex flex-col items-center border border-[#9DB0AF]/20 rounded-[2px] p-1 bg-[#0a0f10]">
              <span>TRIM 1</span>
              <span className="text-[#E7EFEE] font-bold">+18.5 dB</span>
            </div>
            <div className="flex flex-col items-center border border-[#9DB0AF]/20 rounded-[2px] p-1 bg-[#0a0f10]">
              <span>TRIM 2</span>
              <span className="text-[#E7EFEE] font-bold">+18.5 dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM CONTROLS & MECHANICAL TRIGGER (150ms Motion) ══════════ */}
      <div className="w-full max-w-xl flex items-center justify-center gap-4 z-10 mt-auto">
        <button
          onClick={() => {
            sfx.play('toggle');
            if (isRunning) pauseTimer?.();
            else startTimer?.();
          }}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-[3px] border font-mono text-xs tracking-[0.16em] uppercase font-bold transition-all duration-150 active:scale-95 ${
            isRunning
              ? 'bg-[#111c1d] border-[#5CC8CD] text-[#5CC8CD] shadow-[0_0_15px_rgba(92,200,205,0.25)]'
              : 'bg-[#9DB0AF] border-[#9DB0AF] text-[#080c0d] hover:bg-[#E7EFEE] shadow-[0_0_20px_rgba(157,176,175,0.3)]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              PAUSE RECORDER
            </>
          ) : (
            <>
              <Play size={14} />
              START 32-BIT RECORD
            </>
          )}
        </button>
      </div>
    </div>
  );
}
