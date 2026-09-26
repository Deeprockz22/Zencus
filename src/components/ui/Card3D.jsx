import React, { useRef, useState, useCallback } from 'react';

/**
 * Card3D Component (Inspired by Aceternity UI 3D Card Tilt)
 * Calculates pointer coordinates relative to center and tilts in 3D perspective
 * with smooth spring interpolation and specular spotlight glare.
 */
export default function Card3D({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  glareColor = 'rgba(255, 255, 255, 0.15)',
  scale = 1.01,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalised -1 to 1
    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    setTransform({
      rotateX: rotX,
      rotateY: rotY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      glareOpacity: 1
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    });
  }, []);

  return (
    <div
      style={{ perspective: 1000 }}
      className="card-3d-perspective-wrapper"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`card-3d-container relative overflow-hidden transition-transform duration-200 ease-out ${className}`}
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale3d(${transform.glareOpacity > 0 ? scale : 1}, ${transform.glareOpacity > 0 ? scale : 1}, 1)`,
          transformStyle: 'preserve-3d'
        }}
        {...props}
      >
        {/* Children content */}
        <div className="card-3d-inner relative z-10 w-full h-full">
          {children}
        </div>

        {/* Specular glare overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: transform.glareOpacity,
              background: `radial-gradient(circle 350px at ${transform.glareX}% ${transform.glareY}%, ${glareColor}, transparent 80%)`,
              mixBlendMode: 'overlay'
            }}
          />
        )}
      </div>
    </div>
  );
}
