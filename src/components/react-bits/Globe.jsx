import React, { useEffect, useRef, useState, useCallback } from 'react';
import createGlobe from 'cobe';

/**
 * Parses CSS colors (hex or rgb/rgba) to normalized [r, g, b] array with 0..1 values.
 */
function parseColorToRGB(colorStr, fallback = [1, 0.23, 0.19]) {
  if (!colorStr) return fallback;
  if (Array.isArray(colorStr) && colorStr.length >= 3) return colorStr;

  // Hex format
  if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  // RGB / RGBA format
  if (typeof colorStr === 'string' && colorStr.includes('rgb')) {
    const parts = colorStr.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [parseFloat(parts[0]) / 255, parseFloat(parts[1]) / 255, parseFloat(parts[2]) / 255];
    }
  }

  return fallback;
}

// Global Hubs for Focus Connections (Arcs & Markers)
const DEFAULT_GLOBAL_MARKERS = [
  { location: [37.7749, -122.4194], size: 0.08, label: 'San Francisco' },
  { location: [40.7128, -74.006], size: 0.07, label: 'New York' },
  { location: [51.5074, -0.1278], size: 0.07, label: 'London' },
  { location: [48.8566, 2.3522], size: 0.06, label: 'Paris' },
  { location: [35.6762, 139.6503], size: 0.09, label: 'Tokyo' },
  { location: [1.3521, 103.8198], size: 0.06, label: 'Singapore' },
  { location: [-33.8688, 151.2093], size: 0.06, label: 'Sydney' },
  { location: [28.6139, 77.209], size: 0.07, label: 'New Delhi' },
  { location: [52.52, 13.405], size: 0.05, label: 'Berlin' },
  { location: [-23.5505, -46.6333], size: 0.06, label: 'São Paulo' }
];

const DEFAULT_GLOBAL_ARCS = [
  { from: [37.7749, -122.4194], to: [35.6762, 139.6503] }, // SF -> Tokyo
  { from: [40.7128, -74.006], to: [51.5074, -0.1278] },    // NYC -> London
  { from: [51.5074, -0.1278], to: [28.6139, 77.209] },     // London -> Delhi
  { from: [35.6762, 139.6503], to: [-33.8688, 151.2093] }, // Tokyo -> Sydney
  { from: [48.8566, 2.3522], to: [1.3521, 103.8198] },    // Paris -> Singapore
  { from: [-23.5505, -46.6333], to: [40.7128, -74.006] }   // São Paulo -> NYC
];

/**
 * Globe - React Bits Pro Component
 * Interactive 3D globe with animated arcs, location markers,
 * smooth inertia pointer drag, and auto-rotation.
 * 
 * Spec: https://pro.reactbits.dev/docs/components/globe
 */
