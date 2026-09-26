import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import DecryptedText from '../react-bits/DecryptedText';
import { Sparkles, Play, Pause } from 'lucide-react';
import { sfx } from '../../utils/sfx';

/**
 * NeuformVisualizer - Generative 3D Iridescent Glass Metamaterial
 * Faithful to Neuform.ai design patterns:
 * Organic 3D fluid morphing sphere with chromatic dispersion Fresnel shader,
 * liquid ripples, orbiting glass droplets, and frosted luxury glass typography.
 */
export default function NeuformVisualizer({
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

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer;
    let animId;
    let handleResize;
    let handleMouseMove;
    let sphereGeometry;
    let sphereMaterial;
    let dropletGeo;
    let dropletMat;

    try {
      // Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 24;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

    // ══════════ GENERATIVE IRIDESCENT DEFORMABLE MESH ══════════
    // High-poly sphere for silky smooth vertex displacement
    const sphereGeometry = new THREE.IcosahedronGeometry(7.5, 64);

    // Custom Neuform Iridescence & Chromatic Dispersion GLSL Shader
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uDistortion: { value: 0.65 },
        uRunning: { value: isRunning ? 1.0 : 0.2 },
        uColor1: { value: new THREE.Color('#d4b5ff') }, // Pearlescent lavender
        uColor2: { value: new THREE.Color('#6ee7b7') }, // Mint/teal iridescence
        uColor3: { value: new THREE.Color('#f472b6') }, // Rosy sheen
        uColor4: { value: new THREE.Color('#38bdf8') }  // Cyan rim
      },
      vertexShader: `
        uniform float uTime;
        uniform float uDistortion;
        uniform float uRunning;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;

        // Simplex-style 3D noise function
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          // Organic fluid vertex deformation
          float frequency = 0.3;
          float speed = uTime * 0.45;
          float noiseVal = snoise(position * frequency + vec3(speed, speed * 0.8, speed * 1.2));
          
          vec3 displaced = position + normal * (noiseVal * uDistortion * (0.8 + uRunning * 0.6));
          vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
          vWorldPosition = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          
          // Fresnel Edge Rim (Pearlescent glass glint)
          float fresnel = 1.0 - max(0.0, dot(viewDir, normalize(vNormal)));
          fresnel = pow(fresnel, 2.2);

          // Chromatic Dispersion Color Gradient
          float angle = dot(vNormal, vec3(0.5, 0.8, 0.2)) * 0.5 + 0.5;
          vec3 baseColor = mix(uColor1, uColor2, sin(angle * 3.1415 + uTime * 0.3) * 0.5 + 0.5);
          baseColor = mix(baseColor, uColor3, fresnel * 0.8);
          baseColor = mix(baseColor, uColor4, pow(fresnel, 4.0));

          // Specular highlights
          vec3 lightDir = normalize(vec3(5.0, 10.0, 7.0));
          vec3 halfVector = normalize(lightDir + viewDir);
          float spec = pow(max(0.0, dot(vNormal, halfVector)), 32.0);

          vec3 finalColor = baseColor + vec3(spec * 0.6);
          float alpha = 0.75 + fresnel * 0.25;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const metamaterialMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(metamaterialMesh);

    // Orbiting iridescent droplet particles
    const dropletCount = 45;
    const droplets = [];
    const dropletGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const dropletMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    for (let i = 0; i < dropletCount; i++) {
      const drop = new THREE.Mesh(dropletGeo, dropletMat);
      const angle = (i / dropletCount) * Math.PI * 2;
      const radius = 9.5 + Math.random() * 4.0;
      drop.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 8.0,
        Math.sin(angle) * radius
      );
      drop.userData = {
        angle,
        radius,
        speed: 0.005 + Math.random() * 0.015,
        yBase: drop.position.y
      };
      scene.add(drop);
      droplets.push(drop);
    }

    // Ambient & Point Lighting for Metallic Droplets
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const keyLight = new THREE.PointLight(0xa78bfa, 2.5, 50);
    keyLight.position.set(10, 15, 15);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 2.0, 50);
    rimLight.position.set(-12, -10, -10);
    scene.add(rimLight);

    // Pointer Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.002;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.002;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      sphereMaterial.uniforms.uTime.value = elapsed;
      sphereMaterial.uniforms.uRunning.value = isRunning ? 1.0 : 0.2;

      // Soft rotation & pointer parallax
      metamaterialMesh.rotation.y = elapsed * (isRunning ? 0.25 : 0.08);
      metamaterialMesh.rotation.x = Math.sin(elapsed * 0.15) * 0.2;

      camera.position.x += (mouseX * 12 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 12 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Animate orbiting chrome droplets
      droplets.forEach((d) => {
        d.userData.angle += d.userData.speed * (isRunning ? 2.0 : 1.0);
        d.position.x = Math.cos(d.userData.angle) * d.userData.radius;
        d.position.z = Math.sin(d.userData.angle) * d.userData.radius;
        d.position.y = d.userData.yBase + Math.sin(elapsed * 1.5 + d.userData.angle) * 1.2;
      });

      try {
        renderer.render(scene, camera);
      } catch (_) {}
    };
      animate();
    } catch (e) {
      console.warn('WebGL setup failed in NeuformVisualizer:', e);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer?.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (_) {}
      }
      try {
        sphereGeometry?.dispose();
        sphereMaterial?.dispose();
        dropletGeo?.dispose();
        dropletMat?.dispose();
        renderer?.dispose();
      } catch (_) {}
    };
  }, [isRunning]);

  return (
    <div className="neuform-iridescent-experience relative inset-0 w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden select-none">
      {/* ══════════ NEUFORM AMBIENT RADIAL LIGHT ══════════ */}
      <div
        className="absolute inset-0 -z-20 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(1100px 900px at 50% 50%, rgba(212, 181, 255, 0.08) 0%, rgba(56, 189, 248, 0.04) 45%, #05070a 100%)'
        }}
      />

      {/* Three.js Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 -z-10 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ══════════ TOP FROSTED GLASS CAPSULE ══════════ */}
      <div className="w-full max-w-md flex items-center justify-between px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-2xl text-xs tracking-widest text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] z-10">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-[#a78bfa]" />
          NEUFORM
        </span>
        <span className="text-white/40">•</span>
        <span className="text-white/70 uppercase text-[10px]">
          <DecryptedText text={getModeTitle ? getModeTitle() : 'IRIDESCENT GLASS'} speed={25} />
        </span>
        <span className="text-white/40">•</span>
        <span className="text-[#6ee7b7] text-[10px] font-mono">
          {isRunning ? 'FLUID 60FPS' : 'ZEN REST'}
        </span>
      </div>

      {/* ══════════ CENTER FROSTED HERO: MASSIVE LUXURY DIGITS ══════════ */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10">
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
              className="text-6xl sm:text-9xl font-extralight bg-transparent border-b border-white/40 text-white px-2 py-1 text-center w-40 outline-none backdrop-blur-md"
            />
          </form>
        ) : (
          <motion.div
            className="text-7xl sm:text-9xl md:text-[130px] font-extralight tracking-tight text-white/95 cursor-pointer drop-shadow-[0_0_40px_rgba(212,181,255,0.4)] leading-none select-none"
            style={{
              fontFamily: '"Outfit", -apple-system, sans-serif'
            }}
            onClick={() => {
              if (!isRunning && setIsEditing) {
                setEditMinutes(Math.floor(timeLeft / 60));
                setIsEditing(true);
              }
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {formatTime ? formatTime(timeLeft) : '25:00'}
          </motion.div>
        )}

        {/* Minimalist Glass Morph Progress Ring / Line */}
        <div className="w-64 sm:w-80 h-1 bg-white/10 rounded-full overflow-hidden mt-6 backdrop-blur-lg border border-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#d4b5ff] via-[#6ee7b7] to-[#38bdf8] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.5 }}
          />
        </div>
      </div>

      {/* ══════════ BOTTOM TRANSPORT BUTTON ══════════ */}
      <div className="w-full max-w-xs flex items-center justify-center z-10">
        <button
          onClick={() => {
            sfx.play('toggle');
            if (isRunning) pauseTimer?.();
            else startTimer?.();
          }}
          className={`px-8 py-3 rounded-full border text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-2 backdrop-blur-xl ${
            isRunning
              ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-[0_0_25px_rgba(167,139,250,0.3)]'
              : 'bg-white text-black border-white hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.4)]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              Pause Session
            </>
          ) : (
            <>
              <Play size={14} />
              Enter Flow
            </>
          )}
        </button>
      </div>
    </div>
  );
}
