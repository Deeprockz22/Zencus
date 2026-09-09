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

// Live routes flown across the globe. Unlike arcs these draw no standing line —
// each is travelled by a moving aircraft that trails a short vapour wake.
const DEFAULT_FLIGHT_ROUTES = [
  { from: [37.7749, -122.4194], to: [35.6762, 139.6503] }, // SF -> Tokyo
  { from: [40.7128, -74.006], to: [51.5074, -0.1278] },    // NYC -> London
  { from: [51.5074, -0.1278], to: [28.6139, 77.209] },     // London -> Delhi
  { from: [35.6762, 139.6503], to: [-33.8688, 151.2093] }, // Tokyo -> Sydney
  { from: [48.8566, 2.3522], to: [1.3521, 103.8198] },     // Paris -> Singapore
  { from: [-23.5505, -46.6333], to: [40.7128, -74.006] },  // São Paulo -> NYC
  { from: [52.52, 13.405], to: [37.7749, -122.4194] },     // Berlin -> SF
  { from: [1.3521, 103.8198], to: [-33.8688, 151.2093] }   // Singapore -> Sydney
];

const DEG = Math.PI / 180;

// Same mapping cobe uses internally, so overlaid aircraft land exactly on the
// globe its shader draws.
function locationToVec3([lat, lon]) {
  const la = lat * DEG;
  const lo = lon * DEG - Math.PI;
  const cosLat = Math.cos(la);
  return [-cosLat * Math.cos(lo), Math.sin(la), cosLat * Math.sin(lo)];
}

// Mirrors cobe's marker vertex shader: rotate by phi/theta, then project
// orthographically. Returns viewBox units plus a visibility flag.
const GLOBE_RADIUS = 0.8;
const VIEW = 1000;

function projectToView(p, phi, theta, elevation) {
  const s = GLOBE_RADIUS + elevation;
  const ax = p[0] * s;
  const ay = p[1] * s;
  const az = p[2] * s;
  const c = Math.cos(theta);
  const d = Math.sin(theta);
  const e = Math.cos(phi);
  const f = Math.sin(phi);

  const lx = e * ax + f * az;
  const ly = f * d * ax + c * ay - e * d * az;
  const lz = -f * c * ax + d * ay + e * c * az;

  return {
    x: (lx * 0.5 + 0.5) * VIEW,
    y: (0.5 - ly * 0.5) * VIEW,
    // Aircraft orbit above the surface, so cobe's silhouette test would let them
    // escape past the limb. Gate on the hemisphere instead and fade them out as
    // they cross the horizon.
    depth: lz,
    opacity: Math.max(0, Math.min(1, lz / 0.12))
  };
}

// Material "flight" glyph, nose pointing up, centred on 12,12
const PLANE_PATH =
  'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';

