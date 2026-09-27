import React, { useEffect, useRef } from 'react';

/**
 * ClickSpark Component from React Bits
 * Produces subtle particle sparkles on mouse click.
 */
export default function ClickSpark({
  sparkColor = '#ffffff',
  sparkSize = 8,
  sparkRadius = 20,
  sparkCount = 6,
  duration = 400
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleClick = (e) => {
      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / sparkCount;
        return {
          x: e.clientX,
          y: e.clientY,
          angle,
          startTime: now
        };
      });
      sparksRef.current.push(...newSparks);
      // draw only while there are sparks: an always-on loop redrew this
      // full-screen canvas 60 times a second forever, even with nothing in it
      if (!animationId) animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handleClick);

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = time - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const distance = progress * sparkRadius;
        const x = spark.x + Math.cos(spark.angle) * distance;
        const y = spark.y + Math.sin(spark.angle) * distance;
        const currentSize = sparkSize * (1 - progress);

        ctx.fillStyle = sparkColor;
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, 2 * Math.PI);
        ctx.fill();

        return true;
      });

      animationId = sparksRef.current.length ? requestAnimationFrame(animate) : 0;
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  return <canvas ref={canvasRef} className="click-spark-canvas" />;
}
