import React, { useEffect, useRef } from 'react';

/**
 * StarfieldBackground Component
 * 3D deep-space starfield simulation with realistic depth projection,
 * parallax drift, and twinkling celestial bodies.
 */
export default function StarfieldBackground({
  starCount = 450,
  speed = 0.45,
  maxDepth = 1200,
  shootingStarInterval = 6000,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize 3D Stars
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * maxDepth,
      size: Math.random() * 1.6 + 0.4,
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 210 : 270) : 0, // occasional ice-blue or violet star
      brightness: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2
    }));

    // Shooting Stars
    let shootingStars = [];
    let lastShootingStarTime = Date.now();

    const spawnShootingStar = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.5);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 deg
      const velocity = Math.random() * 12 + 16;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        length: Math.random() * 80 + 50,
        life: 1.0,
        decay: Math.random() * 0.018 + 0.012
      });
    };

    const render = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const centerX = width / 2;
      const centerY = height / 2;
      const offsetX = (mouseX - centerX) * 0.15;
      const offsetY = (mouseY - centerY) * 0.15;

      const fov = 350;

      // Render 3D Stars
      stars.forEach((star) => {
        // Move star towards screen
        star.z -= speed;
        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // Project 3D to 2D
        const k = fov / star.z;
        const px = (star.x - offsetX) * k + centerX;
        const py = (star.y - offsetY) * k + centerY;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0.1, (1 - star.z / maxDepth) * 1.2));
          star.twinklePhase += star.twinkleSpeed;
          const twinkle = (Math.sin(star.twinklePhase) + 1) * 0.3 + 0.4;
          const finalAlpha = depthAlpha * star.brightness * twinkle;
          const renderSize = Math.max(0.6, star.size * k * 0.8);

          ctx.beginPath();
          ctx.arc(px, py, renderSize, 0, Math.PI * 2);

          if (star.hue > 0) {
            ctx.fillStyle = `hsla(${star.hue}, 90%, 80%, ${finalAlpha})`;
            ctx.shadowColor = `hsla(${star.hue}, 90%, 70%, 0.8)`;
            ctx.shadowBlur = renderSize > 1.5 ? 6 : 0;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
            ctx.shadowBlur = renderSize > 1.5 ? 4 : 0;
          }

          ctx.fill();
        }
      });

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Handle Shooting Stars
      if (Date.now() - lastShootingStarTime > shootingStarInterval) {
        spawnShootingStar();
        lastShootingStarTime = Date.now() + (Math.random() - 0.5) * 2000;
      }

      shootingStars.forEach((s, idx) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          shootingStars.splice(idx, 1);
          return;
        }

        const tailX = s.x - s.vx * (s.length / 10);
        const tailY = s.y - s.vy * (s.length / 10);

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.life * 0.85})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [starCount, speed, maxDepth, shootingStarInterval]);

  return (
    <canvas
      ref={canvasRef}
      className={`starfield-canvas ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
}