export default function Globe({
  className = '',
  width = 'auto',
  height = 'auto',
  primaryColor = '#ff3b30',
  neutralColor = '#71717a',
  glowColor,
  atmosphereColor,
  showAtmosphere = true,
  autoRotateSpeed = 0.85,
  enableZoom = false,
  interactive = true,
  markers = DEFAULT_GLOBAL_MARKERS,
  arcs = DEFAULT_GLOBAL_ARCS,
  onReady,
  onGlobeClick,
  dark,
  style = {}
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [activeMarker, setActiveMarker] = useState(null);

  // Determine dark mode (prop override or HTML attribute)
  const isDarkMode = dark !== undefined ? dark : (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');

  // Colors
  const primaryRGB = parseColorToRGB(primaryColor, [1, 0.23, 0.19]); // #ff3b30
  const neutralRGB = parseColorToRGB(neutralColor, isDarkMode ? [0.6, 0.6, 0.65] : [0.35, 0.35, 0.4]);
  const glowRGB = parseColorToRGB(glowColor || atmosphereColor, isDarkMode ? [0.25, 0.28, 0.4] : [0.92, 0.92, 0.96]);

  useEffect(() => {
    let phi = 0;
    let theta = 0.2;
    let widthPx = containerRef.current?.offsetWidth || 420;
    let globeInstance = null;
    let rafId = null;
    let isDestroyed = false;

    // Drag physics state
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onResize = () => {
      if (canvasRef.current && containerRef.current) {
        const measured = containerRef.current.offsetWidth || 420;
        if (measured > 0 && Math.abs(measured - widthPx) > 4) {
          widthPx = measured;
          if (globeInstance) {
            globeInstance.update({
              width: widthPx * 2,
              height: widthPx * 2
            });
          }
        }
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Initialize Cobe v2 3D Globe
      globeInstance = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
        width: widthPx * 2,
        height: widthPx * 2,
        phi: 0,
        theta: 0.2,
        dark: isDarkMode ? 1 : 0,
        diffuse: 1.25,
        mapSamples: 16000,
        mapBrightness: isDarkMode ? 6.2 : 3.8,
        baseColor: isDarkMode ? [0.55, 0.62, 0.75] : [0.28, 0.3, 0.35],
        markerColor: primaryRGB,
        glowColor: showAtmosphere ? glowRGB : [0, 0, 0],
        markers: markers.map((m) => ({
          location: m.location,
          size: m.size || 0.06,
          color: m.color ? parseColorToRGB(m.color) : primaryRGB
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          color: a.color ? parseColorToRGB(a.color) : primaryRGB
        })),
        arcColor: primaryRGB,
        arcWidth: 1.3,
        arcHeight: 0.32,
        opacity: 0.95
      });

      // ══════════ CONTINUOUS 60FPS ANIMATION LOOP ══════════
      // Cobe v2 requires manual requestAnimationFrame calling globeInstance.update()
      const animate = (timestamp) => {
        if (isDestroyed) return;

        const time = timestamp * 0.001;

        if (!isDragging) {
          // Apply inertia momentum decay
          if (Math.abs(velocityX) > 0.0001) {
            phi += velocityX;
            velocityX *= 0.94; // Smooth damping
          } else {
            // Silky continuous auto-rotation
            phi += 0.004 * autoRotateSpeed;
          }

          // Gentle spring return for tilt theta
          theta += (0.2 - theta) * 0.03;
        }

        if (globeInstance) {
          globeInstance.update({
            phi: phi,
            theta: theta,
            arcHeight: 0.32 + 0.025 * Math.sin(time * 2.5) // Dynamic pulsating arcs
          });
        }

        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);

      if (onReady) onReady();
    } catch (err) {
      console.warn('Error initializing 3D Globe:', err);
    }

    // Pointer & Touch Interaction Handlers
    const handleDown = (clientX, clientY) => {
      if (!interactive) return;
      isDragging = true;
      lastPointerX = clientX;
      lastPointerY = clientY;
      velocityX = 0;
      velocityY = 0;
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    };

    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      const deltaX = clientX - lastPointerX;
      const deltaY = clientY - lastPointerY;
      lastPointerX = clientX;
      lastPointerY = clientY;

      velocityX = deltaX * 0.006;
      velocityY = deltaY * 0.004;

      phi += velocityX;
      theta = Math.max(-0.6, Math.min(0.6, theta - velocityY));
    };

    const handleUp = () => {
      isDragging = false;
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    };

    const onMouseDown = (e) => handleDown(e.clientX, e.clientY);
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleUp();

    const onTouchStart = (e) => {
      if (e.touches[0]) handleDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleUp();

    const currentCanvas = canvasRef.current;
    if (currentCanvas && interactive) {
      currentCanvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      currentCanvas.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    // Fade-in canvas once ready
    setTimeout(() => {
      if (canvas) canvas.style.opacity = '1';
    }, 100);

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (currentCanvas && interactive) {
        currentCanvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        currentCanvas.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }
      if (globeInstance) {
        try {
          globeInstance.destroy();
        } catch (_) {}
      }
    };
  }, [isDarkMode, autoRotateSpeed, showAtmosphere, JSON.stringify(primaryRGB), JSON.stringify(markers), JSON.stringify(arcs)]);

  return (
    <div
      ref={containerRef}
      className={`rb-globe-wrapper ${className}`}
      style={{
        width: width === 'auto' ? '100%' : width,
        height: height === 'auto' ? '100%' : height,
        aspectRatio: '1 / 1',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '1',
          cursor: interactive ? 'grab' : 'default',
          opacity: 0,
          transition: 'opacity 0.6s ease',
          contain: 'layout paint size'
        }}
      />

      {/* Subtle Atmosphere Halo Glow in Background */}
      {showAtmosphere && (
        <div
          className="rb-globe-halo"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '12%',
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 55%, ${isDarkMode ? 'rgba(255, 59, 48, 0.08)' : 'rgba(255, 59, 48, 0.06)'} 75%, transparent 100%)`,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}