/** Great-circle interpolation, so aircraft follow the path a real flight would. */
function slerp(a, b, t, omega, sinOmega) {
  if (sinOmega < 1e-6) return a;
  const k0 = Math.sin((1 - t) * omega) / sinOmega;
  const k1 = Math.sin(t * omega) / sinOmega;
  return [
    a[0] * k0 + b[0] * k1,
    a[1] * k0 + b[1] * k1,
    a[2] * k0 + b[2] * k1
  ];
}

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
  arcs = [],
  flights = DEFAULT_FLIGHT_ROUTES,
  showFlights = true,
  flightSpeed = 1,
  flightColor,
  onReady,
  onGlobeClick,
  dark,
  style = {}
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [activeMarker, setActiveMarker] = useState(null);

  // Determine dark mode (prop override or HTML attribute)
  const isDarkMode = dark !== undefined ? dark : (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');

  // Colors
  const primaryRGB = parseColorToRGB(primaryColor, [1, 0.23, 0.19]); // #ff3b30
  const neutralRGB = parseColorToRGB(neutralColor, isDarkMode ? [0.6, 0.6, 0.65] : [0.35, 0.35, 0.4]);
  const glowRGB = parseColorToRGB(glowColor || atmosphereColor, isDarkMode ? [0.25, 0.28, 0.4] : [0.92, 0.92, 0.96]);
  // White reads as an aircraft light on the night globe but disappears on the
  // pale one, so the default follows the theme.
  const flightRGB = parseColorToRGB(flightColor, isDarkMode ? [1, 1, 1] : [0.07, 0.09, 0.15]);

  // Read live inside the loop so speed changes don't restart the globe
  const flightSpeedRef = useRef(flightSpeed);
  flightSpeedRef.current = flightSpeed;

  useEffect(() => {
    let phi = 0;
    let theta = 0.2;

    // ── Flight plan: precompute each great-circle so the loop only interpolates ──
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const TRAIL_SAMPLES = 14;
    const TRAIL_SPAN = 0.13; // how far back the contrail reaches, in route progress
    const PLANE_ELEVATION = 0.05; // cruise just above the surface

    const routes = (showFlights ? flights : []).map((f, i) => {
      const a = locationToVec3(f.from);
      const b = locationToVec3(f.to);
      const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const omega = Math.acos(dot);
      return {
        a,
        b,
        omega,
        sinOmega: Math.sin(omega),
        // Longer legs take proportionally longer, so every aircraft cruises
        // at roughly the same ground speed.
        duration: Math.max(4, omega * 7) / (f.speed || 1),
        progress: f.phase != null ? f.phase : i / Math.max(1, flights.length)
      };
    });

    // Build the aircraft layer once; the loop only rewrites transforms and paths.
    const overlay = overlayRef.current;
    const flightNodes = [];
    if (overlay && routes.length) {
      overlay.innerHTML = '';
      const flightHex = `rgb(${flightRGB.map((v) => Math.round(v * 255)).join(',')})`;

      for (let i = 0; i < routes.length; i++) {
        const trail = document.createElementNS(SVG_NS, 'path');
        trail.setAttribute('fill', 'none');
        trail.setAttribute('stroke', flightHex);
        trail.setAttribute('stroke-width', '3.5');
        trail.setAttribute('stroke-linecap', 'round');
        trail.setAttribute('stroke-opacity', '0.28');

        const plane = document.createElementNS(SVG_NS, 'g');
        const glyph = document.createElementNS(SVG_NS, 'path');
        glyph.setAttribute('d', PLANE_PATH);
        glyph.setAttribute('fill', flightHex);
        glyph.setAttribute('transform', 'translate(-12,-12)');
        plane.appendChild(glyph);

        overlay.appendChild(trail);
        overlay.appendChild(plane);
        flightNodes.push({ trail, plane });
      }
    }
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
        // Seat hub markers on the surface; cobe's default lifts them clear of
        // the sphere, so near the limb they drift off the globe's edge.
        markerElevation: 0,
        opacity: 0.95
      });

      // ══════════ CONTINUOUS 60FPS ANIMATION LOOP ══════════
      // Cobe v2 requires manual requestAnimationFrame calling globeInstance.update()
      let lastTs = 0;
      const animate = (timestamp) => {
        if (isDestroyed) return;

        const dt = lastTs ? Math.min(0.05, (timestamp - lastTs) * 0.001) : 0;
        lastTs = timestamp;

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
          globeInstance.update({ phi, theta });
        }

        // ── Fly the aircraft layer in lockstep with the globe's rotation ──
        if (flightNodes.length) {
          const speed = flightSpeedRef.current;

          for (let i = 0; i < routes.length; i++) {
            const r = routes[i];
            const node = flightNodes[i];
            r.progress = (r.progress + (dt * speed) / r.duration) % 1;

            const at = (t) =>
              projectToView(
                slerp(r.a, r.b, Math.max(0, Math.min(1, t)), r.omega, r.sinOmega),
                phi,
                theta,
                PLANE_ELEVATION
              );

            // Contrail, broken wherever it passes behind the globe
            let d = '';
            let pen = false;
            for (let s = TRAIL_SAMPLES; s >= 1; s--) {
              const t = r.progress - (s / TRAIL_SAMPLES) * TRAIL_SPAN;
              if (t <= 0) {
                pen = false;
                continue;
              }
              const p = at(t);
              if (p.depth <= 0) {
                pen = false;
                continue;
              }
              d += `${pen ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
              pen = true;
            }
            node.trail.setAttribute('d', d);

            const head = at(r.progress);
            if (head.depth > 0) {
              // Heading from a point just behind, measured in screen space so the
              // nose always follows the path as drawn
              const prev = at(r.progress - 0.004);
              const angle = (Math.atan2(head.y - prev.y, head.x - prev.x) * 180) / Math.PI;
              node.plane.setAttribute(
                'transform',
                `translate(${head.x.toFixed(1)} ${head.y.toFixed(1)}) rotate(${(angle + 90).toFixed(1)}) scale(1.5)`
              );
              node.plane.setAttribute('opacity', head.opacity.toFixed(2));
              node.plane.style.display = '';
            } else {
              node.plane.style.display = 'none';
            }
          }
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
  }, [
    isDarkMode,
    autoRotateSpeed,
    showAtmosphere,
    showFlights,
    JSON.stringify(primaryRGB),
    JSON.stringify(flightRGB),
    JSON.stringify(markers),
    JSON.stringify(arcs),
    JSON.stringify(flights)
  ]);

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

      {/* Aircraft layer — projected onto the globe using cobe's own transform */}
      {showFlights && (
        <svg
          ref={overlayRef}
          className="rb-globe-flights"
          aria-hidden="true"
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 2
          }}
        />
      )}

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
